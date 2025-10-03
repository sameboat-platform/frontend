### Auth flow endpoints:

#### Production (profile prod):

-   POST https://api.sameboatplatform.org/api/auth/login
-   POST https://api.sameboatplatform.org/api/auth/register (if registration enabled)
-   POST https://api.sameboatplatform.org/api/auth/logout
-   GET https://api.sameboatplatform.org/api/me (alias: /me)

#### Local dev (profile dev or default):

-   POST http://localhost:8080/api/auth/login
-   POST http://localhost:8080/api/auth/register
-   POST http://localhost:8080/api/auth/logout
-   GET http://localhost:8080/api/me (alias: /me)

Frontend dev origin allowed: http://localhost:5173
Cookie sent only after successful POST /api/auth/login; subsequent requests must include credentials.
