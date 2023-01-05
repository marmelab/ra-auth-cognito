import { AuthProvider, HttpError } from 'react-admin';
import {
    AuthenticationDetails,
    CognitoAccessToken,
    CognitoIdToken,
    CognitoRefreshToken,
    CognitoUser,
    CognitoUserPool,
    CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { ErrorRequireNewPassword } from './ErrorRequireNewPassword';

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
// https://react-admin.auth.eu-west-3.amazoncognito.com/login?client_id=1v090rrs9pi78u5cci11o9u6bp&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+profile&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth-callback
export type CognitoAuthProviderOptionsPool = CognitoUserPool;

export type CognitoAuthProviderOptionsIds = {
    userPoolId: string;
    clientId: string;
    mode: 'oauth' | 'username';
    redirect_uri?: string;
    scope?: string[];
};

export type CognitoAuthProviderOptions =
    | CognitoAuthProviderOptionsPool
    | CognitoAuthProviderOptionsIds;

export const CognitoAuthProvider = (
    options: CognitoAuthProviderOptions
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
        async login({
            username,
            password,
            newPassword,
            ...attributes
        }: {
            username: string;
            password: string;
            newPassword?: string;
            [key: string]: any;
        }) {
            return new Promise((resolve, reject) => {
                if (newPassword) {
                    if (!user) {
                        return reject(new Error('User is not defined'));
                    }

                    user.completeNewPasswordChallenge(newPassword, attributes, {
                        onSuccess: result => {
                            resolve(result);
                        },
                        onFailure: err => {
                            reject(err);
                        },
                    });
                }

                user = new CognitoUser({
                    Username: username,
                    Pool: userPool,
                });

                const authenticationDetails = new AuthenticationDetails({
                    Username: username,
                    Password: password,
                });

                user.authenticateUser(authenticationDetails, {
                    onSuccess: result => {
                        resolve(result);
                    },
                    onFailure: err => {
                        reject(err);
                    },
                    newPasswordRequired: () => {
                        reject(new ErrorRequireNewPassword());
                    },
                });
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
                        const oauthOptions = options as CognitoAuthProviderOptionsIds;
                        const redirect_uri =
                            oauthOptions.redirect_uri ??
                            `${window.location.origin}/auth-callback`;
                        const scope = oauthOptions.scope || [
                            'openid',
                            'email',
                            'profile',
                        ];
                        const url = `https://react-admin.auth.eu-west-3.amazoncognito.com/login?client_id=${
                            oauthOptions.clientId
                        }&response_type=token&scope=${scope.join(
                            '+'
                        )}&redirect_uri=${redirect_uri}`;
                        window.location.href = url;
                    } else {
                        return reject(new HttpError('No user', 401));
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
                        return reject(err);
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
                    return reject();
                }

                user.getSession((err, session: CognitoUserSession) => {
                    if (err) {
                        return reject(err);
                    }
                    if (!session.isValid()) {
                        return reject();
                    }
                    const token = session.getIdToken().decodePayload();
                    return resolve(token['cognito:groups']);
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
                        });
                    });
                });
            });
        },
        async handleCallback() {
            const urlParams = new URLSearchParams(
                window.location.hash.substr(1)
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
