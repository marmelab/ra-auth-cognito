import { Box, Button, CardContent, CircularProgress } from '@mui/material';
import clsx from 'clsx';
import * as qrcodeReact from 'qrcode.react';
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

// qrcode.react v3 is CommonJS only, and Node's ESM loader can't detect its
// named exports: they are only reachable through the default export there.
const { QRCodeSVG } =
    'QRCodeSVG' in qrcodeReact
        ? qrcodeReact
        : (qrcodeReact as unknown as { default: typeof qrcodeReact }).default;

export type MfaTotpAssociationFormProps = {
    className?: string;
    submit: SubmitHandler<FormData>;
    isLoading?: boolean;
    secretCode: string;
    username: string;
    applicationName: string;
};

export const MfaTotpAssociationForm = ({
    className,
    submit,
    isLoading,
    secretCode,
    username,
    applicationName,
}: MfaTotpAssociationFormProps) => {
    const translate = useTranslate();
    const otpUrl = `otpauth://totp/${username}?secret=${secretCode}&issuer=${applicationName}`;

    return (
        <Form
            onSubmit={submit}
            mode="onChange"
            noValidate
            className={clsx('RaLoginForm-root', className)}
        >
            <CardContent className={LoginFormClasses.content}>
                <Box sx={{ maxWidth: '720px', pb: 2, margin: 'auto' }}>
                    {translate('ra.auth.cognito.mfa.totp.association_required')}
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        pb: 2,
                    }}
                >
                    <QRCodeSVG value={otpUrl} />
                    <Button
                        size="small"
                        onClick={() =>
                            navigator.clipboard.writeText(secretCode)
                        }
                        variant="text"
                    >
                        {translate(
                            'ra.auth.cognito.mfa.totp.copy_totp_url_to_clipboard'
                        )}
                    </Button>
                </Box>
                <TextInput
                    autoFocus
                    source="association"
                    label="ra.auth.cognito.mfa.totp.label"
                    helperText="ra.auth.cognito.mfa.totp.association_helper_text"
                    validate={required()}
                    fullWidth
                    InputProps={{
                        autoComplete: 'false',
                    }}
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
