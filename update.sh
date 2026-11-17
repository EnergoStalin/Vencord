#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

if [[ -n "$(git status --porcelain)" ]]; then
    echo "Commit or stash working tree changes before updating." >&2
    exit 1
fi

if [[ -d "$(git rev-parse --git-path rebase-merge)" || -d "$(git rev-parse --git-path rebase-apply)" || -f "$(git rev-parse --git-path MERGE_HEAD)" ]]; then
    echo "Finish the current rebase or merge before updating." >&2
    exit 1
fi

git fetch upstream dev
git switch dev
git merge --ff-only upstream/dev

git switch roleColorEverywhere
git rebase dev

git switch local
git rebase roleColorEverywhere

tmp="$(mktemp -d "${TMPDIR:-/tmp/opencode}/vencord-update.XXXXXXXX")"
trap 'rm -rf -- "$tmp"' EXIT

git clone --depth 1 git@github.com:Max-Herbold/AllCallTimersDiscordPlugin.git "$tmp"
mv -f "$tmp"/allCallTimers/*.tsx -t src/plugins/allCallTimers

git add src/plugins/allCallTimers
if ! git diff --cached --quiet -- src/plugins/allCallTimers; then
    git commit -m 'chore(allCallTimers): auto upstream update' -- src/plugins/allCallTimers
fi

pnpm install
pnpm build --dev
pnpm test:ts
