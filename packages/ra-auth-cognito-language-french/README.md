# ra-auth-cognito-language-french

French translations for [ra-auth-cognito](https://www.npmjs.com/package/ra-auth-cognito).

## Installation

```sh
npm install ra-auth-cognito-language-french
# or
yarn add ra-auth-cognito-language-french
```

## Usage

```js
// in i18nProvider.js
import { raAuthCognitoEnglishMessages } from 'ra-auth-cognito-language-english';
import { raAuthCognitoFrenchMessages } from 'ra-auth-cognito-language-french';
import { mergeTranslations } from 'react-admin';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from 'ra-language-english';
import frenchMessages from 'ra-language-french';

const allEnglishMessages = mergeTranslations(
    englishMessages,
    raAuthCognitoEnglishMessages
);
const allFrenchMessages = mergeTranslations(
    frenchMessages,
    raAuthCognitoFrenchMessages
);

export const i18nProvider = polyglotI18nProvider(
    locale => (locale === 'fr' ? allFrenchMessages : allEnglishMessages),
    'en'
);

// in App.js
import { Admin, Resource, ListGuesser } from 'react-admin';
import { authRoutes } from 'ra-auth-cognito';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';
import { i18nProvider } from './i18nProvider';

export const MyAdmin = () => (
    <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        i18nProvider={i18nProvider}
        customRoutes={authRoutes}
    >
        <Resource name="posts" list={ListGuesser} />
        <Resource name="authors" list={ListGuesser} />
    </Admin>
);
```
