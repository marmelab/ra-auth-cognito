import * as React from 'react';
import { Login as RaLogin, useNotify } from 'react-admin';
import { SubmitHandler } from 'react-hook-form';
import { MfaTotpAssociationForm } from './MfaTotpAssociationForm';
import { RequestNewPasswordForm } from './RequestNewPasswordForm';
import { MfaTotpForm } from './MfaTotpForm';
import { UserPasswordForm } from './UserPasswordForm';
import type { FormData } from './useCognitoLogin';
import { useCognitoLogin } from './useCognitoLogin';

export const Login = (props: any) => {
    return (
        <RaLogin {...props}>
            <LoginForm />
        </RaLogin>
    );
};

export const LoginForm = (props: any) => {
    const { redirectTo, className } = props;
    const notify = useNotify();
    const [
        login,
        {
            isLoading,
            requireNewPassword,
            requireMfaTotp,
            requireMfaTotpAssociation,
            secretCode,
            username,
            applicationName,
        },
    ] = useCognitoLogin({
        redirectTo,
    });

    const submit: SubmitHandler<FormData> = values => {
        login(values).catch(error => {
            notify(
                typeof error === 'string'
                    ? error
                    : typeof error === 'undefined' || !error.message
                      ? 'ra.auth.sign_in_error'
                      : error.message,
                {
                    type: 'error',
                    messageArgs: {
                        _:
                            typeof error === 'string'
                                ? error
                                : error && error.message
                                  ? error.message
                                  : undefined,
                    },
                }
            );
        });
    };

    if (requireNewPassword) {
        return (
            <RequestNewPasswordForm
                submit={submit}
                className={className}
                isLoading={isLoading}
            />
        );
    }

    if (requireMfaTotp) {
        return (
            <MfaTotpForm
                submit={submit}
                className={className}
                isLoading={isLoading}
            />
        );
    }

    if (requireMfaTotpAssociation) {
        return (
            <MfaTotpAssociationForm
                submit={submit}
                className={className}
                isLoading={isLoading}
                secretCode={secretCode}
                username={username}
                applicationName={applicationName}
            />
        );
    }

    return (
        <UserPasswordForm
            submit={submit}
            isLoading={isLoading}
            className={className}
        />
    );
};
