import { useCallback } from 'react';
import { useLogin, useSafeSetState } from 'react-admin';
import { useMutation, UseMutationResult } from 'react-query';
import { ErrorRequireNewPassword } from './ErrorRequireNewPassword';

export type LoginFormData = {
    username: string;
    password: string;
};

export type UseCognitoLoginResult<NewPasswordFormData = unknown> = [
    (values: LoginFormData | NewPasswordFormData) => Promise<unknown>,
    UseMutationResult<unknown, unknown, LoginFormData | NewPasswordFormData> & {
        requireNewPassword: boolean;
    }
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
export const useCognitoLogin = <NewPasswordFormData = unknown>({
    redirectTo,
}: {
    redirectTo: string;
}): UseCognitoLoginResult<NewPasswordFormData> => {
    const login = useLogin();
    const [requireNewPassword, setRequireNewPassword] = useSafeSetState(false);

    const mutation = useMutation<
        unknown,
        unknown,
        LoginFormData | NewPasswordFormData
    >(values => login(values, redirectTo));

    const cognitoLogin = useCallback(
        (values: LoginFormData | NewPasswordFormData) => {
            return mutation.mutateAsync(values).catch(error => {
                if (error instanceof ErrorRequireNewPassword) {
                    setRequireNewPassword(true);
                    return;
                }

                throw error;
            });
        },
        [mutation, setRequireNewPassword]
    );

    return [cognitoLogin, { ...mutation, requireNewPassword }];
};
