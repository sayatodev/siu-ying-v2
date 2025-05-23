import fs from 'node:fs/promises';
import path from 'node:path';
import { CONFIG } from '../../config.js';
import { DayOfCycle } from '../../enums/calendar.js';
import type {
	ApiSchedulesData,
	ApiSchedule_OneClassData,
	ApiSchedule_OneScheduleData,
	ApiDayOfCycleString,
} from '../../types/timetable.types.js';
import { Api } from '../Api/index.js';
import logger from '../Logger/index.js';

const savePath = path.join((import.meta as any).dirname, CONFIG.TIMETABLE.SCHEDULES_REL_SAVE_PATH);

// Exporting type only as the ClassSchedules class should only be used internally
export type ClassSchedules = InstanceType<typeof _ClassSchedules>;

// Day-Schedule mapping for one specific class
class _ClassSchedules {
	private readonly data: Map<ApiDayOfCycleString, ApiSchedule_OneScheduleData[]>;

	public constructor(data: ApiSchedule_OneClassData) {
		this.data = new Map(Object.entries(data) as Array<[ApiDayOfCycleString, ApiSchedule_OneScheduleData[]]>);
	}

	// Get the schedules for a specific day of the cycle
	public getDaySchedules(dayOfCycle: DayOfCycle): ApiSchedule_OneScheduleData[] | null {
		return this.data.get(DayOfCycle[dayOfCycle] as ApiDayOfCycleString) ?? null;
	}
}

// Class to represent the school's schedules (Class to ClassSchedules mapping)
export class Schedules {
	private readonly rawData: ApiSchedulesData;

	private readonly data: Map<string, ClassSchedules>;

	private constructor(data: ApiSchedulesData) {
		this.rawData = data;
		// Convert the raw data to Map<"Class", ClassSchedules>
		this.data = new Map(Object.entries(data).map(([cls, schedules]) => [cls, new _ClassSchedules(schedules)]));
	}

	// Fetch the school's schedules from the API
	public static async fromApi({ saveToFile = false } = {}): Promise<Schedules> {
		const data = await Api.getTimetable();
		const sched = new Schedules(data);
		if (saveToFile) void sched.saveToFile();
		return sched;
	}

	// Get the cached schedules from the file specified in config
	public static async fromFile(): Promise<Schedules> {
		try {
			const data = await fs.readFile(savePath, 'utf8');
			return new Schedules(JSON.parse(data));
		} catch (error) {
			// If file not found or failed to read, try to get from API
			logger.error('Failed to read calendar data from file', error);
			return Schedules.fromApi({ saveToFile: true });
		}
	}

	// Get the schedules for a specific class
	public getClassSchedule(cls: string): ClassSchedules | null {
		return this.data.get(cls) ?? null;
	}

	// Save the schedules data to a file
	private async saveToFile() {
		try {
			await fs.writeFile(savePath, JSON.stringify(this.rawData));
		} catch (error) {
			logger.error('Failed to save schedules data to file', error);
		}
	}
}
