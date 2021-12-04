# https://help.github.com/en/github/authenticating-to-github/removing-sensitive-data-from-a-repository
# usage: ./fully.....sh  temp.txt

git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch $1" \
  --prune-empty --tag-name-filter cat -- --all
