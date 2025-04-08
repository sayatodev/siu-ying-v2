import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from 'discord.js';
import { SiuYingEmbed } from '../util/embed.js';
import type { Command } from './index.js';

const SUBJECTS = [
	{ subj: 'phy/eng', paper: ['p1a', 'p1b', 'p2', 'ans'] },
	{ subj: 'ict/eng', paper: ['p1', 'p2a', 'p2b', 'p2c', 'p2d', 'ans'] },
	{ subj: 'm2', paper: ['pp', 'ans'] },
	{ subj: 'm1', paper: ['pp', 'ans'] },
	{ subj: 'bio/eng', paper: ['p1', 'p2', 'ans'] },
	{ subj: 'econ/eng', paper: ['p1', 'p2', 'ans'] },
	{ subj: 'chem/eng', paper: ['p1', 'p2', 'ans'] },
];

export default {
	data: {
		name: 'dselife',
		description: 'Browse the dse.life archives',
		options: [
			{
				name: 'subject',
				description: 'Subject',
				type: ApplicationCommandOptionType.String,
				choices: [
					{ name: 'bio', value: 'bio' },
					{ name: 'chem', value: 'chem' },
					{ name: 'm1', value: 'm1' },
					{ name: 'm2', value: 'm2' },
					{ name: 'phy', value: 'phy' },
					{ name: 'ict', value: 'ict' },
					{ name: 'econ', value: 'econ' },
				],
				required: true,
			},
			{
				name: 'year',
				description: 'Year',
				type: ApplicationCommandOptionType.String,
				required: true,
				choices: [
					{ name: '2023', value: '2023' },
					{ name: '2022', value: '2022' },
					{ name: '2021', value: '2021' },
					{ name: '2020', value: '2020' },
					{ name: '2019', value: '2019' },
					{ name: '2018', value: '2018' },
					{ name: '2017', value: '2017' },
					{ name: '2016', value: '2016' },
					{ name: '2015', value: '2015' },
					{ name: '2014', value: '2014' },
					{ name: '2013', value: '2013' },
					{ name: '2012', value: '2012' },
				],
			},
		],
	},
	async execute(interaction: ChatInputCommandInteraction) {
		const subject = interaction.options.getString('subject', true);
		const year = interaction.options.getString('year', true);

		const subjectData = SUBJECTS.find((item) => item.subj.startsWith(subject));
		if (!subjectData) {
			return void (await interaction.reply({
				content: 'Invalid subject',
				ephemeral: true,
			}));
		}

		await interaction.deferReply({ ephemeral: true });

		try {
			const { subj, paper } = subjectData;
			const body = paper.map((pp) => {
				return `[${pp}](https://dse.life/static/pp/${subj}/dse/${year}/${pp}.pdf)`;
			}).join('  ');
			await interaction.editReply({
				content: `## ${year} ${subj}\nSearch Results:\n${body}\n-# This command is only a search tool. dse.life may shut down their services anytime.`,
			});
		} catch (error) {
			console.error(error);
			await interaction.editReply({
				content: '',
				embeds: [
					new SiuYingEmbed({ user: interaction.user })
						.setColor('Red')
						.setTitle('Error')
						.setDescription('An error occurred.'),
				],
			});
		}
	},
} satisfies Command;
