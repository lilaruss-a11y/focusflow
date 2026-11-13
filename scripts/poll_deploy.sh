#!/usr/bin/env zsh
# Poll GitHub Actions for the latest run until it succeeds
while true; do
  result=$(curl -s "https://api.github.com/repos/lilaruss-a11y/focusflow/actions/runs?per_page=1" | grep -E '"status"|"conclusion"')
  echo "$result"
  if echo "$result" | grep -q '"status": "completed"' && echo "$result" | grep -q '"conclusion": "success"'; then
    echo "Deployment succeeded"
    exit 0
  fi
  sleep 10
done
