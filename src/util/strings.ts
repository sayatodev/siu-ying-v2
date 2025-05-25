type MaxLengthOptions = {
    alpha: number; // factor for alphabetic characters
}
export function maxLength(str: string, max: number, { alpha = 1 }: MaxLengthOptions): string {
    let length = 0;
    let result = "";
    for (const char of str) {
        const charLength = /[\d!(),./A-Z[\]a-z{}-]/.test(char) ? alpha : 1; // Use alpha factor for half-width characters
        if (length + charLength > max) {
            result += "...";
            break;
        }

        result += char;
        length += charLength;
    }

    return result;
}
