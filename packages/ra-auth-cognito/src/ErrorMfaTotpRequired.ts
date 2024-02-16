/**
 * Error thrown when a user is required to enter a TOTP code.
 */
export class ErrorMfaTotpRequired extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, ErrorMfaTotpRequired.prototype);
    }
}
