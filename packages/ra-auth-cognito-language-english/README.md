# ra-auth-cognito-language-english

English translations for [ra-auth-cognito](https://www.npmjs.com/package/ra-auth-cognito).

## Installation

```sh
npm install ra-auth-cognito-language-english
# or
yarn add ra-auth-cognito-language-english
```

## Usage

```js
// in i18nProvider.js
import { raAuthCognitoEnglishMessages } from 'ra-auth-cognito-language-english';
import { mergeTranslations } from 'react-admin';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from 'ra-language-english';

const allEnglishMessages = mergeTranslations(
    englishMessages,
    raAuthCognitoEnglishMessages
);

export const i18nProvider = polyglotI18nProvider(
    locale => allEnglishMessages,
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
