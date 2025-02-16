export function parseApiCalendarDate(date: string): Date {
    // "01/09/2024"
    const [day, month, year] = date.split('/');
    return new Date(Number(year), Number(month) - 1, Number(day));
}

export function parseTimestringToDiscordTimestamp(timestring: string, format?:string): string {
    const date = new Date(timestring);
    if (format) return `<t:${Math.floor(date.getTime() / 1_000)}:${format}>`;
    return `<t:${Math.floor(date.getTime() / 1_000)}>`;
}
