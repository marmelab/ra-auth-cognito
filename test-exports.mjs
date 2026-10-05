// Loads the built packages the way Node does, as ES modules and as CommonJS,
// to catch imports that only bundlers resolve. Run it after `make build`.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import * as React from 'react';
import { renderToString } from 'react-dom/server';

const require = createRequire(import.meta.url);

// The TOTP association form renders its QR code with qrcode.react
const renderQrCode = ({ MfaTotpAssociationForm }, { TestMemoryRouter }) =>
    renderToString(
        React.createElement(
            TestMemoryRouter,
            null,
            React.createElement(MfaTotpAssociationForm, {
                submit: () => {},
                secretCode: 'SECRET',
                username: 'john',
                applicationName: 'app',
            })
        )
    );
assert.match(
    renderQrCode(await import('ra-auth-cognito'), await import('react-admin')),
    /<svg/
);
assert.match(
    renderQrCode(require('ra-auth-cognito'), require('react-admin')),
    /<svg/
);

for (const name of [
    'ra-auth-cognito-language-english',
    'ra-auth-cognito-language-french',
]) {
    assert.equal(Object.keys(await import(name)).length, 1);
    assert.equal(Object.keys(require(name)).length, 1);
}

console.log('The built packages load as ES modules and as CommonJS.');
