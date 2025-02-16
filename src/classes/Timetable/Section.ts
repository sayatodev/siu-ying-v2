import type { Moment } from "moment-timezone";
import { CONSTS } from "../../consts.js";
import { TimeslotType } from "../../enums/calendar.js";

const STRINGS = CONSTS.CALENDAR.LOCALE_STRINGS.ZH_TRAD;

// Represents a section in the timetable of a day
export class Section {
    public readonly startTime: Moment;

    // Currently not much use, but may be useful in the future
    public readonly endTime: Moment;

    // Will be used to display the section in the timetable
    public title?: string;

    public readonly timeslotType: TimeslotType;

    // Should not be used directly, use the subclasses (LessonSection, MorningAssemblySection, RecessSection, LunchSection) instead
    public constructor(timeslotType: TimeslotType, startTime: Moment, endTime: Moment, title?: string) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.title = title;
        this.timeslotType = timeslotType;
    }
}

// Represents a lesson section in the timetable
export class LessonSection extends Section {
    public readonly classes: Array<{
        subject: string; venue: string;
    }>

    public constructor(startTime: Moment, endTime: Moment, data: {
        classes: Array<{ subject: string; venue: string; }>,
        form: "S1" | "S2" | "S3" | "S4" | "S5" | "S6";
        userElectives: { "1X"?: string; "2X"?: string; "3X"?: string; } | null;
    }) {
        super(TimeslotType.Lesson, startTime, endTime);
        this.classes = data.classes;

        /* title format: "Subject1/SubjectB Rm101/Rm102" */
        const subjectAbbrevs = this.classes.map(cls => cls.subject);
        const venues = this.classes.map(cls => cls.venue)

        // If the first subject starts with [1X], [2X], or [3X], it is an elective group
        if (/^\[(?<temp1>[1-3]X)]/.test(subjectAbbrevs[0])) {
            const electiveGroup = (/^\[(?<temp1>[1-3]X)]/.exec(subjectAbbrevs[0]))?.groups?.temp1 as "1X" | "2X" | "3X";

            // Get the user's elective for the group, if any
            const userElective = data.userElectives?.[electiveGroup] ? (
                STRINGS.SUBJECT[data.userElectives[electiveGroup] as keyof typeof STRINGS.SUBJECT] ?? data.userElectives[electiveGroup]
            ) : null;

            // Set the title to the elective group, with the user's elective in brackets if available
            this.title = electiveGroup in STRINGS.SUBJECT ? STRINGS.SUBJECT[electiveGroup] + (
                userElective ? ` (${userElective})` : ""
            ) : electiveGroup;
        } else {
            // Get the distinct subjects and convert the abbreviations to full names
            const distinctSubjects = [...new Set(subjectAbbrevs)];
            const subject = distinctSubjects.map(subj => subj in STRINGS.SUBJECT ? STRINGS.SUBJECT[subj as keyof typeof STRINGS.SUBJECT] : subj)
            this.title = `${subject.join("/")} ${venues.join("/")}`;
        }
    }
}

// Represents a morning assembly section in the timetable
export class MorningAssemblySection extends Section {
    public constructor(startTime: Moment, endTime: Moment, _data: any) {
        super(TimeslotType.MorningAssembly, startTime, endTime, "早會");
    }
}

// Represents a recess section in the timetable
export class RecessSection extends Section {
    public constructor(startTime: Moment, endTime: Moment, _data: any) {
        super(TimeslotType.Recess, startTime, endTime, "小息");
    }
}

// Represents a lunch section in the timetable
export class LunchSection extends Section {
    public constructor(startTime: Moment, endTime: Moment, _data: any) {
        super(TimeslotType.Lunch, startTime, endTime, "午膳");
    }
}
