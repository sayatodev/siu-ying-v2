import type { EmbedField } from "discord.js";
import { CONSTS } from "../../consts.js";
import type { HkoWarningProperty, HkoWarningSummary } from "../../types/hko.types.js";
import { parseTimestringToDiscordTimestamp } from "../../util/Api/parsers.js";
import { SiuYingEmbed } from "../../util/embed.js";
import { Hko } from "./Hko.js";

export class Warnings {
    private readonly data: HkoWarningSummary;

    private constructor(data: HkoWarningSummary) {
        this.data = data;
    }

    public get length() {
        return Object.keys(this.data).length;
    }

    public static async fetch(): Promise<Warnings> {
        return new Warnings(await Hko.getWarningSummary());
    }

    public filterTyphoonOrRainstorm() {
        const targets = ["WTCSGNL", "WRAIN"];
        return new Warnings(Object.fromEntries(
            Object.entries(this.data)
                .filter(([key]) => targets.includes(key as HkoWarningProperty))
        ))
    }

    public toEmbed() {
        const fields: EmbedField[] = [];

        if (this.data.WRAIN) {
            fields.push({
                name: CONSTS.EMOJIS.HKO.WARNINGS[this.data.WRAIN.code] + " " + ((this.data.WRAIN.type ?? "") + (this.data.WRAIN.name ?? "")),
                value: `發出時間: ${parseTimestringToDiscordTimestamp(this.data.WRAIN.issueTime)}`,
                inline: false
            });
        }

        if (this.data.WTCSGNL) {
            fields.push({
                name: CONSTS.EMOJIS.HKO.WARNINGS[this.data.WTCSGNL.code] + " " + (this.data.WTCSGNL.type ?? ""),
                value: `發出時間: ${parseTimestringToDiscordTimestamp(this.data.WTCSGNL.issueTime)}`,
                inline: false
            });
        }

        return new SiuYingEmbed().setColor("Red")
            .setTitle("以下惡劣天氣警告現正生效")
            .addFields(fields);
    }
}
