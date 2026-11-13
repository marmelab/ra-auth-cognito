# 3.0.0

- Publish modern ESM and CommonJS package exports ([#23](https://github.com/marmelab/ra-auth-cognito/pull/23))
- Compile to ES2020 instead of ES5 ([#23](https://github.com/marmelab/ra-auth-cognito/pull/23))
- Support `qrcode.react` v4 ([#23](https://github.com/marmelab/ra-auth-cognito/pull/23))

## Breaking Changes

All packages (`ra-auth-cognito`, `ra-auth-cognito-language-english`, `ra-auth-cognito-language-french`) now publish their ES modules and CommonJS builds in `dist/`, behind an [`exports`](https://nodejs.org/api/packages.html#package-entry-points) map. Only each package root can be imported, so these undocumented paths no longer resolve (`<package>` being any of them):

- the old build folders: `<package>/lib/*` and `<package>/esm/*`
- the sources: `<package>/src/*`, even though they are still published
- the manifest: `<package>/package.json`

All packages are now compiled to ES2020 instead of ES5, so their builds use ES2020 syntax (classes, `async`/`await`, optional chaining, nullish coalescing...) as is. Applications targeting older environments must transpile them.

`ra-auth-cognito` now requires `qrcode.react` 3.2 or later (`^3.2.0 || ^4.0.0`), the first versions to ship an ES module build.

# 2.0.0

- Update for React Admin v5 ([#21](https://github.com/marmelab/ra-auth-cognito/pull/21)) ([djhi](https://github.com/djhi))
- Feat: add `oauthGrantType` option to support `response_type` code ([#17](https://github.com/marmelab/ra-auth-cognito/pull/17)) ([ashabottu](https://github.com/ashabottu))

# 1.1.0

- Add support for MFA with TOTP

# 1.0.2

- Fix redirect on invalid session.

# 1.0.1

- Fix permissions might be null.
