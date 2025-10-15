# Dependency Audit Policy

We run an automated dependency audit on PRs and pushes to main.

- Blocking level: High/Critical vulnerabilities fail the job.
- Non-blocking: Moderate/Low are reported in the job summary but do not block.
- Scope: Runtime dependencies only (we run with `--omit=dev`).

## Resolution workflow

1. Prefer upstream fixes: update direct deps to versions that pull patched transitives.
2. Use npm `overrides` to force patched transitives when upstream lag exists.
   - Add to `package.json`:
     ```json
     {
       "overrides": {
         "pkg@^1": "1.2.3"
       }
     }
     ```
   - Document the override with a comment in PR body and a link to the advisory.
3. As a last resort, use `patch-package` to hotfix vendor code while waiting for upstream.
   - Install `patch-package` and commit generated patches under `patches/`.
   - Remove once upstream publishes a fix.
4. Temporary allowlist (risk-accepted) with expiration and an issue link.
   - Use `audit-ci` with a short-lived allowlist, or note in the PR: "risk-accepted until YYYY-MM-DD" with a follow-up issue.
   - Only for non-critical risk and when business impact justifies it.

After release, forward-fix via a patch release (x.y.z+1) once a proper fix is available. Roll back only for functional regressions, not solely for known vulnerabilities.

## audit-ci configuration (optional)

Create `.github/audit-ci.json` when you need temporary allowlists. Example:

```json
{
  "report-type": "summary",
  "allowlist": [
    {
      "advisoryId": 12345,
      "package": "example",
      "reason": "Risk accepted until 2025-11-01; tracking in #456",
      "expires": "2025-11-01"
    }
  ],
  "levels": {
    "critical": true,
    "high": true,
    "moderate": false,
    "low": false
  },
  "omit-dev": true
}
```

Notes:
- Keep allowlists small and with explicit expiration.
- Link to a tracking issue and plan to remove the allowlist.
