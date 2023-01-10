/**
 * Error thrown when a user is required to set their password after signing-in with a temporary password.
 */
export class ErrorRequireNewPassword extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, ErrorRequireNewPassword.prototype);
    }
}
