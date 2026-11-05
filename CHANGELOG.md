# Changelog

## Unreleased

-   Publish modern ESM and CommonJS package exports ([#23](https://github.com/marmelab/ra-auth-cognito/pull/23))

### Breaking Changes

All packages (`ra-auth-cognito`, `ra-auth-cognito-language-english`, `ra-auth-cognito-language-french`) now publish their ES modules and CommonJS builds in `dist/`, behind an [`exports`](https://nodejs.org/api/packages.html#package-entry-points) map. Only each package root can be imported, so these undocumented paths no longer resolve (`<package>` being any of them):

-   the old build folders: `<package>/lib/*` and `<package>/esm/*`
-   the sources: `<package>/src/*`, even though they are still published
-   the manifest: `<package>/package.json`
