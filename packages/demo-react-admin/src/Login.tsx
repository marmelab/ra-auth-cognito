import {
    Button,
    CardContent,
    CircularProgress,
    Typography,
} from '@mui/material';
import * as React from 'react';
import {
    Form,
    Login as RaLogin,
    LoginFormClasses,
    required,
    TextInput,
    useLogin,
    useNotify,
    useSafeSetState,
    useTranslate,
} from 'react-admin';
import clsx from 'clsx';
import { ErrorRequireNewPassword } from 'ra-auth-cognito';
import { SubmitHandler } from 'react-hook-form';

export const Login = (props: any) => {
    return (
        <RaLogin {...props}>
            <LoginForm />
        </RaLogin>
    );
};

type LoginFormData = {
    username: string;
    password: string;
};

type NewPasswordFormData = {
    newPassword: string;
    confirmNewPassword: string;
};

type FormData = LoginFormData | NewPasswordFormData;

export const LoginForm = (props: any) => {
    const { redirectTo, className } = props;
    const [loading, setLoading] = useSafeSetState(false);
    const [requireNewPassword, setRequireNewPassword] = useSafeSetState(false);
    const login = useLogin();
    const translate = useTranslate();
    const notify = useNotify();

    const submit: SubmitHandler<FormData> = values => {
        if ((values as NewPasswordFormData).confirmNewPassword) {
            if (
                (values as NewPasswordFormData).newPassword !==
                (values as NewPasswordFormData).confirmNewPassword
            ) {
                const error = translate(
                    'ra.validation.passwords_do_not_match',
                    {
                        _: 'Passwords do not match',
                    }
                );
                return {
                    newPassword: error,
                    confirmNewPassword: error,
                };
            }
        }

        let finalValues = (values as NewPasswordFormData).confirmNewPassword
            ? {
                  newPassword: (values as NewPasswordFormData).newPassword,
              }
            : values;

        setLoading(true);
        login(finalValues, redirectTo)
            .then(() => {
                setLoading(false);
            })
            .catch(error => {
                if (error instanceof ErrorRequireNewPassword) {
                    setRequireNewPassword(true);
                    setLoading(false);
                    return;
                }
                setLoading(false);
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
            <Form
                onSubmit={submit}
                mode="onChange"
                noValidate
                className={clsx('RaLoginForm-root', className)}
            >
                <CardContent className={LoginFormClasses.content}>
                    <Typography>
                        {translate('ra.auth.require_new_password', {
                            _: 'Please enter a new password',
                        })}
                    </Typography>
                    <TextInput
                        source="newPassword"
                        label={translate('ra.auth.password')}
                        type="password"
                        validate={required()}
                        fullWidth
                    />
                    <TextInput
                        source="confirmNewPassword"
                        label={translate('ra.auth.confirm_password', {
                            _: 'Confirm password',
                        })}
                        type="password"
                        validate={required()}
                        fullWidth
                    />

                    <Button
                        variant="contained"
                        type="submit"
                        color="primary"
                        disabled={loading}
                        fullWidth
                        className={LoginFormClasses.button}
                    >
                        {loading ? (
                            <CircularProgress
                                className={LoginFormClasses.icon}
                                size={19}
                                thickness={3}
                            />
                        ) : (
                            translate('ra.auth.sign_in')
                        )}
                    </Button>
                </CardContent>
            </Form>
        );
    }

    return (
        <Form
            onSubmit={submit}
            mode="onChange"
            noValidate
            className={clsx('RaLoginForm-root', className)}
        >
            <CardContent className={LoginFormClasses.content}>
                <TextInput
                    autoFocus
                    source="username"
                    label={translate('ra.auth.username')}
                    validate={required()}
                    fullWidth
                />
                <TextInput
                    source="password"
                    label={translate('ra.auth.password')}
                    type="password"
                    autoComplete="current-password"
                    validate={required()}
                    fullWidth
                />

                <Button
                    variant="contained"
                    type="submit"
                    color="primary"
                    disabled={loading}
                    fullWidth
                    className={LoginFormClasses.button}
                >
                    {loading ? (
                        <CircularProgress
                            className={LoginFormClasses.icon}
                            size={19}
                            thickness={3}
                        />
                    ) : (
                        translate('ra.auth.sign_in')
                    )}
                </Button>
            </CardContent>
        </Form>
    );
};
