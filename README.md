# ra-auth-cognito

An auth provider for [react-admin](https://github.com/marmelab/react-admin) which handles authentication with AWS [Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html).

This repository contains:

-   The actual `ra-auth-cognito` package
-   A simple demo app you can run locally to try out `ra-auth-cognito` with your own UserPool.

## The `ra-auth-cognito` package

-   Please have a look at the [DOCUMENTATION](./packages/ra-auth-cognito/Readme.md)
-   And also the [source code](https://github.com/marmelab/ra-auth-cognito/tree/main/src/packages/ra-auth-cognito)

## Simple Demo

### Prerequesites

-   You need to have a [Cognito UserPool](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html) set up.

### Initial setup

1. Clone this project

We need to add some minimal configuration to our UserPool instance to use it. This need to be done from the AWS Console.

1. Go to the [AWS Console](https://eu-west-3.console.aws.amazon.com/cognito/v2/idp/user-pools/)
1. Select your User Pool (or create a new one)
1. Add an `admin` user and **set their email**. You may add the `name` and `picture` attribute as well for the react-admin identity feature.
1. Add an `admin` group and assign the `admin` user.
1. Do the same for `user` and the `user` role.
1. Go to the `App integration` section of your User Pool and click the `Create app client` button
1. Create a `single page` application with the following settings:
    - Public client
    - Don't generate a client secret
    Leave the defaults for the rest

For the demo app, you need to setup environment variables. You can do this by creating a `.env` file in the root of the project. The following variables are required:

```JS
VITE_COGNITO_USERPOOL_ID="userpool-id"
VITE_COGNITO_APP_CLIENT_ID="app-client-id"
```

1. Run `make install start` to install the dependencies and start the Demo App

## Testing the OAuth mode

Setup the hosted UI for your user pool with the following options:
- Allowed callback URLs: `http://localhost:8081/auth-callback`
- Allowed sign-out URLs: `http://localhost:8081/`
- Select the `Implicit grant` option.
- Ensure the `OpenId`, `Email`, `Profile` and `aws.cognito.signin.user.admin` scopes are selected.

To enable the hosted UI, you must also a domain in the `App integration` section. Select a Cognito domain and copy its url.

### Using the Simple Demo

Now that all is configured and running, you can browse to http://127.0.0.1:8081/ to access the React Admin App.

The first time you sign in with any of the users, you'll have to enter their temporary password and will be asked to enter a password of your choice.

-   Signing in with `user` will only grant the `user` role permissions
-   Signing in with `admin` will grant full `admin` role permissions, allowing for instance to see the 'Users' resource in the main menu

Feel free to play around with this demo, along with the Cognito config, to understand better how it works!

## License

This repository and the code it contains are licensed under the MIT License and sponsored by [marmelab](https://marmelab.com).
