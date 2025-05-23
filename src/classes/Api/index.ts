import axios from 'axios';
import { CONFIG } from '../../config.js';
import type { ApiCalendarData, ApiSchedulesData } from '../../types/timetable.types.js';

const config = CONFIG.API;

// Helper class to interact with the API
export const Api = {
	// Get the school's calendar from API
	async getCalendar(): Promise<ApiCalendarData> {
		const response = await axios.get<ApiCalendarData>(`${config.BASE_URL}${config.ROUTES.CYCLE_CAL}`);
		return response.data;
	},

	// Get the timetable for a class from API
	async getTimetable(cls: string = ''): Promise<ApiSchedulesData> {
		const response = await axios.get<ApiSchedulesData>(`${config.BASE_URL}${config.ROUTES.TIMETABLE}/${cls}`);
		return response.data;
	},
};
