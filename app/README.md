## Versioning & Release

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

