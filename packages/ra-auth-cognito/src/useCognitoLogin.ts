import { useCallback } from 'react';
import { useLogin, useSafeSetState } from 'react-admin';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { ErrorRequireNewPassword } from './ErrorRequireNewPassword';
import { ErrorMfaTotpRequired } from './ErrorMfaTotpRequired';
import { ErrorMfaTotpAssociationRequired } from './ErrorMfaTotpAssociationRequired';

export type LoginFormData = {
    username: string;
    password: string;
};

export type NewPasswordFormData = {
    newPassword: string;
    confirmNewPassword: string;
};

export type TotpFormData = {
    totp: string;
};

export type AssociationFormData = {
    association: string;
};

export type FormData =
    | LoginFormData
    | NewPasswordFormData
    | TotpFormData
    | AssociationFormData;

export type UseCognitoLoginResult = [
    (values: FormData) => Promise<unknown>,
    UseMutationResult<unknown, unknown, FormData> & {
        requireNewPassword: boolean;
        requireMfaTotp: boolean;
        requireMfaTotpAssociation: boolean;
        secretCode: string;
        username: string;
        applicationName: string;
    },
];

/**
 * A hook that handle the login process with Cognito. To be used in place of the default useLogin hook.
 * It handle the case where the user is required to set a new password after signing in with a temporary password by setting
 * the requireNewPassword property to true. See example below. When it happens, you'll have to request users to set a new
 * password and call the login function again with the new password as a `newPassword` property. You may add other properties if
 * you configured additional attributes in your user pool.
 *
 * @param options The hook options
 * @param options.redirectTo The page to redirect to after a successful login. Default is the admin home page.
 * @returns A tuple containing the login function as its first item and the react-query mutation as the second.
 * This second item is an object that has the same properties as the react-query mutation, plus a
 * requireNewPassword property that is true when the user is required to set a new password because they signed in
 * with a temporary password.
 *
 * @example
 * import { Form } from 'react-admin';
 * import { useCognitoLogin } from 'ra-auth-cognito';
 *
 * const MyLoginPage = () => {
 *     const [login, { isLoading, error, requireNewPassword }] = useCognitoLogin({ redirectTo: '/' });
 *
 *     if (requireNewPassword) {
 *         return (
 *             <Form onSubmit={values => login(values)}>
 *                 <input type="password" name="newPassword" />
 *                 <input type="text" name="additional-attribute" />
 *                 <button type="submit">Set new password</button>
 *             </Form>
 *         );
 *     }
 *
 *  return (
 *      <Form onSubmit={values => login(values)}>
 *         <input type="text" name="username" />
 *         <input type="password" name="password" />
 *         <button type="submit">Login</button>
 *     </Form>
 * }
 */
export const useCognitoLogin = ({
    redirectTo,
}: {
    redirectTo?: string;
}): UseCognitoLoginResult => {
    const login = useLogin();
    const [requireNewPassword, setRequireNewPassword] = useSafeSetState(false);
    const [requireMfaTotp, setRequireMfaTotp] = useSafeSetState(false);
    const [requireMfaTotpAssociation, setRequireMfaTotpAssociation] =
        useSafeSetState(false);
    const [secretCode, setSecretCode] = useSafeSetState('');
    const [username, setUsername] = useSafeSetState('');
    const [applicationName, setApplicationName] = useSafeSetState('');

    const mutation = useMutation<unknown, unknown, FormData>({
        mutationFn: values => login(values, redirectTo),
    });

    const cognitoLogin = useCallback(
        (values: FormData) => {
            return mutation.mutateAsync(values).catch(error => {
                if (error instanceof ErrorMfaTotpAssociationRequired) {
                    setRequireMfaTotpAssociation(true);
                    setRequireMfaTotp(false);
                    setRequireNewPassword(false);
                    setSecretCode(error.secretCode);
                    setUsername(error.username);
                    setApplicationName(error.applicationName);
                    return;
                }
                if (error instanceof ErrorMfaTotpRequired) {
                    setRequireMfaTotpAssociation(false);
                    setRequireMfaTotp(true);
                    setRequireNewPassword(false);
                    return;
                }
                if (error instanceof ErrorRequireNewPassword) {
                    setRequireMfaTotpAssociation(false);
                    setRequireMfaTotp(false);
                    setRequireNewPassword(true);
                    return;
                }

                throw error;
            });
        },
        [
            mutation,
            setRequireNewPassword,
            setRequireMfaTotp,
            setRequireMfaTotpAssociation,
            setSecretCode,
            setUsername,
            setApplicationName,
        ]
    );

    return [
        cognitoLogin,
        {
            ...mutation,
            requireNewPassword,
            requireMfaTotp,
            requireMfaTotpAssociation,
            secretCode,
            username,
            applicationName,
        },
    ];
};

export const formIsNewPassword = (
    form: FormData
): form is NewPasswordFormData => 'newPassword' in form;

export const formIsTotp = (form: FormData): form is TotpFormData =>
    'totp' in form;

export const formIsTotpAssociation = (
    form: FormData
): form is AssociationFormData => 'association' in form;

export const formIsLogin = (form: FormData): form is LoginFormData =>
    !formIsNewPassword(form) &&
    !formIsTotp(form) &&
    !formIsTotpAssociation(form) &&
    'password' in form &&
    'username' in form;
