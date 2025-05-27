type MaxLengthOptions = {
    halfWidthFactor: number; // factor for alphabetic characters
}
const HALF_WIDTH_PATTERN = /[\u0020-\u007E\uFF61-\uFF9F]/

export function maxLength(str: string, max: number, { halfWidthFactor = 1 }: MaxLengthOptions): string {
    let accumulatedLength = 0;
    let result = "";

    for (const char of str) {
        const charLength = HALF_WIDTH_PATTERN.test(char) ? halfWidthFactor : 1; // Use alpha factor for half-width characters
        if (accumulatedLength + charLength > max) {
            result += "...";
            break;
        }

        result += char;
        accumulatedLength += charLength;
    }

    return result;
}
