import React from 'react';
import { Admin, Resource, CustomRoutes } from 'react-admin';
import { BrowserRouter, Route } from 'react-router-dom';
import comments from './comments';
import CustomRouteLayout from './customRouteLayout';
import CustomRouteNoLayout from './customRouteNoLayout';
import i18nProvider from './i18nProvider';
import Layout from './Layout';
import posts from './posts';
import users from './users';
import tags from './tags';
import { CognitoAuthProvider, Login } from 'ra-auth-cognito';
import jsonServerProvider from 'ra-data-json-server';
import fakeRestProvider from 'ra-data-fakerest';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import data from './data';

const userPool = new CognitoUserPool({
    UserPoolId: import.meta.env.VITE_COGNITO_USERPOOL_ID,
    ClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
});

const authProvider = CognitoAuthProvider(userPool);

const App = () => {
    return (
        <BrowserRouter>
            <Admin
                authProvider={authProvider}
                // dataProvider={jsonServerProvider(
                //     'http://localhost:3000',
                //     httpClient(userPool)
                // )}
                dataProvider={fakeRestProvider(data)}
                i18nProvider={i18nProvider}
                title="Example Admin"
                layout={Layout}
                loginPage={Login}
            >
                {permissions => (
                    <>
                        <CustomRoutes noLayout>
                            <Route
                                path="/custom"
                                element={
                                    <CustomRouteNoLayout title="Posts from /custom" />
                                }
                            />
                        </CustomRoutes>
                        <Resource name="posts" {...posts} />
                        <Resource name="comments" {...comments} />
                        <Resource name="tags" {...tags} />
                        {permissions ? (
                            <>
                                {permissions.includes('admin') ? (
                                    <Resource name="users" {...users} />
                                ) : null}
                                <CustomRoutes noLayout>
                                    <Route
                                        path="/custom1"
                                        element={
                                            <CustomRouteNoLayout title="Posts from /custom1" />
                                        }
                                    />
                                </CustomRoutes>
                                <CustomRoutes>
                                    <Route
                                        path="/custom2"
                                        element={
                                            <CustomRouteLayout title="Posts from /custom2" />
                                        }
                                    />
                                </CustomRoutes>
                            </>
                        ) : null}
                        <CustomRoutes>
                            <Route
                                path="/custom3"
                                element={
                                    <CustomRouteLayout title="Posts from /custom3" />
                                }
                            />
                        </CustomRoutes>
                    </>
                )}
            </Admin>
        </BrowserRouter>
    );
};
export default App;
