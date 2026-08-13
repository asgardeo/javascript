export class ExpressUtils {

    private static readonly AUTH_CODE_REGEXP: RegExp = /[?&]error=[^&]+/;

    /**
     * Util function to check if the URL contains an error.
     *
     * @param url - URL to be checked.
     *
     * @returns {boolean} - True if the URL contains an error.
     */
    public static hasErrorInURL(url: string): boolean {

        return this.AUTH_CODE_REGEXP.test(url);
    }
}
