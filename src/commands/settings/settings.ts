import type { ButtonInteraction, CommandInteraction } from "discord.js";
import { ActionRowBuilder, ApplicationCommandOptionType, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { User } from "../../classes/Database/User.js";
import { CONFIG } from "../../config.js";
import { CONSTS } from "../../consts.js";
import type { SubCommandWithOnlyStringOptions, UserSettingsData } from "../../types/general.types.js";
import { SiuYingEmbed } from "../../util/embed.js";
import type { Command } from "../index.js";
import classSubcommand from "./class.subcommand.js";
import electivesSubcommand from "./electives.subcommand.js";
import viewSubcommand from "./view.subcommand.js";

export default {
    data: {
        name: "settings",
        description: "Change user settings.",
        options: [classSubcommand, electivesSubcommand, viewSubcommand].map(subcommand => ({
            name: subcommand.data.name,
            description: subcommand.data.description,
            type: ApplicationCommandOptionType.Subcommand,
            options: subcommand.data.options as SubCommandWithOnlyStringOptions[],
            required: false,
        }))
    },

    subcommands: new Map()
        .set(classSubcommand.data.name, classSubcommand)
        .set(electivesSubcommand.data.name, electivesSubcommand)
        .set(viewSubcommand.data.name, viewSubcommand),

    async execute(_interaction: ButtonInteraction | CommandInteraction) { },

    async handleButton(interaction, customId) {
        switch (customId) {
            case "prompt-class": {
                const modal = new ModalBuilder()
                    .setCustomId("settings:set-class")
                    .setTitle("User Settings")

                const classInput = new TextInputBuilder()
                    .setCustomId("settings:set-class:input")
                    .setLabel("Default class for timetable commands")
                    .setPlaceholder("Enter your class, e.g. 1A")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false);

                const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(classInput);

                modal.addComponents(firstRow);

                await interaction.showModal(modal);
                break;
            }

            case "prompt-electives": {
                const modal = new ModalBuilder()
                    .setCustomId("settings:set-electives")
                    .setTitle("User Settings (For S4-S6)")

                const electives = {
                    "1X": new TextInputBuilder()
                        .setCustomId("settings:set-electives:1X")
                        .setLabel("1X elective (Leave blank to remove)")
                        .setPlaceholder("Enter the elective for 1X")
                        .setRequired(false)
                        .setStyle(TextInputStyle.Short),
                    "2X": new TextInputBuilder()
                        .setCustomId("settings:set-electives:2X")
                        .setLabel("2X elective (Leave blank to remove)")
                        .setPlaceholder("Enter the elective for 2X")
                        .setRequired(false)
                        .setStyle(TextInputStyle.Short),
                    "3X": new TextInputBuilder()
                        .setCustomId("settings:set-electives:3X")
                        .setLabel("3X elective (Leave blank to remove)")
                        .setPlaceholder("Enter the elective for 3X")
                        .setRequired(false)
                        .setStyle(TextInputStyle.Short),
                }

                for (const key of Object.keys(electives) as Array<keyof typeof electives>) {
                    const row = new ActionRowBuilder<TextInputBuilder>().addComponents(electives[key]);
                    modal.addComponents(row);
                }

                await interaction.showModal(modal);
                break;
            }

            default: {
                return void await interaction.reply({
                    embeds: [new SiuYingEmbed({ user: interaction.user }).setTitle("Failed to update user settings").setDescription("Invalid action.").setColor("Red")],
                    ephemeral: true,
                })
            }
        }
    },

    async handleModal(interaction, customId, fields) {
        let tests: Array<{ message: string, run(data: Partial<UserSettingsData>): boolean }> = [];
        let data: Partial<UserSettingsData> = {};
        
        // For now, there are only two possible customIds: "set-class" and "set-electives"

        switch (customId) {
            case "set-class": {
                tests = [
                    { run: ({ cls }) => !cls || CONFIG.GENERAL.CLASSES.includes(cls), message: "Invalid class." },
                ]

                data = {
                    cls: fields.getTextInputValue("settings:set-class:input").toUpperCase() || null,
                }
                break;
            }

            case "set-electives": {
                tests = [
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
                    const elective = fields.getTextInputValue(`settings:set-electives:${key}`)?.toUpperCase() as "1X" | "2X" | "3X";
                    data[`elective_${key.toLowerCase() as "1x" | "2x" | "3x"}`] = elective ? elective : null;
                }

                break;
            }

            default: {
                return void await interaction.reply({
                    embeds: [new SiuYingEmbed({ user: interaction.user }).setTitle("Failed to update user settings").setDescription("Invalid action.").setColor("Red")],
                    ephemeral: true,
                })
            }
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
            ["cls", "Default class"],
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
                            `${keyToDisplay.get(key) ?? key} set to ${value ?? "(None)"}` // If value is null, display "(None)"
                        ).join("\n") || "No changes"
                    })
                    .setColor("Blue")
            ]
        })
    }
} satisfies Command;
