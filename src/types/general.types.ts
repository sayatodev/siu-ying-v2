import type { ApplicationCommandOptionType } from 'discord.js';
import type { Database } from './database.types.js';
import type { ApiDayOfCycleString } from './timetable.types.js';

export type UserSettingsData = Omit<Database['public']['Tables']['user_data']['Row'], 'created_at' | 'id' | 'userId'>;

export type SubCommandWithOnlyStringOptions = {
	description: string;
	name: string;
	required: boolean;
	type: ApplicationCommandOptionType.String;
};

export type ApiEventsSchedulesData = {
	rows: {
		[date: string]: ApiEventsSchedulesRow
	},
	success: boolean;
}

export type ApiEventsSchedulesRow = {
	cycle: "Cycle" | `Cycle ${number}`;
	cycleDay: `Day ${ApiDayOfCycleString}` | null
	slots: {
		[slotId: string]: {
			S1: string[];
			S2: string[];
			S3: string[];
			S4: string[];
			S5: string[];
			S6: string[];
			fullName: string;
			otherActivities: string[];
			remarks: string[];
		}
	}
}
