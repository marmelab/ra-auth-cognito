/**
 * Error thrown when a user is required to enter a MFA code from SMS.
 * Unsupported.
 */
export class ErrorMFASmsRequired extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, ErrorMFASmsRequired.prototype);
    }
}
