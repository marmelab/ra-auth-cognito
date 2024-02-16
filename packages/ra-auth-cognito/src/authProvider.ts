import {
    AuthenticationDetails,
    CognitoAccessToken,
    CognitoIdToken,
    CognitoRefreshToken,
    CognitoUser,
    CognitoUserPool,
    CognitoUserSession,
    IAuthenticationCallback,
} from 'amazon-cognito-identity-js';
import { type AuthProvider, HttpError } from 'react-admin';
import { ErrorMFARequired } from './ErrorMFARequired';
import { ErrorRequireNewPassword } from './ErrorRequireNewPassword';
import { ErrorMfaTotpRequired } from './ErrorMfaTotpRequired';
import {
    FormData,
    formIsTotpAssociation,
    formIsLogin,
    formIsNewPassword,
    formIsTotp,
} from './useCognitoLogin';
import { ErrorMfaTotpAssociationRequired } from './ErrorMfaTotpAssociationRequired';

/**
 * An authProvider which handles authentication with AWS Cognito.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { Admin, Resource } from 'react-admin';
 * import { CognitoAuthProvider } from 'ra-auth-cognito';
 * import { CognitoUserPool } from 'amazon-cognito-identity-js';
 * import dataProvider from './dataProvider';
 * import posts from './posts';
 *
 * const userPool = new CognitoUserPool({
 *     UserPoolId: 'COGNITO_USERPOOL_ID',
 *     ClientId: 'COGNITO_APP_CLIENT_ID',
 * });
 *
 * const authProvider = CognitoAuthProvider(userPool);
 *
 *  const App = () => {
 *   return (
 *        <Admin
 *            authProvider={authProvider}
 *            dataProvider={dataProvider}
 *            title="Example Admin"
 *         >
 *             <Resource name="posts" {...posts} />
 *       </Admin>
 *    );
 * };
 * export default App;
 *
 * ```
 *
 * @param userPool a CognitoUserPool instance
 * @returns an authProvider ready to be used by React-Admin.
 */
export type CognitoAuthProviderOptionsPool = CognitoUserPool;

export type CognitoAuthProviderOptionsIds = {
    userPoolId: string;
    clientId: string;
    hostedUIUrl?: string;
    mode: 'oauth' | 'username';
    redirect_uri?: string;
    scope?: string[];
};

export type CognitoAuthProviderOptions =
    | CognitoAuthProviderOptionsPool
    | CognitoAuthProviderOptionsIds;

export type Config = {
    applicationName?: string;
};

export const CognitoAuthProvider = (
    options: CognitoAuthProviderOptions,
    config: Config = {}
): AuthProvider => {
    let user: CognitoUser | null = null;
    const mode = options instanceof CognitoUserPool ? 'username' : options.mode;

    const userPool =
        options instanceof CognitoUserPool
            ? (options as CognitoUserPool)
            : new CognitoUserPool({
                  UserPoolId: options.userPoolId,
                  ClientId: options.clientId,
              });

    return {
        async login(form: FormData) {
            return new Promise((resolve, reject) => {
                const callback: IAuthenticationCallback = {
                    onSuccess: result => {
                        return resolve(result);
                    },
                    onFailure: err => {
                        reject(err);
                    },
                    newPasswordRequired: () => {
                        reject(new ErrorRequireNewPassword());
                    },
                    mfaSetup: () => {
                        user.associateSoftwareToken({
                            associateSecretCode: secretCode => {
                                reject(
                                    new ErrorMfaTotpAssociationRequired({
                                        secretCode,
                                        username: user.getUsername(),
                                        applicationName:
                                            config.applicationName ??
                                            window.location.hostname,
                                    })
                                );
                            },
                            onFailure: err => {
                                reject(err);
                            },
                        });
                    },
                    totpRequired: () => {
                        reject(new ErrorMfaTotpRequired());
                    },
                    mfaRequired: () => {
                        reject(new ErrorMFARequired('SMS MFA is required by the server, but it is not yet supported by ra-auth-cognito. Please disable this feature in Cognito config.'));
                    },
                };
                if (formIsNewPassword(form)) {
                    const { newPassword, confirmNewPassword, ...attributes } =
                        form;
                    if (!user) {
                        return reject(new Error('User is not defined'));
                    }

                    return user.completeNewPasswordChallenge(
                        newPassword,
                        attributes,
                        callback
                    );
                }
                if (formIsTotp(form)) {
                    if (!user) {
                        return reject(new Error('User is not defined'));
                    }
                    return user.sendMFACode(
                        form.totp,
                        callback,
                        'SOFTWARE_TOKEN_MFA'
                    );
                }

                if (formIsTotpAssociation(form)) {
                    if (!user) {
                        return reject(new Error('User is not defined'));
                    }
                    return user.verifySoftwareToken(
                        form.association,
                        'Authenticator',
                        callback
                    );
                }

                if (!formIsLogin(form)) {
                    return reject(new Error('Invalid form'));
                }
                const { username, password } = form;

                user = new CognitoUser({
                    Username: username,
                    Pool: userPool,
                });

                const authenticationDetails = new AuthenticationDetails({
                    Username: username,
                    Password: password,
                });

                user.authenticateUser(authenticationDetails, callback);
            });
        },
        // called when the user clicks on the logout button
        async logout() {
            return new Promise((resolve, reject) => {
                const user = userPool.getCurrentUser();
                if (!user) {
                    return resolve();
                }
                user.signOut(() => {
                    resolve();
                });
            });
        },
        // called when the API returns an error
        async checkError({ status }) {
            if (status === 401 || status === 403) {
                throw new Error('Unauthorized');
            }
        },
        // called when the user navigates to a new location, to check for authentication
        async checkAuth() {
            return new Promise<void>((resolve, reject) => {
                const redirectToOAuthIfNeeded = (error?: Error) => {
                    if (mode === 'oauth') {
                        const oauthOptions =
                            options as CognitoAuthProviderOptionsIds;
                        const redirect_uri =
                            oauthOptions.redirect_uri ??
                            `${window.location.origin}/auth-callback`;
                        const scope = oauthOptions.scope || [
                            'openid',
                            'email',
                            'profile',
                            'aws.cognito.signin.user.admin',
                        ];
                        const url = `${
                            oauthOptions.hostedUIUrl
                        }/login?client_id=${
                            oauthOptions.clientId
                        }&response_type=token&scope=${scope.join(
                            '+'
                        )}&redirect_uri=${redirect_uri}`;
                        window.location.href = url;
                    } else {
                        return reject(error);
                    }
                };
                let user = userPool.getCurrentUser();

                if (!user) {
                    return redirectToOAuthIfNeeded(
                        new HttpError('No user', 401)
                    );
                }
                user.getSession((err, session) => {
                    if (err) {
                        return redirectToOAuthIfNeeded(
                            new HttpError('No user', 401)
                        );
                    }

                    if (!session.isValid()) {
                        return redirectToOAuthIfNeeded(
                            new HttpError('No user', 401)
                        );
                    }

                    user.getUserAttributes(err => {
                        if (err) {
                            return reject(err);
                        }
                        resolve();
                    });
                });
            });
        },
        // called when the user navigates to a new location, to check for permissions / roles
        async getPermissions() {
            return new Promise((resolve, reject) => {
                const user = userPool.getCurrentUser();

                if (!user) {
                    return resolve([]);
                }

                user.getSession((err, session: CognitoUserSession) => {
                    if (err) {
                        return reject(err);
                    }
                    if (!session.isValid()) {
                        return reject();
                    }
                    const token = session.getIdToken().decodePayload();
                    return resolve(token['cognito:groups'] ?? []);
                });
            });
        },
        async getIdentity() {
            return new Promise((resolve, reject) => {
                const user = userPool.getCurrentUser();

                if (!user) {
                    return reject();
                }
                user.getSession((err, session) => {
                    if (err) {
                        return reject(err);
                    }
                    if (!session.isValid()) {
                        return reject();
                    }
                    user.getUserAttributes((err, attributes) => {
                        if (err) {
                            return reject(err);
                        }

                        resolve({
                            id: user.getUsername(),
                            fullName: attributes?.find(
                                attribute => attribute.Name === 'name'
                            )?.Value,
                            avatar: attributes?.find(
                                attribute => attribute.Name === 'picture'
                            )?.Value,
                            cognitoUser: user, // Pass the cognito user object if you need to add authenticator or other features
                        });
                    });
                });
            });
        },
        async handleCallback() {
            const urlParams = new URLSearchParams(
                window.location.hash.substring(1)
            );
            const error = urlParams.get('error');
            const errorDescription = urlParams.get('error_description');
            const idToken = urlParams.get('id_token');
            const accessToken = urlParams.get('access_token');

            if (error) {
                throw new Error(errorDescription);
            }

            if (idToken == null || accessToken == null) {
                throw new Error('Failed to handle login callback.');
            }
            const session = new CognitoUserSession({
                IdToken: new CognitoIdToken({ IdToken: idToken }),
                RefreshToken: new CognitoRefreshToken({
                    RefreshToken: null,
                }),
                AccessToken: new CognitoAccessToken({
                    AccessToken: accessToken,
                }),
            });
            const user = new CognitoUser({
                Username: session.getIdToken().decodePayload()[
                    'cognito:username'
                ],
                Pool: userPool,
                Storage: window.localStorage,
            });
            user.setSignInUserSession(session);
            return user;
        },
    };
};
