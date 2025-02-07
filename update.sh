git checkout dev
gh repo sync $(git ls-remote --get-url origin) -b dev
git pull

git checkout roleColorEverywhere
git rebase dev
git push -f

git checkout local
git rebase roleColorEverywhere
git push -f

pnpm install
pnpm build
