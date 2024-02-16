import {
    Button,
    CardContent,
    CircularProgress,
    Typography,
} from '@mui/material';
import clsx from 'clsx';
import * as React from 'react';
import {
    Form,
    LoginFormClasses,
    TextInput,
    required,
    useTranslate,
} from 'react-admin';
import type { SubmitHandler } from 'react-hook-form';
import type { FormData } from './useCognitoLogin';
import { validatePasswordsMatch } from './validatePasswordsMatch';

export type RequestNewPasswordFormProps = {
    className?: string;
    submit: SubmitHandler<FormData>;
    isLoading?: boolean;
};

export const RequestNewPasswordForm = ({
    className,
    submit,
    isLoading,
}: RequestNewPasswordFormProps) => {
    const translate = useTranslate();

    return (
        <Form
            onSubmit={submit}
            mode="onChange"
            noValidate
            className={clsx('RaLoginForm-root', className)}
        >
            <CardContent className={LoginFormClasses.content}>
                <Typography>
                    {translate('ra.auth.cognito.require_new_password', {
                        _: translate('ra.auth.require_new_password', {
                            _: 'Please enter a new password',
                        }),
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
                    validate={[
                        required(),
                        validatePasswordsMatch('newPassword'),
                    ]}
                    fullWidth
                />

                <Button
                    variant="contained"
                    type="submit"
                    color="primary"
                    disabled={isLoading}
                    fullWidth
                    className={LoginFormClasses.button}
                >
                    {isLoading ? (
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
