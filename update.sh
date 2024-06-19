git checkout main
gh repo sync $(git ls-remote --get-url origin) -b main
git pull

git checkout roleColorEverywhere
git rebase main
git push -f

git checkout local
git rebase roleColorEverywhere
git push -f

pnpm install
pnpm build
