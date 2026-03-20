## Versioning & Release

## Backend Connection

Set frontend API base URL using an environment file:

1. Create `.env` in this folder using `.env.example`.
2. Configure `VITE_API_BASE_URL` to your backend root (for example `http://localhost:8000/api/v1`).

The app will automatically load and sync jobs/candidates with the backend when reachable, and fall back to local browser data if not.

Use npm versioning to bump app versions without manually editing `package.json`.

### Bump version

- Patch (bug/UI fixes): `npm run release:patch`
- Minor (new backward-compatible features): `npm run release:minor`
- Major (breaking changes): `npm run release:major`

This will:

- update `version` in `package.json`
- create a Git commit
- create a Git tag

### Push commits + tags

After bumping version, push with:

`npm run release:push`

Vercel will detect the push and rebuild automatically.

