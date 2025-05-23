import type { ButtonInteraction, CommandInteraction, StringSelectMenuInteraction } from "discord.js";
import type { Moment } from "moment-timezone";
import { CONFIG } from "../../config.js";
import _Events from "../../data/events_20250524.json" with { type: "json" };
import { DayOfCycle, DayType, OtherDay, TimeslotType } from "../../enums/calendar.js";
import type { EventsDataJSON } from "../../types/general.types.js";
import { SiuYingEmbed } from "../../util/embed.js";
import type { User } from "../Database/User.js";
import { Calendar } from "./Calendar.js";
import type { FormEvent, Event } from "./EventsSchedule.js";
import EventsSchedule from "./EventsSchedule.js";
import { Schedules } from "./Schedules.js";
import type { Section } from "./Section.js";
import { Timeslot } from "./Timeslots.js";

const Events = _Events as EventsDataJSON;

type EventSlots = { [slotName: string]: Array<Event | FormEvent> };

// Result of a timetable query
class TimetableQueryResult<status extends "Error" | "Success"> {
    public readonly query: TimetableQuery;

    public readonly success: status extends "Success" ? true : false;

    public readonly data: status extends "Success" ? {
        dayOfCycle: DayOfCycle;
        eventSlots?: EventSlots;
        sections: Section[];
        type: DayType.SCHOOL_DAY;
    } | {
        eventSlots?: EventSlots;
        type: DayType.HOLIDAY;
    } : string;

    public constructor(
        query: TimetableQuery,
        success: status extends "Success" ? true : false,
        data: status extends "Success" ? {
            dayOfCycle: DayOfCycle; eventSlots?: EventSlots; sections: Section[]; type: DayType.SCHOOL_DAY;
        } | {
            eventSlots?: EventSlots; type: DayType.HOLIDAY;
        } : string
    ) {
        this.query = query;
        this.success = success;
        this.data = data;
    }

    // Convert the result to a string
    public toString() {
        return this.success ? JSON.stringify(this.data) : this.data;
    }

    // Convert the result to an embed
    public toEmbed() {
        if (!this.success) {
            // If the query failed, return a red embed with the error message
            const { data } = this as TimetableQueryResult<"Error">;
            return new SiuYingEmbed({ user: this.query.interaction.user }).setColor("Red").setTitle("Timetable Query Failed").setDescription(data);
        }

        // If the query was successful, return an embed with the timetable
        const { data } = this as TimetableQueryResult<"Success">;
        switch (data.type) {
            case DayType.HOLIDAY:
                return new SiuYingEmbed({ user: this.query.interaction.user }).setColor("Green").setTitle(`${this.query.query.date.format("YYYY-MM-DD")} - Holiday`)
                    .setDescription(
                        "No school on this day! Enjoy your holiday.\n### Events\n"
                        + (Object.keys(data.eventSlots ?? {}).length
                            ? Object.entries(data.eventSlots as EventSlots).map(([slotName, events]) => `**${slotName}**\n ${events.map(event => "* " + event.toDisplay()).join("\n")}`).join("\n")
                            : "No events"))

            case DayType.SCHOOL_DAY: {
                const divider = "────────────────────";
                const dividerWithText = (text: string) => {
                    /* add text (shorter than divider) in the center of the divider while keeping the divider length */
                    const textLength = text.length;
                    const dividerLength = divider.length;
                    const leftSideLength = Math.floor((dividerLength - textLength) / 2);
                    const rightSideLength = dividerLength - textLength - leftSideLength;
                    return `${divider.slice(0, leftSideLength)}${text}${divider.slice(0, rightSideLength)}`;
                }

                const sectionsBlock = data.sections.map(section => {
                    if (section.timeslotType === TimeslotType.Lesson) return `<t:${section.startTime.unix()}:t> ${section.title}`; // Show the time for lessons
                    return "-# " + dividerWithText("00:00 " + (section.title ?? "")).replace("00:00", `<t:${section.startTime.unix()}:t>`); // Show the time for non-lessons, in small font
                }).join("\n");
                const dateBlock = `### ${data.sections[0].startTime.format("ddd, DD MMM YYYY")} (Day ${DayOfCycle[data.dayOfCycle]})`; // The date, in heading3 font

                return new SiuYingEmbed({ user: this.query.interaction.user })
                    .setColor("Blue")
                    .setTitle(`🗓️ Timetable for ${this.query.query.cls}`)
                    .setDescription(
                        [dateBlock, sectionsBlock].join("\n")
                        + "\n### Events\n"
                        + (Object.keys(data.eventSlots ?? {}).length
                            ? Object.entries(data.eventSlots as EventSlots).map(([slotName, events]) => `**${slotName}**\n ${events.map(event => "* " + event.toDisplay()).join("\n")}`).join("\n")
                            : "No events"))
                    .setThumbnail("https://i.imgur.com/MteV7Gv.png")
            }

            default:
                // This should never happen
                return new SiuYingEmbed({ user: this.query.interaction.user }).setColor("Red").setTitle("Timetable Query Failed").setDescription("An unknown error occurred");
        }
    }
}

// Query to get the timetable for a specific class on a specific date
// This is a helper class to execute timetable related queries for timetable commands
export class TimetableQuery {
    public readonly interaction: ButtonInteraction | CommandInteraction | StringSelectMenuInteraction;

    public readonly query: {
        cls: string;
        date: Moment;
    };

    private readonly user: User | null;

    // Create a new instance of the query with the provided parameters
    public constructor(interaction: ButtonInteraction | CommandInteraction | StringSelectMenuInteraction, cls: string, date: Moment, user: User | null) {
        if (!cls || !date) throw new Error("Invalid query parameters");
        this.interaction = interaction;
        this.query = { cls, date };
        this.user = user;
    }

    // Execute the query, including fetching the calendar and schedules, as well as prcessing the user data
    public async execute() {
        const calendar = await Calendar.fromFile(); // Prefer cached calendar data over API.

        const dayOfCycle = calendar.getDayOfCycle(this.query.date);
        if (dayOfCycle === null) {
            return this.finish(false, "Invalid date");
        }

        if (dayOfCycle === OtherDay.HOLIDAY) {
            // If the day is a holiday, return a holiday response
            return this.finish(true, { type: DayType.HOLIDAY });
        }

        // The day is a school day, get the schedules for the class
        const schedules = await Schedules.fromFile();

        const classSchedule = schedules.getClassSchedule(this.query.cls);
        if (!classSchedule) {
            return this.finish(false, "Invalid class");
        }

        const daySchedules = classSchedule.getDaySchedules(dayOfCycle);
        if (!daySchedules?.length) {
            // If there are no schedules for the class on this day, return an error response as this should not happen
            return this.finish(false, "No schedule for the class on this day");
        }

        // Get the timeslots for the day
        const dayTimeslots = Timeslot.getAllOfDate(this.query.date);

        // For each timeslot, convert it to a section
        const sections = dayTimeslots.map((timeslot) => {
            if (timeslot.type === TimeslotType.Lesson) {
                // If the timeslot is a lesson, get the corresponding schedule and create a lesson section
                const schedule = daySchedules[timeslot.indexOfType];
                const subjects = schedule.subject.split(CONFIG.API.FORMATS.TIMETABLE_SUBJECT_SPLITTER);
                const venues = schedule.venue.split(CONFIG.API.FORMATS.TIMETABLE_SUBJECT_SPLITTER);
                const classes = subjects.map((subject, idx) => ({ subject, venue: venues[idx] }));
                return (timeslot as Timeslot<TimeslotType.Lesson>).toSection({
                    classes, form: `S${this.query.cls.charAt(0)}`, userElectives: this.user?.settings.electives ?? null,
                });
            } else {
                // If the timeslot is not a lesson (e.g. morning assembly, recess, lunch, etc), simply create a section with the timeslot type
                return (timeslot as Timeslot<Exclude<TimeslotType, TimeslotType.Lesson>>).toSection({});
            }
        });

        // Find activites for the day
        const events = Events.filter(event =>
            event.Year === this.query.date.year() &&
            event.Month === this.query.date.month() + 1 &&
            event.Date === this.query.date.date()
        )
        const eventsSchedule = new EventsSchedule(events);
        const targetForm = `S${this.query.cls.charAt(0)}`;
        if (!["S1", "S2", "S3", "S4", "S5", "S6"].includes(targetForm)) {
            // If the class is not a valid form, return an error response
            return this.finish(false, "Invalid form");
        }

        const eventSlots = eventsSchedule.getEvents(targetForm as "S1" | "S2" | "S3" | "S4" | "S5" | "S6");

        // Return the a successful response with the sections and day type
        return this.finish(true, { sections, type: DayType.SCHOOL_DAY, dayOfCycle, eventSlots });
    }

    // Should only be called in execute(), this is a helper function to finish the query with a TimetableQueryResult
    private finish(success: boolean, data: string | {
        dayOfCycle: DayOfCycle;
        eventSlots?: EventSlots;
        sections: Section[];
        type: DayType.SCHOOL_DAY;
    } | {
        eventSlots?: EventSlots;
        type: DayType.HOLIDAY;
    }) {
        // Return an instance of TimetableQueryResult with the query, success status, and data
        return new TimetableQueryResult(this, success, data);
    }
}
