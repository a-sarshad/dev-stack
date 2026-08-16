# Git — خطاهای رایج و راه حل
> universal — مستقل از پروژه
> updated: 2026-05-18

---

## 🔒 Lock file errors

### `index.lock` یا `HEAD.lock` موجوده

**پیام خطا:**
```
fatal: Unable to create '.git/index.lock': File exists.
fatal: cannot lock ref 'HEAD': Unable to create '.git/HEAD.lock': File exists.
```

**علت:** یه فرآیند git قبلی کرش کرده و lock file رو پاک نکرده.

**راه حل:**
```bash
# پیدا کردن همه lock fileها
find /path/to/repo/.git -name "*.lock"

# پاک کردن (هر کدوم که وجود داشت)
rm "/path/to/repo/.git/index.lock"
rm "/path/to/repo/.git/HEAD.lock"

# بعد دوباره commit کن
git commit -m "..."
```

> **نکته:** اگه GitHub Desktop همین خطا داد، از Terminal پاک کن — Desktop نمی‌تونه خودش lock رو حذف کنه.

**اگه `rm` هم کار نکرد (permission denied):** از temp index + git plumbing استفاده کن:
```bash
cd "/path/to/repo"

# مرحله ۱ — stage با temp index (دور زدن index.lock)
export GIT_INDEX_FILE=/tmp/git-temp-index
cp .git/index /tmp/git-temp-index
git add -A

# مرحله ۲ — commit با plumbing (دور زدن HEAD.lock)
TREE=$(git write-tree)
PARENT=$(cat .git/refs/heads/master)
COMMIT=$(GIT_AUTHOR_NAME="Ali" GIT_AUTHOR_EMAIL="asarshad@gmail.com" \
         GIT_COMMITTER_NAME="Ali" GIT_COMMITTER_EMAIL="asarshad@gmail.com" \
         git commit-tree "$TREE" -p "$PARENT" -m "your message here")
echo "$COMMIT" > .git/refs/heads/master

unset GIT_INDEX_FILE
git log --oneline -3   # تأیید
```

---

## 🔀 Commit از GitHub Desktop کار نمی‌کنه

اگه Desktop خطای عجیب داد، مستقیم از Terminal:
```bash
cd "/path/to/repo"
git add -A
git commit -m "type: message"
git push
```

---

## 📦 Push رد شد — branch diverged

**پیام خطا:**
```
! [rejected] master -> master (fetch first)
```

**راه حل:**
```bash
git pull --rebase origin master
git push
```

---

## 🔑 Authentication failed هنگام push

**راه حل:** توی macOS Keychain، credential قدیمی GitHub رو پاک کن:
- Keychain Access → جستجوی `github.com` → حذف → دوباره push کن (پسورد/token می‌خواد)

---

## 📝 Commit زده شد ولی push نشد

```bash
git log --oneline -5   # ببین commit هست؟
git push               # push کن
```

---

## ↩️ Undo — برگشت از آخرین commit (هنوز push نشده)

```bash
git reset --soft HEAD~1   # commit رو برمی‌گردونه ولی تغییرات می‌مونن
```

---

## 🗑️ Discard همه تغییرات unstaged

```bash
git checkout -- .
# یا در git جدید:
git restore .
```
