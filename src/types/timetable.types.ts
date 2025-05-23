import type { CONSTS } from "../consts.js";
import type { DayOfCycle, OtherDay } from "../enums/calendar.js";
import type { ArrayElement } from "../util/utilTypes.js";

export type ApiDayOfCycleString = ArrayElement<typeof CONSTS.CALENDAR.DAYS_OF_CYCLE>;
export type ApiDayOfHolidayString = typeof CONSTS.CALENDAR.OTHER_DAYS.HOLIDAY;
export type ApiDayOfDateString = ApiDayOfCycleString | ApiDayOfHolidayString;

export type ApiCalendarData = {
    [date: string]: ApiDayOfDateString;
};

export type ApiSchedulesData = {
    [cls: string]: ApiSchedule_OneClassData;
};

export type ApiSchedule_OneClassData = {
    [dayOfCycle in ApiDayOfCycleString]: ApiSchedule_OneScheduleData[];
};

export type ApiSchedule_OneScheduleData = {
    subject: string;
    venue: string;
};

export type DayOfDateEnum = DayOfCycle | OtherDay;
