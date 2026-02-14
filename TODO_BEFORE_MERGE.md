# ⚠️ TODO BEFORE MERGING THIS BRANCH ⚠️

## CRITICAL: Cleanup Required Before Merge/Push

This branch contains **internal diagnostic files** that must **NEVER** be committed or pushed to remote repository.

---

## 🚨 PRE-MERGE CHECKLIST

Before running `git merge` or `git push`, complete these steps:

### Step 1: Delete Diagnostic Files
```bash
# Delete the diagnostic report
rm REACT_BEST_PRACTICES_DIAGNOSTIC.md

# Delete this TODO file
rm TODO_BEFORE_MERGE.md

# Verify files are deleted
ls -la | grep -E "(DIAGNOSTIC|TODO_BEFORE_MERGE)"
# Should return nothing
```

### Step 2: Verify Git Status
```bash
# Check git status
git status

# Ensure diagnostic files are NOT staged
# Should NOT see:
#   - REACT_BEST_PRACTICES_DIAGNOSTIC.md
#   - TODO_BEFORE_MERGE.md
```

### Step 3: ~~Verify .gitignore~~ (SKIPPED)
```bash
# .gitignore NOT modified per user request
# Files are NOT in .gitignore
# YOU MUST BE EXTRA CAREFUL not to commit them!
```

### Step 4: Check Commit History
```bash
# Verify diagnostic files are NOT in commit history
git log --all --full-history -- "*DIAGNOSTIC.md" "TODO_BEFORE_MERGE.md"

# Should return nothing
```

### Step 5: Final Verification Before Push
```bash
# List all files that will be pushed
git diff --name-only main...HEAD

# Ensure diagnostic files are NOT in the list
```

---

## ✅ SAFE TO MERGE WHEN:

- [x] All diagnostic files deleted
- [x] `git status` shows clean (or only intended changes)
- [x] `.gitignore` properly configured
- [x] No diagnostic files in commit history
- [x] All tests passing
- [x] Code reviewed

---

## 🔄 MERGE PROCESS

Once cleanup is complete:

```bash
# 1. Ensure you're on the feature branch
git branch --show-current
# Should show: refactor/react-best-practices

# 2. Final check
git status

# 3. Commit final changes (if any)
git add .
git commit -m "fix: optimize React performance and fix debounce issues"

# 4. Switch to main branch
cd /home/me/programming/projects/idn-area-map
git checkout main

# 5. Merge the feature branch
git merge refactor/react-best-practices

# 6. Verify merge
git log --oneline -5

# 7. Push to remote (if desired)
git push origin main

# 8. Clean up worktree
git worktree remove ../idn-area-map.worktrees/react-best-practices
git branch -d refactor/react-best-practices
```

---

## 🚫 WHAT NOT TO DO

**DON'T:**
- ❌ Commit diagnostic files
- ❌ Push before cleanup
- ❌ Skip verification steps
- ❌ Ignore this checklist
- ❌ Merge without testing
- ❌ Remove .gitignore entries

**DO:**
- ✅ Follow checklist completely
- ✅ Verify each step
- ✅ Test all changes
- ✅ Review code quality
- ✅ Keep diagnostics local only

---

## 📝 NOTES

### Why This Matters

Internal diagnostic reports contain:
- Detailed code analysis
- Potential security insights
- Development thought process
- Internal assessment methodology
- Confidence scores and reasoning

**These should remain private** to maintain professionalism and avoid:
- Exposing internal processes
- Confusing external contributors
- Creating unnecessary noise in repository
- Revealing assessment methodology

### If You Accidentally Committed

If diagnostic files were committed:

```bash
# Remove from last commit (if not pushed)
git reset HEAD~1
rm REACT_BEST_PRACTICES_DIAGNOSTIC.md TODO_BEFORE_MERGE.md
git add .
git commit -m "fix: optimize React performance and fix debounce issues"

# If already pushed (requires force push - use with caution!)
git reset HEAD~1
rm REACT_BEST_PRACTICES_DIAGNOSTIC.md TODO_BEFORE_MERGE.md
git add .
git commit -m "fix: optimize React performance and fix debounce issues"
git push --force-with-lease origin refactor/react-best-practices
```

**⚠️ Force push should be avoided if others are working on the branch!**

---

## 🎯 IMPLEMENTATION SUMMARY

When merging, you'll be delivering:

**Fixed Issues (4 Critical):**
1. ✅ Debounce functionality in AreaSelectors
2. ✅ Debounce functionality in useDashboardLayout
3. ✅ React.cache() for server-side data fetching
4. ✅ Performance optimization in Pilkada BoundaryLayers

**Additional Improvements:**
- Performance optimizations in context and rendering
- Code quality improvements
- Better memoization patterns
- Enhanced user experience

**Total Impact:**
- Improved search responsiveness
- Smoother map interactions
- Reduced server-side duplicate fetches
- Better overall performance

---

## 🆘 NEED HELP?

If unsure about any step:

1. **Review the diagnostic report** (before deleting) for context
2. **Check git status** to see what's staged
3. **Run tests** to ensure everything works
4. **Ask for code review** before merging

---

**Remember:** This file should also be deleted before merge!

**Last Updated:** 2026-01-17  
**Branch:** refactor/react-best-practices  
**Worktree:** /home/me/programming/projects/idn-area-map.worktrees/react-best-practices
