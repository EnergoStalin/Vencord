git switch dev
gh repo sync $(git ls-remote --get-url origin) -b dev
git pull

git switch roleColorEverywhere
git rebase dev
git push -f

git switch local
git rebase roleColorEverywhere
git push -f

tmp=`mktemp -d`
git clone -b fix-vencord-patch-locations git@github.com:Max-Herbold/AllCallTimersDiscordPlugin.git $tmp
mv -f $tmp/allCallTimers/*.tsx -t src/plugins/allCallTimers
rm -rf $tmp

git add src/plugins/allCallTimers
git commit -m 'chore(allCallTimers): auto upstream update'

pnpm install
pnpm build
