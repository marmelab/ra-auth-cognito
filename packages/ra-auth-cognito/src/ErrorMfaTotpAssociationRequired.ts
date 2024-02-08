/**
 * Error thrown when an association is required.
 */
export class ErrorMfaTotpAssociationRequired extends Error {
    secretCode: string;
    username: string;
    applicationName: string;

    constructor(
        {
            secretCode,
            username,
            applicationName,
        }: {
            secretCode: string;
            username: string;
            applicationName: string;
        },
        message?: string
    ) {
        super(message);
        this.secretCode = secretCode;
        this.username = username;
        this.applicationName = applicationName;
        Object.setPrototypeOf(this, ErrorMfaTotpAssociationRequired.prototype);
    }
}
