// Loads the built packages in Node, as ES modules and as CommonJS, to catch
// imports that only bundlers resolve. Run it after `make build`.
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

for (const name of [
    'ra-auth-cognito',
    'ra-auth-cognito-language-english',
    'ra-auth-cognito-language-french',
]) {
    await import(name);
    require(name);
}

console.log('The built packages load as ES modules and as CommonJS.');
