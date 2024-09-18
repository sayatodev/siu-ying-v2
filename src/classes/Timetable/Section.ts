import type { Moment } from "moment-timezone";
import { TimeslotType } from "../../enums/calendar.js";

export class Section {
    public readonly startTime: Moment;

    public readonly endTime: Moment;

    public title?: string;

    public readonly timeslotType: TimeslotType;

    public constructor(timeslotType: TimeslotType, startTime: Moment, endTime: Moment, title?: string) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.title = title;
        this.timeslotType = timeslotType;
    }
}

export class LessonSection extends Section {
    public readonly classes: Array<{
        subject: string; venue: string;
    }>

    public constructor(startTime: Moment, endTime: Moment, data: {
        classes: Array<{ subject: string; venue: string; }>
    }) {
        super(TimeslotType.Lesson, startTime, endTime);
        this.classes = data.classes;

        /* title format: "Subject1/SubjectB Rm101/Rm102" */
        const subjects = this.classes.map(cls => cls.subject).join("/");
        const venues = this.classes.map(cls => cls.venue).join("/");

        this.title = `${subjects} ${venues}`;
    }
}

export class MorningAssemblySection extends Section {
    public constructor(startTime: Moment, endTime: Moment, _data: any) {
        super(TimeslotType.MorningAssembly, startTime, endTime, "早會");
    }
}

export class RecessSection extends Section {
    public constructor(startTime: Moment, endTime: Moment, _data: any) {
        super(TimeslotType.Recess, startTime, endTime, "小息");
    }
}

export class LunchSection extends Section {
    public constructor(startTime: Moment, endTime: Moment, _data: any) {
        super(TimeslotType.Lunch, startTime, endTime, "午膳");
    }
}
