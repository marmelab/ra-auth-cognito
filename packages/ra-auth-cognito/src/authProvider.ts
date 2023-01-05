import { AuthProvider } from 'react-admin';
import {
    AuthenticationDetails,
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
export const CognitoAuthProvider = (
    userPool: CognitoUserPool
): AuthProvider => {
    let user: CognitoUser | null = null;
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
                    if (user) {
                        user.completeNewPasswordChallenge(
                            newPassword,
                            attributes,
                            {
                                onSuccess: result => {
                                    resolve(result);
                                },
                                onFailure: err => {
                                    reject(err);
                                },
                            }
                        );
                    } else {
                        reject(new Error('User is not defined'));
                    }
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
            return new Promise((resolve, reject) => {
                const user = userPool.getCurrentUser();

                if (!user) {
                    reject();
                }
                user.getSession((err, session) => {
                    if (err) {
                        return reject(err);
                    }

                    if (!session.isValid()) {
                        return reject();
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
    };
};
