# Branching Strategy

1. `main` is always releasable.
2. Feature branches follow `<ticket>/<description>`.
3. Rebase frequently to keep branches short lived.
4. Merge via fast-forward; avoid merge commits.
5. Tag releases as `v<major>.<minor>.<patch>` after regression suites.
