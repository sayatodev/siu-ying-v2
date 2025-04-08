import { Events } from 'discord.js';
import type { Event } from './index.js';

export default {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}. Currently in ${client.guilds.cache.size} guilds.`);
		for (const guild of client.guilds.cache.values()) {
			console.log(`${guild.name} | ${guild.id}`);
		}
	},
} satisfies Event<Events.ClientReady>;
