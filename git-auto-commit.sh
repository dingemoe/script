#!/bin/bash

if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "Not a git repository. Please run 'git init' first."
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  git add .
  git commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"
  git push
else
  echo "No changes to commit."
fi
