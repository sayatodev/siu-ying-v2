export function maxLength(str: string, max: number) {
    return str.length > max ? str.slice(0, max - 3) + "..." : str;
}
