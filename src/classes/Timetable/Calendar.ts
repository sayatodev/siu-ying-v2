import fs from 'node:fs/promises';
import path from 'node:path';
import type { Moment } from 'moment-timezone';
import { CONFIG } from '../../config.js';
import { CONSTS } from '../../consts.js';
import { DayOfCycle, OtherDay } from '../../enums/calendar.js';
import type { ApiCalendarData, ApiDayOfDateString } from '../../types/timetable.types.js';
import { Api } from '../Api/index.js';
import logger from '../Logger/index.js';

const { CALENDAR: consts } = CONSTS;

// Path to save the calendar data, relative to the current file's directory
const savePath = path.join((import.meta as any).dirname, CONFIG.TIMETABLE.CALENDAR_REL_SAVE_PATH);

// Class to represent the school's calendar (Day to DayOfCycle mapping)
export class Calendar {
	// Map of day to DayOfCycle, should not be accessed directly
	private readonly data: Map<string, ApiDayOfDateString>;

	// Create a new instance of the calendar
	private constructor(data: ApiCalendarData) {
		this.data = new Map(Object.entries(data));
	}

	// Get the school's calendar from the API
	public static async fromApi({ saveToFile = false } = {}): Promise<Calendar> {
		const data = await Api.getCalendar();
		const cal = new Calendar(data);

		// Save the data to file if requested
		if (saveToFile) void cal.saveToFile();
		return cal;
	}

	// Get the school's calendar from a file
	public static async fromFile(): Promise<Calendar> {
		try {
			const data = await fs.readFile(savePath, 'utf8');
			return new Calendar(JSON.parse(data));
		} catch (error) {
			// If file not found or failed to read, try to get from API
			logger.error('Failed to read calendar data from file', error);
			return Calendar.fromApi({ saveToFile: true });
		}
	}

	// Get the DayOfCycle for a given date
	public getDayOfCycle(moment: Moment): DayOfCycle | OtherDay | null {
		logger.warn(`getting with key ${moment.format(CONFIG.API.FORMATS.CALENDAR_KEY)}`);
		const day = this.data.get(moment.format(CONFIG.API.FORMATS.CALENDAR_KEY));
		if (!day) {
			// day must be undefined to be falsy, return null for consistency
			logger.warn('day not found');
			return null;
		}

		if (day === consts.OTHER_DAYS.HOLIDAY) {
			// Return holiday if the day is a holiday
			return OtherDay.HOLIDAY;
		}

		if (consts.DAYS_OF_CYCLE.includes(day)) {
			// Return the DayOfCycle if the day is a valid day, this will be a enum value
			return DayOfCycle[day as keyof typeof DayOfCycle];
		}

		// Should not reach here
		logger.error(`Invalid day of cycle: ${day}`);
		return null;
	}

	// Save the calendar data to a file
	private async saveToFile() {
		try {
			await fs.writeFile(savePath, JSON.stringify(Object.fromEntries(this.data)));
		} catch (error) {
			logger.error('Failed to save calendar data to file', error);
		}
	}
}
