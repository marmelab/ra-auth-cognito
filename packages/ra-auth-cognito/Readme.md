# ra-auth-cognito

An auth provider for [react-admin](https://github.com/marmelab/react-admin) which handles authentication using AWS [Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html).

This package provides:

-   The `CognitoAuthProvider` function to get the auth provider
-   A `useCognitoLogin` hook to allow building a custom `Login` page. It handles initial login with a temporary password
-   A custom `Login` component that handle initial login with a temporary password

## Supported Cognito Features

- Username/password authentication
- OAuth authentication with Implicit code grant

In all cases, users must be added to the user pool with their email set before they may sign-in in react-admin.

## Installation

```sh
yarn add ra-auth-cognito
# or
npm install --save ra-auth-cognito
```

## Example usage

```jsx
// in src/App.tsx
import React from 'react';
import { Admin, Resource } from 'react-admin';
import { CognitoAuthProvider } from 'ra-auth-cognito';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import dataProvider from './dataProvider';
import posts from './posts';

const userPool = new CognitoUserPool({
    UserPoolId: 'COGNITO_USERPOOL_ID',
    ClientId: 'COGNITO_APP_CLIENT_ID',
});

const authProvider = CognitoAuthProvider(userPool);

const App = () => {
  return (
       <Admin
           authProvider={authProvider}
           dataProvider={dataProvider}
           title="Example Admin"
        >
            <Resource name="posts" {...posts} />
      </Admin>
   );
};
export default App;
```

## Handling User Identities

To support react-admin [identity feature](https://marmelab.com/react-admin/AuthProviderWriting.html#getidentity), you may add the `name` and `picture` [attributes](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html) to the users registered in your user pool.

## Handling Permissions

This `authProvider.getPermissions` method returns an array of [the groups assigned to the user](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-user-groups.html?icmpid=docs_cognito_console_help_panel).

## Demo

You can find a working demo, along with the source code, in this project's repository: https://github.com/marmelab/ra-auth-cognito

## License

This auth provider is licensed under the MIT License and sponsored by [marmelab](https://marmelab.com).
