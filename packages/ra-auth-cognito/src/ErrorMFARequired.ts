/**
 * Error thrown when a user is required to enter a MFA code from SMS.
 * Unsupported.
 */
export class ErrorMFARequired extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, ErrorMFARequired.prototype);
    }
}
