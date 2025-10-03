# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | ✅ Active |
| < 0.1.0 | ❌        |

Pre-1.0 versions may receive security dependency bumps and critical patches only.

## Reporting a Vulnerability

Please open a private advisory via GitHub Security Advisories ("Report a vulnerability" in the repo *Security* tab) **or** email the maintainer listed in `package.json`.

Include (when possible):
- Affected route or component
- Reproduction steps / PoC
- Impact assessment (confidentiality, integrity, availability)
- Suggested fix or mitigation (if known)

You will receive an acknowledgement within 2 business days. We aim to provide an initial remediation plan within 5 business days.

## Disclosure Process
1. Receive & validate report.
2. Assign CVSS-like internal severity (low / moderate / high / critical).
3. Patch on a protected branch; add tests where feasible.
4. Release patched version (e.g. `0.1.(n+1)`) and update CHANGELOG under **Security**.
5. Public disclosure after fix is available (or coordinated timeline for high severity).

## Dependency Vulnerabilities
Automated tools (e.g., Dependabot) generate PRs for vulnerable packages. These are merged after:
- Lint + type + test + build gates pass.
- CHANGELOG updated under **Security**.

## Hardening Roadmap
- Add CI job to scan for secret leaks.
- Add CSP & security headers doc section before 0.2.0.
- Expand automated dependency diff labeling.

If you have suggestions for further hardening, please open an issue tagged `enhancement` + `security`.
