import { Validator } from 'react-admin';

/**
 * A react-admin validator that checks that a field matches another field.
 * @param field The name of the field to compare to.
 * @param message The message to display when the fields do not match. Defaults to 'ra.validation.do_not_match'.
 * @example
 * import { validatePasswordsMatch } from 'ra-auth-cognito';
 * import { SimpleForm, TextInput } from 'react-admin';
 *
 * const MyForm = () => (
 *    <SimpleForm>
 *       <TextInput source="password" type="password" />
 *      <TextInput source="passwordConfirm" type="password" validate={validatePasswordsMatch('password')} />
 *   </SimpleForm>
 * );
 */
export const validatePasswordsMatch =
    (
        field: string,
        message = {
            message: 'ra.validation.do_not_match',
            args: { _: 'Passwords do not match' },
        }
    ): Validator =>
    (value: string, allValues: any) => {
        if (value !== allValues[field]) {
            return message;
        }
    };
