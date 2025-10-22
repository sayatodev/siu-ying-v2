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

    public toEmbeds() {
        const fields: EmbedField[] = [];

        /* == Rainstorm Warning == */
        if (this.data.WRAIN) {
            fields.push({
                name: CONSTS.EMOJIS.HKO.WARNINGS[this.data.WRAIN.code] + " " + ((this.data.WRAIN.type ?? "") + (this.data.WRAIN.name ?? "")),
                value: `發出時間: ${parseTimestringToDiscordTimestamp(this.data.WRAIN.issueTime)}`,
                inline: false
            });
        }

        /* == Typhoon Warning == */
        if (this.data.WTCSGNL && this.data.WTCSGNL.code === "CANCEL") {
            // All typhoon warnings cancelled recently, use a separate embed
            const tcCancelEmbed = new SiuYingEmbed().setColor("Yellow")
                .setTitle("所有熱帶氣旋警告已經取消");
            if (fields.length > 0) {
                const remainingWarningsEmbed = new SiuYingEmbed().setColor("Red")
                    .setTitle("以下惡劣天氣警告仍然生效")
                    .addFields(fields);
                return [tcCancelEmbed, remainingWarningsEmbed];
            } else {
                return [tcCancelEmbed];
            }
        }

        if (this.data.WTCSGNL) {
            fields.push({
                name: CONSTS.EMOJIS.HKO.WARNINGS[this.data.WTCSGNL.code] + " " + (this.data.WTCSGNL.type ?? ""),
                value: `發出時間: ${parseTimestringToDiscordTimestamp(this.data.WTCSGNL.issueTime)}`,
                inline: false
            });
        }

        return [new SiuYingEmbed().setColor("Red")
            .setTitle("以下惡劣天氣警告現正生效")
            .addFields(fields)];
    }
}
