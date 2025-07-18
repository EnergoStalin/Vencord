git switch dev
gh repo sync $(git ls-remote --get-url origin) -b dev
git pull

git switch roleColorEverywhere
git rebase dev

git switch local
git rebase roleColorEverywhere

tmp="$(mktemp -d)"
trap "rm -rf '$tmp'" EXIT

git clone --depth 1 git@github.com:Max-Herbold/AllCallTimersDiscordPlugin.git "$tmp"
mv -f "$tmp"/allCallTimers/*.tsx -t src/plugins/allCallTimers

git add src/plugins/allCallTimers
git commit -m 'chore(allCallTimers): auto upstream update'

pnpm install
pnpm build
