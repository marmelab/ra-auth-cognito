import { raAuthCognitoEnglishMessages } from 'ra-auth-cognito-language-english';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from './i18n/en';
import { mergeTranslations } from 'react-admin';

const allEnglishMessages = mergeTranslations(
    englishMessages,
    raAuthCognitoEnglishMessages
);
const messages = {
    fr: () =>
        Promise.all([
            import('./i18n/fr'),
            import('ra-auth-cognito-language-french'),
        ]).then(([raMessages, raAuthCognitoMessages]) =>
            mergeTranslations(
                raMessages.default,
                raAuthCognitoMessages.raAuthCognitoFrenchMessages
            )
        ),
};

export default polyglotI18nProvider(
    locale => {
        if (locale === 'fr') {
            return messages[locale]();
        }

        // Always fallback on english
        return allEnglishMessages;
    },
    'en',
    [
        { locale: 'en', name: 'English' },
        { locale: 'fr', name: 'Français' },
    ]
);
