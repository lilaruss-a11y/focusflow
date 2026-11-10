    // ==============================================
    // CLOUD SYNC ENGINE (Google sign-in + Firestore) & OFFLINE SUPPORT
    // Firestore doc users/{uid} = { data: { <localStorage key>: <string> }, updatedAt, updatedAtMs, deviceId }
    // Every Firebase call is wrapped so the app keeps working offline or if Google is blocked.
    // ==============================================
    const FF_SYNC_KEY_PREFIX = 'focusflow_';
    const FF_SYNC_EXTRA_KEYS = [
      'focusflow_gemini_api_key',
      'focusflow_active_vision_model',
      'focusflow_receipt_aliases'
    ]; // Always synced across devices
    const FF_SYNC_EXCLUDED_KEYS = ['focusflow_app_version']; // per-device install version, not user data
    const FF_DEVICE_ID_KEY = 'ff_device_id';        // per-device, NOT synced
    const FF_DIRTY_KEY = 'ff_local_dirty_ms';       // time of last local change not yet confirmed by the cloud
    const FF_SYNCED_UID_KEY = 'ff_synced_uid';      // which Google account this device last synced with
    const FF_LAST_VERSION_KEY = 'ff_last_synced_version_ms'; // updatedAtMs of the cloud copy this device matches
    const FF_LAST_SYNCED_AT_KEY = 'ff_last_synced_at';       // wall-clock time of last successful sync (for display)
    const FF_UPLOAD_DEBOUNCE_MS = 1500;
    const FF_FIREBASE_SDK_BASE = 'https://www.gstatic.com/firebasejs/10.12.2/';

    function ffLsGet(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } }
    function ffLsSetRaw(key, value) { try { if (ffOrigStorage.set) ffOrigStorage.set.call(window.localStorage, key, value); else window.localStorage.setItem(key, value); } catch (e) {} }
    function ffLsRemoveRaw(key) { try { if (ffOrigStorage.remove) ffOrigStorage.remove.call(window.localStorage, key); else window.localStorage.removeItem(key); } catch (e) {} }

    const ffOrigStorage = { set: null, remove: null, get: null };

    const ffSync = {
      ready: false,          // Firebase loaded & auth state known
      phase: 'idle',         // idle | connecting | unavailable | syncing | error
      auth: null,
      db: null,
      user: null,
      unsubscribe: null,
      reconciled: false,     // first cloud/local comparison done for this sign-in
      applyingRemote: false, // true while writing cloud data into localStorage (prevents echo uploads)
      uploadTimer: null,
      inFlight: 0,
      writeSeq: 0,
      lastAppliedMs: 0,      // newest cloud version applied or uploaded by this device
      lastUploadedJson: null,
      uiTimer: null,
      lastErrorText: ''
    };

    function ffIsSyncedKey(key) {
      if (typeof key !== 'string') return false;
      if (FF_SYNC_EXCLUDED_KEYS.indexOf(key) !== -1) return false;
      return key.indexOf(FF_SYNC_KEY_PREFIX) === 0 || FF_SYNC_EXTRA_KEYS.indexOf(key) !== -1;
    }

    function ffGetDeviceId() {
      let id = ffLsGet(FF_DEVICE_ID_KEY);
      if (!id) {
        try {
          id = (window.crypto && typeof window.crypto.randomUUID === 'function')
            ? window.crypto.randomUUID()
            : ('dev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10));
        } catch (e) {
          id = 'dev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
        }
        ffLsSetRaw(FF_DEVICE_ID_KEY, id);
      }
      return id;
    }

    function ffCollectLocalData() {
      const data = {};
      try {
        const ls = window.localStorage;
        for (let i = 0; i < ls.length; i++) {
          const k = ls.key(i);
          if (ffIsSyncedKey(k)) {
            const v = ls.getItem(k);
            if (typeof v === 'string') data[k] = v;
          }
        }
      } catch (e) {}
      return data;
    }

    function ffStableStringify(obj) {
      const out = {};
      Object.keys(obj || {}).sort().forEach(k => { out[k] = obj[k]; });
      return JSON.stringify(out);
    }

    function ffGetDirtyMs() { return Number(ffLsGet(FF_DIRTY_KEY)) || 0; }
    function ffMarkDirty() { ffLsSetRaw(FF_DIRTY_KEY, String(Date.now())); }
    function ffClearDirty() { ffLsRemoveRaw(FF_DIRTY_KEY); }

    // Watch every localStorage write: a change to a synced key schedules a debounced upload.
    // (Hooks Storage.prototype — assigning localStorage.setItem directly would store a junk item.)
    (function ffInstallStorageHooks() {
      try {
        if (typeof Storage === 'undefined' || !Storage.prototype || Storage.prototype.__ffSyncHooked) return;
        const origSet = Storage.prototype.setItem;
        const origRemove = Storage.prototype.removeItem;
        const origGet = Storage.prototype.getItem;
        ffOrigStorage.set = origSet;
        ffOrigStorage.remove = origRemove;
        ffOrigStorage.get = origGet;
        Storage.prototype.setItem = function(key, value) {
          let changed = false;
          try {
            if (this === window.localStorage && ffIsSyncedKey(String(key))) {
              changed = origGet.call(this, String(key)) !== String(value);
            }
          } catch (e) {}
          const result = origSet.apply(this, arguments); // may throw (e.g. quota) exactly like before
          if (changed) { try { ffOnLocalChange(); } catch (e) {} }
          return result;
        };
        Storage.prototype.removeItem = function(key) {
          let changed = false;
          try {
            if (this === window.localStorage && ffIsSyncedKey(String(key))) {
              changed = origGet.call(this, String(key)) !== null;
            }
          } catch (e) {}
          const result = origRemove.apply(this, arguments);
          if (changed) { try { ffOnLocalChange(); } catch (e) {} }
          return result;
        };
        Storage.prototype.__ffSyncHooked = true;
      } catch (e) {}
    })();

    function ffOnLocalChange() {
      if (ffSync.applyingRemote) return; // writing cloud data locally — never echo it back
      ffMarkDirty();
      if (ffSync.user && ffSync.db) ffScheduleUpload(FF_UPLOAD_DEBOUNCE_MS);
    }

    function ffScheduleUpload(delayMs) {
      try {
        if (ffSync.uploadTimer) clearTimeout(ffSync.uploadTimer);
        ffSync.uploadTimer = setTimeout(() => {
          ffSync.uploadTimer = null;
          ffUploadNow(false);
        }, typeof delayMs === 'number' ? delayMs : FF_UPLOAD_DEBOUNCE_MS);
      } catch (e) {}
      ffUpdateSyncUI();
    }

    function ffUserDocRef() {
      if (!ffSync.db || !ffSync.user) return null;
      return ffSync.db.collection('users').doc(ffSync.user.uid);
    }

    // Upload all synced localStorage keys. Firestore queues the write offline and sends it when back online.
    function ffUploadNow(force) {
      try {
        if (ffSync.uploadTimer) { clearTimeout(ffSync.uploadTimer); ffSync.uploadTimer = null; }
        const ref = ffUserDocRef();
        if (!ref) return Promise.resolve(false);
        const data = ffCollectLocalData();
        const json = ffStableStringify(data);
        if (!force && json === ffSync.lastUploadedJson) {
          // Nothing actually changed compared to the cloud copy (prevents echo loops)
          ffClearDirty();
          ffUpdateSyncUI();
          return Promise.resolve(true);
        }
        const now = Math.max(Date.now(), ffSync.lastAppliedMs + 1);
        const dirtyAtStart = ffGetDirtyMs();
        const seq = ++ffSync.writeSeq;
        ffSync.lastUploadedJson = json;
        ffSync.lastAppliedMs = now;
        ffSync.inFlight++;
        ffSync.phase = 'syncing';
        ffUpdateSyncUI();
        let serverTs = now;
        try { serverTs = firebase.firestore.FieldValue.serverTimestamp(); } catch (e) {}
        return Promise.resolve(ref.set({
          data: data,
          updatedAt: serverTs,
          updatedAtMs: now,
          deviceId: ffGetDeviceId()
        })).then(() => {
          ffSync.inFlight = Math.max(0, ffSync.inFlight - 1);
          if (seq === ffSync.writeSeq) {
            if (ffGetDirtyMs() <= dirtyAtStart) ffClearDirty();
            ffMarkSynced(now);
          }
          ffSync.phase = 'idle';
          ffUpdateSyncUI();
          return true;
        }).catch(err => {
          ffSync.inFlight = Math.max(0, ffSync.inFlight - 1);
          if (seq === ffSync.writeSeq) ffSync.lastUploadedJson = null; // allow retry
          ffHandleError(err);
          // Try again a little later (Firestore also retries automatically when the connection returns)
          if (seq === ffSync.writeSeq && ffSync.user) {
            try {
              if (ffSync.uploadTimer) clearTimeout(ffSync.uploadTimer);
              ffSync.uploadTimer = setTimeout(() => { ffSync.uploadTimer = null; ffUploadNow(false); }, 30000);
            } catch (e) {}
          }
          return false;
        });
      } catch (err) {
        ffHandleError(err);
        return Promise.resolve(false);
      }
    }

    function ffMarkSynced(versionMs) {
      if (versionMs) ffLsSetRaw(FF_LAST_VERSION_KEY, String(versionMs));
      ffLsSetRaw(FF_LAST_SYNCED_AT_KEY, String(Date.now()));
      if (ffSync.user) ffLsSetRaw(FF_SYNCED_UID_KEY, ffSync.user.uid);
      if (ffSync.phase === 'error') ffSync.phase = 'idle';
      ffSync.lastErrorText = '';
    }

    // Write cloud data into localStorage, reload state and redraw — without triggering an upload.
    function ffApplyRemoteData(data, versionMs) {
      ffSync.applyingRemote = true;
      try {
        Object.keys(data || {}).forEach(k => {
          if (ffIsSyncedKey(k) && typeof data[k] === 'string') {
            try { window.localStorage.setItem(k, data[k]); } catch (e) {}
          }
        });
        ffSync.lastAppliedMs = Math.max(ffSync.lastAppliedMs, Number(versionMs) || 0);
        try { 
          loadAppState(); 
          if (Array.isArray(state.events)) {
            state.events = state.events.filter(e => !isDummyOrUnwantedEvent(e));
            localStorage.setItem('focusflow_events', JSON.stringify(state.events));
          }
        } catch (e) { if (typeof console !== 'undefined' && console.warn) console.warn('Cloud data load warning', e); }
        try { rerenderAllFromState(); } catch (e) {}
        // Anything saved during the redraw is still "the cloud copy" — remember it so it isn't re-uploaded
        ffSync.lastUploadedJson = ffStableStringify(ffCollectLocalData());
      } finally {
        ffSync.applyingRemote = false;
      }
      ffClearDirty();
      ffMarkSynced(versionMs);
      ffSync.phase = 'idle';
      ffUpdateSyncUI();
    }

    // First comparison after sign-in (or app start while signed in)
    function ffReconcile(snap) {
      const firstTimeForAccount = ffLsGet(FF_SYNCED_UID_KEY) !== (ffSync.user && ffSync.user.uid);
      if (!snap.exists) {
        // No cloud copy yet → this device becomes the main copy
        ffUploadNow(true);
        return;
      }
      const doc = snap.data() || {};
      const versionMs = Number(doc.updatedAtMs) || 0;
      const lastKnownVersion = Number(ffLsGet(FF_LAST_VERSION_KEY)) || 0;
      const dirtyMs = ffGetDirtyMs();
      if (firstTimeForAccount) {
        // Cloud wins on first sign-in on this device
        ffApplyRemoteData(doc.data || {}, versionMs);
      } else if (dirtyMs && dirtyMs > versionMs) {
        // This device has newer, unsynced changes (e.g. made offline)
        ffSync.lastAppliedMs = Math.max(ffSync.lastAppliedMs, versionMs);
        ffUploadNow(true);
      } else if (versionMs > lastKnownVersion || dirtyMs) {
        // Cloud has a newer copy than this device
        ffApplyRemoteData(doc.data || {}, versionMs);
      } else {
        // Already up to date
        ffSync.lastAppliedMs = Math.max(ffSync.lastAppliedMs, versionMs);
        ffSync.lastUploadedJson = ffStableStringify(doc.data || {});
        ffMarkSynced(versionMs);
        ffSync.phase = 'idle';
        ffUpdateSyncUI();
      }
    }

    function ffHandleSnapshot(snap) {
      try {
        if (!snap) return;
        if (snap.metadata && snap.metadata.hasPendingWrites) return; // our own not-yet-sent write
        if (!ffSync.reconciled) {
          // An empty answer from the offline cache doesn't mean the cloud copy is missing — wait for the server
          if (!snap.exists && snap.metadata && snap.metadata.fromCache) return;
          ffSync.reconciled = true;
          ffReconcile(snap);
          return;
        }
        if (!snap.exists) return;
        const doc = snap.data() || {};
        const versionMs = Number(doc.updatedAtMs) || 0;
        if (doc.deviceId === ffGetDeviceId()) return; // our own upload coming back
        if (versionMs <= ffSync.lastAppliedMs) return; // older than what we have
        if (ffGetDirtyMs() > versionMs) { ffScheduleUpload(300); return; } // our local edit is newer
        ffApplyRemoteData(doc.data || {}, versionMs);
      } catch (e) {
        ffHandleError(e);
      }
    }

    function ffSubscribe() {
      try {
        if (ffSync.unsubscribe) { try { ffSync.unsubscribe(); } catch (e) {} ffSync.unsubscribe = null; }
        const ref = ffUserDocRef();
        if (!ref) return;
        ffSync.unsubscribe = ref.onSnapshot(ffHandleSnapshot, err => ffHandleError(err));
      } catch (e) {
        ffHandleError(e);
      }
    }

    function ffOnAuthChanged(user) {
      try {
        if (ffSync.unsubscribe) { try { ffSync.unsubscribe(); } catch (e) {} ffSync.unsubscribe = null; }
        if (ffSync.uploadTimer) { clearTimeout(ffSync.uploadTimer); ffSync.uploadTimer = null; }
        ffSync.user = user || null;
        ffSync.ready = true;
        ffSync.reconciled = false;
        ffSync.lastUploadedJson = null;
        ffSync.lastAppliedMs = 0;
        if (!user) {
          ffSync.phase = 'idle';
          ffUpdateSyncUI();
          return;
        }
        ffSync.phase = 'syncing';
        ffUpdateSyncUI();
        ffSubscribe();
      } catch (e) {
        ffHandleError(e);
      }
    }

    function ffLoadScript(src) {
      return new Promise((resolve, reject) => {
        try {
          const s = document.createElement('script');
          s.src = src;
          s.async = false;
          s.onload = () => resolve();
          s.onerror = () => reject(new Error('Could not load ' + src));
          document.head.appendChild(s);
        } catch (e) { reject(e); }
      });
    }

    async function ffLoadFirebaseSdk() {
      if (window.firebase && window.firebase.auth && window.firebase.firestore) return;
      const files = ['firebase-app-compat.js', 'firebase-auth-compat.js', 'firebase-firestore-compat.js'];
      for (const f of files) await ffLoadScript(FF_FIREBASE_SDK_BASE + f);
    }

    function ffIsStandaloneApp() {
      try {
        return window.navigator.standalone === true ||
          (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
      } catch (e) { return false; }
    }

    async function initCloudSync() {
      try {
        ffGetDeviceId();
        try {
          window.addEventListener('online', () => {
            ffUpdateSyncUI();
            if (ffSync.user && ffGetDirtyMs()) ffScheduleUpload(500);
          });
          window.addEventListener('offline', () => ffUpdateSyncUI());
        } catch (e) {}
        try { if (!ffSync.uiTimer) ffSync.uiTimer = setInterval(() => ffUpdateSyncUI(), 30000); } catch (e) {}
        ffUpdateSyncUI();
        if (!FIREBASE_CONFIG) return; // Cloud sync not set up yet — app works locally exactly as before
        if (location.protocol === 'file:') return; // Google sign-in needs the hosted (https) version

        ffSync.phase = 'connecting';
        ffUpdateSyncUI();
        try {
          await ffLoadFirebaseSdk();
        } catch (e) {
          ffSync.phase = 'unavailable';
          ffUpdateSyncUI();
          return;
        }

        try {
          if (!firebase.apps || !firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
          ffSync.db = firebase.firestore();
          try {
            await ffSync.db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
          } catch (e) {}
          ffSync.auth = firebase.auth();
        } catch (e) {
          ffSync.phase = 'unavailable';
          ffUpdateSyncUI();
          return;
        }

        try { await ffSync.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); } catch (e) {}
        try {
          await ffSync.auth.getRedirectResult();
        } catch (e) {
          ffSync.lastErrorText = ffFriendlyError(e);
        }
        try {
          ffSync.auth.onAuthStateChanged(user => ffOnAuthChanged(user), err => ffHandleError(err));
        } catch (e) {
          ffHandleError(e);
        }
      } catch (e) {
        ffHandleError(e);
      }
    }

    async function ffSignIn() {
      try {
        if (!FIREBASE_CONFIG) { ffUpdateSyncUI(); return; }
        if (location.protocol === 'file:') { ffUpdateSyncUI(); return; }
        if (!ffSync.auth || typeof firebase === 'undefined') {
          ffSync.lastErrorText = navigator.onLine === false
            ? "You're offline – connect to the internet to sign in."
            : 'Still connecting… please try again in a moment.';
          ffUpdateSyncUI();
          return;
        }
        if (navigator.onLine === false) {
          ffSync.lastErrorText = "You're offline – connect to the internet to sign in.";
          ffUpdateSyncUI();
          return;
        }
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/calendar.events');
        provider.addScope('https://www.googleapis.com/auth/calendar');
        ffSync.lastErrorText = '';
        try {
          const res = await ffSync.auth.signInWithPopup(provider);
          if (res && res.credential && res.credential.accessToken) {
            window._gcalSessionExpired = false;
            localStorage.setItem('focusflow_gcal_oauth_token', res.credential.accessToken);
            localStorage.setItem('focusflow_gcal_user_email', (res.user && res.user.email) || '');
            localStorage.setItem('focusflow_gcal_token_obtained_at', String(Date.now()));
            localStorage.setItem('focusflow_gcal_last_sync_time', String(Date.now()));
            try {
              updateGoogleCalendarDirectUI();
              syncGoogleCalendarDirectNow(false);
            } catch (e) {}
          }
        } catch (e) {
          const code = (e && e.code) || '';
          if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request' || code === 'auth/user-cancelled') {
            ffSync.lastErrorText = 'Sign-in was cancelled.';
            ffUpdateSyncUI();
            return;
          }
          if (code === 'auth/popup-blocked') {
            ffSync.lastErrorText = 'Pop-up blocked. Please tap "Allow Pop-ups" in your browser bar to sign in.';
            ffUpdateSyncUI();
            return;
          }
          if (code === 'auth/unauthorized-domain') {
            ffSync.lastErrorText = `Domain "${window.location.hostname}" needs authorization in Firebase Console (Authentication → Settings → Authorized domains).`;
            ffUpdateSyncUI();
            return;
          }
          throw e;
        }
      } catch (e) {
        ffSync.lastErrorText = ffFriendlyError(e);
        ffUpdateSyncUI();
      } finally {
        resetViewportZoom();
      }
    }

    async function ffSignInWithEmail() {
      try {
        if (!FIREBASE_CONFIG) { ffUpdateSyncUI(); return; }
        const emailInput = document.getElementById('ff-email-input');
        const passInput = document.getElementById('ff-password-input');
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passInput ? passInput.value.trim() : '';

        if (!email || !password) {
          ffSync.lastErrorText = "Please enter your email and a password.";
          ffUpdateSyncUI();
          return;
        }

        if (password.length < 6) {
          ffSync.lastErrorText = "Password must be at least 6 characters.";
          ffUpdateSyncUI();
          return;
        }

        ffSync.phase = 'syncing';
        ffSync.lastErrorText = 'Signing in…';
        ffUpdateSyncUI();

        try {
          await ffSync.auth.signInWithEmailAndPassword(email, password);
        } catch (err) {
          if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
            try {
              await ffSync.auth.createUserWithEmailAndPassword(email, password);
            } catch (createErr) {
              if (createErr.code === 'auth/email-already-in-use') {
                ffSync.lastErrorText = "Account exists, but password was incorrect.";
              } else {
                ffSync.lastErrorText = createErr.message || "Sign-up failed.";
              }
              ffSync.phase = 'error';
              ffUpdateSyncUI();
              return;
            }
          } else if (err.code === 'auth/wrong-password') {
            ffSync.lastErrorText = "Incorrect password. Please try again.";
            ffSync.phase = 'error';
            ffUpdateSyncUI();
            return;
          } else if (err.code === 'auth/operation-not-allowed') {
            ffSync.lastErrorText = "Enable Email/Password in Firebase Console (Authentication → Sign-in method).";
            ffSync.phase = 'error';
            ffUpdateSyncUI();
            return;
          } else {
            ffSync.lastErrorText = err.message || "Sign-in error.";
            ffSync.phase = 'error';
            ffUpdateSyncUI();
            return;
          }
        }
      } catch (e) {
        ffHandleError(e);
      }
    }

    async function ffSignOut() {
      try {
        if (ffSync.uploadTimer) { clearTimeout(ffSync.uploadTimer); ffSync.uploadTimer = null; }
        if (ffSync.user && ffGetDirtyMs()) { try { await ffUploadNow(false); } catch (e) {} }
        if (ffSync.unsubscribe) { try { ffSync.unsubscribe(); } catch (e) {} ffSync.unsubscribe = null; }
        if (ffSync.auth) await ffSync.auth.signOut();
      } catch (e) {
        ffSync.lastErrorText = ffFriendlyError(e);
      }
      ffUpdateSyncUI();
    }

    async function ffSyncNow() {
      try {
        if (!ffSync.user || !ffSync.db) { ffUpdateSyncUI(); return; }
        if (navigator.onLine === false) {
          ffSync.lastErrorText = '';
          ffUpdateSyncUI();
          return;
        }
        ffSync.phase = 'syncing';
        ffUpdateSyncUI();
        const localJson = ffStableStringify(ffCollectLocalData());
        if (ffGetDirtyMs() || localJson !== ffSync.lastUploadedJson) {
          await ffUploadNow(false);
          return;
        }
        // Nothing new here — check the cloud for changes from other devices
        const ref = ffUserDocRef();
        let snap = null;
        try { snap = await ref.get({ source: 'server' }); } catch (e) { snap = await ref.get(); }
        if (snap && snap.exists) {
          const doc = snap.data() || {};
          const versionMs = Number(doc.updatedAtMs) || 0;
          if (doc.deviceId !== ffGetDeviceId() && versionMs > ffSync.lastAppliedMs) {
            ffApplyRemoteData(doc.data || {}, versionMs);
            return;
          }
          ffMarkSynced(versionMs);
        } else if (snap && !snap.exists) {
          await ffUploadNow(true);
          return;
        }
        ffSync.phase = 'idle';
        ffUpdateSyncUI();
      } catch (e) {
        ffHandleError(e);
      }
    }

    function ffFriendlyError(e) {
      const code = (e && e.code) || '';
      if (code.indexOf('network') !== -1 || code === 'unavailable' || navigator.onLine === false) return "You're offline – will sync when back online.";
      if (code === 'auth/unauthorized-domain') return "Sign-in isn't allowed on this web address yet (add it under Firebase → Authentication → Settings → Authorized domains).";
      if (code === 'auth/operation-not-allowed') return 'Google sign-in is not switched on yet (Firebase → Authentication → Sign-in method).';
      if (code === 'permission-denied') return "The cloud didn't accept this account – check the Firestore security rules.";
      if (code === 'invalid-argument' || code === 'resource-exhausted') return 'Too much data to sync in one go.';
      if (code === 'auth/popup-blocked') return 'Your browser blocked the sign-in window – please try again.';
      return "Couldn't sync just now – will try again.";
    }

    function ffHandleError(e) {
      try {
        if (typeof console !== 'undefined' && console.warn) console.warn('Cloud sync:', e);
        ffSync.phase = 'error';
        ffSync.lastErrorText = ffFriendlyError(e);
        ffUpdateSyncUI();
      } catch (err) {}
    }

    function ffRelativeTime(ms) {
      if (!ms) return 'Never';
      const diff = Math.max(0, Date.now() - ms);
      if (diff < 60000) return 'just now';
      const mins = Math.round(diff / 60000);
      if (mins < 60) return mins + (mins === 1 ? ' minute ago' : ' minutes ago');
      const hrs = Math.round(mins / 60);
      if (hrs < 24) return hrs + (hrs === 1 ? ' hour ago' : ' hours ago');
      try { return new Date(ms).toLocaleString(); } catch (e) { return 'a while ago'; }
    }

    function ffComputeStatus() {
      const lastAt = Number(ffLsGet(FF_LAST_SYNCED_AT_KEY)) || 0;
      if (!FIREBASE_CONFIG) return { text: 'Cloud sync not set up yet', short: 'Sync', tone: 'off' };
      if (location.protocol === 'file:') return { text: 'Open the online version of FocusFlow to use cloud sync', short: 'Sync', tone: 'off' };
      if (ffSync.phase === 'unavailable') {
        return navigator.onLine === false
          ? { text: 'Offline – your data is safe on this device', short: 'Offline', tone: 'warn' }
          : { text: "Cloud sync couldn't start – your data is safe on this device", short: 'Sync', tone: 'warn' };
      }
      if (!ffSync.ready) {
        return navigator.onLine === false
          ? { text: 'Offline – will sync when back online', short: 'Offline', tone: 'warn' }
          : { text: 'Connecting…', short: 'Sync', tone: 'busy' };
      }
      if (!ffSync.user) return { text: 'Not signed in', short: 'Sign in', tone: 'off' };
      if (navigator.onLine === false) return { text: 'Offline – will sync when back online', short: 'Offline', tone: 'warn' };
      if (ffSync.phase === 'error') return { text: ffSync.lastErrorText || "Couldn't sync just now – will try again", short: 'Retry', tone: 'warn' };
      if (ffSync.phase === 'syncing' || ffSync.uploadTimer || ffSync.inFlight > 0) return { text: 'Syncing…', short: 'Syncing', tone: 'busy' };
      if (lastAt) return { text: 'Synced ' + ffRelativeTime(lastAt), short: 'Synced', tone: 'ok' };
      return { text: 'Signed in', short: 'Synced', tone: 'ok' };
    }

    function ffUpdateSyncUI() {
      try {
        if (typeof document === 'undefined' || !document.getElementById) return;
        const st = ffComputeStatus();
        const toneDot = { ok: 'bg-pastel-mint', busy: 'bg-pastel-sky animate-pulse', warn: 'bg-pastel-butter', off: 'bg-slate-500' };
        const pill = document.getElementById('ff-sync-pill');
        const dot = document.getElementById('ff-sync-dot');
        const label = document.getElementById('ff-sync-pill-label');
        if (pill) pill.title = 'Cloud sync: ' + st.text;
        if (dot) dot.className = 'absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full ' + (toneDot[st.tone] || toneDot.off);
        if (label) label.textContent = st.short;

        const statusEl = document.getElementById('ff-sync-status-text');
        const emailEl = document.getElementById('ff-sync-email');
        const lastEl = document.getElementById('ff-sync-last');
        const helpEl = document.getElementById('ff-sync-help');
        const signInBtn = document.getElementById('ff-sync-signin-btn');
        const syncNowBtn = document.getElementById('ff-sync-now-btn');
        const signOutBtn = document.getElementById('ff-sync-signout-btn');
        const linkBox = document.getElementById('ff-link-password-box');
        if (linkBox) {
          linkBox.classList.toggle('hidden', !ffSync.user);
          const collapsed = document.getElementById('ff-link-password-collapsed');
          const expanded = document.getElementById('ff-link-password-expanded');
          if (collapsed && expanded) {
            // Minimized / collapsed by default! User must click it to expand.
            if (!state.passwordBoxUserExpanded) {
              collapsed.classList.remove('hidden');
              expanded.classList.add('hidden');
            }
          }
        }
        const toneText = { ok: 'text-pastel-mint', busy: 'text-pastel-sky', warn: 'text-pastel-butter', off: 'text-slate-200' };
        if (statusEl) {
          statusEl.textContent = st.text;
          statusEl.className = 'text-right font-semibold ' + (toneText[st.tone] || toneText.off);
        }
        if (emailEl) emailEl.textContent = (ffSync.user && (ffSync.user.email || ffSync.user.displayName)) || 'Not signed in';
        if (lastEl) {
          const lastAt = Number(ffLsGet(FF_LAST_SYNCED_AT_KEY)) || 0;
          lastEl.textContent = lastAt ? (ffRelativeTime(lastAt) === 'just now' ? 'Just now' : ffRelativeTime(lastAt)) : 'Never';
        }
        const configured = !!FIREBASE_CONFIG && location.protocol !== 'file:';
        const signedIn = !!ffSync.user;
        if (helpEl) {
          let help;
          if (!FIREBASE_CONFIG) help = "Cloud sync hasn't been switched on for this copy of FocusFlow yet. Your data is still saved on this device.";
          else if (location.protocol === 'file:') help = 'Google sign-in only works when FocusFlow is opened from its web address (not from a downloaded file). Your data is still saved on this device.';
          else if (!signedIn) help = 'Sign in with your Google account to back up your planner and see the same data on your phone and computer.';
          else help = 'Changes save to the cloud automatically. You can keep using FocusFlow offline – it catches up when you reconnect.';
          if (ffSync.lastErrorText && st.tone !== 'ok') help = ffSync.lastErrorText + ' ' + help;
          helpEl.textContent = help;
        }
        const emailForm = document.getElementById('ff-sync-email-form');
        const divider = document.getElementById('ff-sync-divider');
        if (emailForm) emailForm.classList.toggle('hidden', !configured || signedIn);
        if (divider) divider.classList.toggle('hidden', !configured || signedIn);
        if (signInBtn) signInBtn.classList.toggle('hidden', !configured || signedIn);
        if (syncNowBtn) syncNowBtn.classList.toggle('hidden', !signedIn);
        if (signOutBtn) signOutBtn.classList.toggle('hidden', !signedIn);
      } catch (e) {}
    }

    function openSyncModal() {
      try {
        ffUpdateSyncUI();
        const modal = document.getElementById('ff-sync-modal');
        if (modal) modal.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
      } catch (e) {}
    }

    function closeSyncModal() {
      try {
        const modal = document.getElementById('ff-sync-modal');
        if (modal) modal.classList.add('hidden');
      } catch (e) {}
    }

    // Offline support: service worker caches the app + libraries (only works on https or localhost)
        // Force Cache-Busting and App Update for iPhone Standalone PWAs
    function forceReloadLatestApp() {
      alertBox("Clearing cached PWA assets and reloading newest build...", "Updating FocusFlow");
      if ('caches' in window) {
        caches.keys().then(names => Promise.all(names.map(name => caches.delete(name)))).then(() => {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(regs => Promise.all(regs.map(r => r.unregister()))).then(() => {
              window.location.reload(true);
            });
          } else {
            window.location.reload(true);
          }
        }).catch(() => {
          window.location.reload(true);
        });
      } else {
        window.location.reload(true);
      }
    }

    function showAppUpdateToast(reg) {
      if (document.getElementById('pwa-update-toast')) return;
      const toast = document.createElement('div');
      toast.id = 'pwa-update-toast';
      toast.className = "fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] bg-[#1e2638] border-2 border-pastel-mint text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 cursor-pointer transition active:scale-95";
      toast.style.boxShadow = "0 10px 30px rgba(0,0,0,0.6), 0 0 15px rgba(110,231,183,0.3)";
      toast.innerHTML = '<span class="text-xl animate-pulse">✨</span>' +
        '<div class="text-left text-xs pr-2">' +
        '  <div class="font-bold text-pastel-mint">New Update Ready!</div>' +
        '  <div class="text-slate-300 text-[11px]">Tap here to reload the latest version</div>' +
        '</div>' +
        '<button class="ml-1 px-2.5 py-1 bg-pastel-mint text-dark-base rounded-lg font-bold text-xs">Update</button>';
      toast.onclick = () => {
        toast.innerHTML = '<span class="text-xs text-pastel-mint font-bold px-4 py-2">Updating...</span>';
        if (reg && reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        setTimeout(() => {
          window.location.reload(true);
        }, 300);
      };
      document.body.appendChild(toast);
    }

    function ffRegisterServiceWorker() {
      try {
        if (!('serviceWorker' in navigator)) return;
        const host = location.hostname;
        if (!(location.protocol === 'https:' || host === 'localhost' || host === '127.0.0.1')) return;

        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload(true);
          }
        });

        navigator.serviceWorker.register('./sw.js?v=3.9.0').then((reg) => {
          if (!reg) return;

          if (reg.waiting) {
            showAppUpdateToast(reg);
          }

          reg.addEventListener('updatefound', () => {
            const worker = reg.installing;
            if (worker) {
              worker.addEventListener('statechange', () => {
                if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                  showAppUpdateToast(reg);
                }
              });
            }
          });

          window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
              reg.update().catch(() => {});
            }
          });
        }).catch(() => {});
      } catch (e) {}
    }

// ==============================================
    // TIME ESTIMATION & CALIBRATION ENGINE
    // ==============================================
    function togglePlanVsReality() {
      state.showPlanVsReality = !state.showPlanVsReality;
      const btn = document.getElementById('btn-toggle-plan-reality');
      if (btn) {
        if (state.showPlanVsReality) {
          btn.className = "h-7 sm:h-8 px-2 sm:px-3 rounded-xl bg-pastel-lavender text-slate-950 border border-pastel-lavender shadow-md shadow-pastel-lavender/30 transition active:scale-95 flex items-center justify-center gap-1.5 sm:flex-1 shadow-sm shrink-0";
          btn.innerHTML = `<i data-lucide="split" class="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" id="icon-plan-reality"></i><span class="hidden sm:inline text-xs font-bold" id="label-plan-reality">Reality ON</span>`;
          alertBox("Plan vs Reality view active: Comparing scheduled estimates to actual execution time side-by-side with elasticity delta badges.", "Plan vs Reality");
        } else {
          btn.className = "h-7 sm:h-8 px-2 sm:px-3 rounded-xl bg-dark-base border border-dark-border text-pastel-lavender hover:text-white text-xs transition active:scale-95 flex items-center justify-center gap-1.5 sm:flex-1 shadow-sm shrink-0";
          btn.innerHTML = `<i data-lucide="split" class="w-3.5 h-3.5 text-pastel-lavender stroke-2" id="icon-plan-reality"></i><span class="hidden sm:inline text-xs text-slate-300 font-medium" id="label-plan-reality">Reality</span>`;
        }
      }
      renderStructuredCalendarGrid();
      renderCompactTimelineListView();
      if (window.lucide) lucide.createIcons();
    }

    function openEstimationAccuracyModal() {
      const modal = document.getElementById('time-calibration-modal');
      if (!modal) return;
      modal.classList.remove('hidden');

      const sel = document.getElementById('calib-event-select');
      if (sel) {
        sel.innerHTML = '';
        const dayEvents = (typeof getEventsForSelectedDay === 'function') ? getEventsForSelectedDay() : (state.events || []);
        if (dayEvents.length === 0) {
          sel.innerHTML = '<option value="">No events scheduled today</option>';
        } else {
          dayEvents.forEach(e => {
            const opt = document.createElement('option');
            opt.value = e.id;
            opt.textContent = `${e.title} (${e.duration}m planned ${e.actualDuration ? '• ' + e.actualDuration + 'm actual' : ''})`;
            sel.appendChild(opt);
          });
        }
      }

      renderCalibrationChart();
      if (window.lucide) lucide.createIcons();
      playChime('bell');
    }

    function closeEstimationAccuracyModal() {
      const modal = document.getElementById('time-calibration-modal');
      if (modal) modal.classList.add('hidden');
    }

    function renderCalibrationChart() {
      const container = document.getElementById('calibration-chart-container');
      if (!container) return;

      const history = state.timeEstimationHistory || [];
      if (history.length === 0) {
        container.innerHTML = `
          <div class="text-center py-8 px-4 text-slate-400 text-xs space-y-2">
            <div class="text-2xl">🌱</div>
            <div class="font-bold text-white text-sm">Clean Slate Ready for Real Data</div>
            <div class="max-w-md mx-auto text-slate-400 leading-relaxed">
              All demo sample records cleared! As you log actual completion times for your events using <strong>⏱️ Save Reality</strong> or the log tool below, your real trajectory and convergence curves will appear here.
            </div>
          </div>
        `;
        const scoreEl = document.getElementById('calib-stat-score');
        const driftEl = document.getElementById('calib-stat-drift');
        const totalEl = document.getElementById('calib-stat-total');
        if (scoreEl) scoreEl.textContent = `100%`;
        if (driftEl) driftEl.textContent = `0m`;
        if (totalEl) totalEl.textContent = `0`;
        return;
      }

      const w = 540;
      const h = 300;
      const padL = 50;
      const padR = 20;
      const padT = 12;
      const padB = 28;

      const maxData = Math.max(30, ...history.map(d => Math.max(d.plannedMin, d.actualMin)));
      const maxVal = Math.ceil((maxData + 5) / 10) * 10;
      const minVal = 0;

      const getX = (i) => padL + (i / Math.max(1, history.length - 1)) * (w - padL - padR);
      const getY = (v) => h - padB - ((v - minVal) / (maxVal - minVal)) * (h - padT - padB);

      let plannedPoints = [];
      let actualPoints = [];
      let svgPills = '';

      history.forEach((d, i) => {
        const x = getX(i);
        const yP = getY(d.plannedMin);
        const yA = getY(d.actualMin);
        plannedPoints.push(`${x},${yP}`);
        actualPoints.push(`${x},${yA}`);

        const delta = d.actualMin - d.plannedMin;
        const deltaLabel = delta > 0 ? `+${delta}m` : (delta < 0 ? `${delta}m` : '0m');
        const badgeColor = delta > 0 ? '#fda4af' : (delta < 0 ? '#7dd3fc' : '#6ee7b7');

        svgPills += `
          <line x1="${x}" y1="${yP}" x2="${x}" y2="${yA}" stroke="rgba(255,255,255,0.18)" stroke-dasharray="2,2" stroke-width="1.5" />
          <circle cx="${x}" cy="${yP}" r="4" fill="#c4b5fd" stroke="#0f172a" stroke-width="1.5" />
          <rect x="${x - 3.5}" y="${yA - 3.5}" width="7" height="7" rx="1.5" fill="#fda4af" stroke="#0f172a" stroke-width="1.5" />
          <text x="${x}" y="${h - 8}" fill="#94a3b8" font-size="9" text-anchor="middle" font-family="monospace">${d.date.split(' ')[0]} ${d.title.split(' ')[0]}</text>
          <text x="${x}" y="${Math.min(yP, yA) - 6}" fill="${badgeColor}" font-size="8.5" font-weight="bold" text-anchor="middle" font-family="monospace">${deltaLabel}</text>
        `;
      });

      const plannedPathD = 'M ' + plannedPoints.join(' L ');
      const actualPathD = 'M ' + actualPoints.join(' L ');

      let gridLines = '';
      [0, 30, 60, 90, 120, 150].forEach(val => {
        if (val <= maxVal) {
          const y = getY(val);
          gridLines += `
            <line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
            <text x="${padL - 8}" y="${y + 4}" fill="#94a3b8" font-size="11" font-weight="bold" text-anchor="end" font-family="monospace">${val}m</text>
          `;
        }
      });

      container.innerHTML = `
        <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" class="w-full h-full overflow-visible">
          ${gridLines}
          <path d="${plannedPathD}" fill="none" stroke="#c4b5fd" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          <path d="${actualPathD}" fill="none" stroke="#fda4af" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          ${svgPills}
        </svg>
      `;

      let totalPlanned = 0;
      let totalActual = 0;
      let flexibleDrifts = [];
      history.forEach(h => {
        totalPlanned += h.plannedMin;
        totalActual += h.actualMin;
        if (!h.isFixed) flexibleDrifts.push(h.actualMin - h.plannedMin);
      });
      const avgFlexDrift = flexibleDrifts.length > 0 ? Math.round(flexibleDrifts.reduce((a, b) => a + b, 0) / flexibleDrifts.length) : 18;
      const accuracyScore = Math.max(50, Math.min(100, Math.round(100 - (Math.abs(totalActual - totalPlanned) / totalPlanned * 100))));

      const scoreEl = document.getElementById('calib-stat-score');
      const driftEl = document.getElementById('calib-stat-drift');
      const totalEl = document.getElementById('calib-stat-total');
      if (scoreEl) scoreEl.textContent = `${accuracyScore}%`;
      if (driftEl) driftEl.textContent = `+${avgFlexDrift}m`;
      if (totalEl) totalEl.textContent = String(history.length);
    }

    function logActualEventDurationFromModal() {
      const select = document.getElementById('calib-event-select');
      const input = document.getElementById('calib-actual-minutes-input');
      if (!select || !input) return;
      const eventId = select.value;
      const actualMin = parseInt(input.value, 10);
      if (!eventId || isNaN(actualMin) || actualMin <= 0) {
        alertBox("Please select an event and enter actual minutes taken.", "Missing Value");
        return;
      }
      const ev = (state.events || []).find(e => e.id === eventId);
      if (!ev) return;
      ev.actualDuration = actualMin;

      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      state.timeEstimationHistory.push({
        id: `te-${Date.now()}`,
        date: dateStr,
        title: ev.title,
        category: ev.category || 'focus',
        isFixed: Boolean(ev.isFixedAnchor),
        plannedMin: ev.duration,
        actualMin: actualMin,
        deltaMin: actualMin - ev.duration
      });
      if (state.timeEstimationHistory.length > 15) state.timeEstimationHistory.shift();

      saveAppState();
      renderCalibrationChart();
      renderStructuredCalendarGrid();
      renderCompactTimelineListView();
      if (window.lucide) lucide.createIcons();
      playChime('bell');
      alertBox(`Logged ${actualMin}m reality for "${ev.title}". Calibration graph updated!`, "Reality Logged");
      input.value = '';
    }

    function promptQuickLogActualDuration(eventId) {
      const ev = (state.events || []).find(e => e.id === eventId);
      if (!ev) return;
      const currentVal = ev.actualDuration || ev.duration;
      const entered = prompt(`Enter actual minutes spent on "${ev.title}" (Planned: ${ev.duration}m):`, String(currentVal));
      if (entered !== null) {
        const val = parseInt(entered, 10);
        if (!isNaN(val) && val > 0) {
          ev.actualDuration = val;
          const now = new Date();
          const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          state.timeEstimationHistory.push({
            id: `te-${Date.now()}`,
            date: dateStr,
            title: ev.title,
            category: ev.category || 'focus',
            isFixed: Boolean(ev.isFixedAnchor),
            plannedMin: ev.duration,
            actualMin: val,
            deltaMin: val - ev.duration
          });
          if (state.timeEstimationHistory.length > 15) state.timeEstimationHistory.shift();
          saveAppState();
          renderStructuredCalendarGrid();
      renderCompactTimelineListView();
      if (window.lucide) lucide.createIcons();
          playChime('bell');
        }
      }
    }


    // ==============================================
