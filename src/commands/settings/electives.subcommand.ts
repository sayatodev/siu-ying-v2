import type { ChatInputCommandInteraction } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { User } from "../../classes/Database/User.js";
import { CONSTS } from "../../consts.js";
import type { UserSettingsData } from "../../types/general.types.js";
import { SiuYingEmbed } from "../../util/embed.js";

export default {
    data: {
        name: "electives",
        description: "Change the displayed electives for timetable commands. (For S4-S6)",
        options: [
            {
                name: "1x",
                description: "The elective you want to set as default for 1X. Leave blank to remove default elective.",
                type: ApplicationCommandOptionType.String,
                required: false,
            },
            {
                name: "2x",
                description: "The elective you want to set as default for 2X. Leave blank to remove default elective.",
                type: ApplicationCommandOptionType.String,
                required: false,
            },
            {
                name: "3x",
                description: "The elective you want to set as default for 3X. Leave blank to remove default elective.",
                type: ApplicationCommandOptionType.String,
                required: false,
            }
        ]
    },

    async execute(interaction: ChatInputCommandInteraction) {
        const data: Partial<UserSettingsData> = {}
        const tests: Array<{ message: string, run(data: Partial<UserSettingsData>): boolean }> = [
            {
                run: ({ elective_1x, elective_2x, elective_3x }) => {
                    return Object.values({ elective_1x, elective_2x, elective_3x }).every(
                        elective => !elective || Object.keys(CONSTS.CALENDAR.LOCALE_STRINGS.ZH_TRAD.SUBJECT).includes(elective)
                    )
                },
                message: `Invalid elective. Valid electives are: \`${Object.keys(CONSTS.CALENDAR.LOCALE_STRINGS.ZH_TRAD.SUBJECT).join("`, `")}\``
            },
        ]

        for (const key of ["1X", "2X", "3X"]) {
            const elective = interaction.options.getString(key.toLowerCase() as "1x" | "2x" | "3x")?.toUpperCase() as "1X" | "2X" | "3X";
            data[`elective_${key.toLowerCase() as "1x" | "2x" | "3x"}`] = elective ?? null;
        }

        for (const test of tests) {
            if (!test.run(data)) {
                return void await interaction.reply({
                    embeds: [new SiuYingEmbed({ user: interaction.user }).setTitle("Failed to update user settings").setDescription(test.message).setColor("Red")],
                    ephemeral: true,
                })
            }
        }

        await interaction.deferReply({ ephemeral: true });
        await User.updateOrCreate(interaction.user.id, data);

        const keyToDisplay = new Map([
            ["elective_1x", "1X elective"],
            ["elective_2x", "2X elective"],
            ["elective_3x", "3X elective"],
        ])

        await interaction.editReply({
            embeds: [
                new SiuYingEmbed({ user: interaction.user })
                    .setTitle("User Settings")
                    .setDescription("Your settings have been updated.")
                    .addFields({
                        name: "New settings",
                        value: Object.entries(data).map((
                            [key, value]) =>
                            `${keyToDisplay.get(key) ?? key} set to ${value ?? "(None)"}`
                        ).join("\n") || "No changes"
                    })
                    .setColor("Blue")
            ]
        })
    },
}
