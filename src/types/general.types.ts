import type { ApplicationCommandOptionType } from 'discord.js';
import type { Database } from './database.types.js';

export type UserSettingsData = Omit<Database['public']['Tables']['user_data']['Row'], 'created_at' | 'id' | 'userId'>;

export type SubCommandWithOnlyStringOptions = {
	description: string;
	name: string;
	required: boolean;
	type: ApplicationCommandOptionType.String;
};

export type EventsDataJSON = Array<Partial<{
	Cycle: number;
	Date: number;
	Day: string;
	Month: number;
	'Other Activities (School circulars)': string;
	Remarks: string;
	S1: string;
	S2: string;
	S3: string;
	S4: string;
	S5: string;
	S6: string;
	Slot: string;
	Week: string;
	Year: number;
	field10: string;
	field5: number;
	field9: string;
	session_id: string;
}>>;
