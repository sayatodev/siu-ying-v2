export type HkoWarningProperty = "WCOLD" | "WFIRE" | "WFNTSA" | "WFROST" | "WHOT" | "WL" | "WMSGNL" | "WRAIN" | "WTCSGNL" | "WTMW" | "WTS"

export type HkoWarningCode<Property extends HkoWarningProperty> =
    Property extends "WFIRE" ? "WFIRER" | "WFIREY"
    : Property extends "WFROST" ? "WFROST"
    : Property extends "WHOT" ? "WHOT"
    : Property extends "WCOLD" ? "WCOLD"
    : Property extends "WMSGNL" ? "WMSGNL"
    : Property extends "WRAIN" ? "WRAINA" | "WRAINB" | "WRAINR"
    : Property extends "WFNTSA" ? "WFNTSA"
    : Property extends "WL" ? "WL"
    : Property extends "WTCSGNL" ? "TC1" | "TC3" | "TC8NE" | "TC8NW" | "TC8SE" | "TC8SW" | "TC9" | "TC10"
    : Property extends "WTMW" ? "WTMW"
    : Property extends "WTS" ? "WTS" : never

export type HkoActionCode = "CANCEL" | "EXPAND" | "ISSUE" | "REISSUE" | "UPDATE"

export type HkoWarningSummary = {
    [property in HkoWarningProperty]?: {
        actionCode: HkoActionCode;
        code: HkoWarningCode<property>;
        expireTime?: string;
        issueTime: string;
        name: string;
        type?: string;
        updateTime: string;
    }
}
