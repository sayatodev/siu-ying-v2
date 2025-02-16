import type { Interaction } from "discord.js";
import { EmbedBuilder } from "discord.js";

// This is a custom embed class that extends the EmbedBuilder class from discord.js
// All embeds in the bot should be made using this class
export class SiuYingEmbed extends EmbedBuilder {
    public constructor(data: {
        simple?: boolean;
        user?: Interaction["user"];
    } = {}) {
        super();
        this.setColor("#FFD700");
        if (!data.simple) this.setAuthor({
            name: "SPYC Siu Ying",
            iconURL: "https://cdn.discordapp.com/avatars/933610860012793877/e7fe11793f2491a66bfdf79ba4e21fdc.webp?size=160",
        })
        if (data.user && !data.simple) this.setFooter({
            text: `Requested by ${data.user.tag}`,
            iconURL: data.user.displayAvatarURL(),
        })
    }
}
