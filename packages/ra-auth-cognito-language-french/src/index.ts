import type { CognitoTranslationMessages } from 'ra-auth-cognito';

export const raAuthCognitoFrenchMessages: CognitoTranslationMessages = {
    ra: {
        auth: {
            cognito: {
                mfa: {
                    totp: {
                        association_helper_text:
                            "Entrez le code de vérification généré par votre application d'authentification pour terminer l'association.",
                        association_label: 'Code de vérification',
                        association_required:
                            'Authentification en deux étapes requise, veuillez associer un authentificateur à votre compte en scannant le code QR ou en entrant la clé secrète.',
                        copy_totp_url_to_clipboard: 'Copier la clé secrète',
                        label: "Code de vérification de l'authentificateur",
                    },
                },
            },
        },
    },
};
