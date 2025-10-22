import type { ApiEventsSchedulesRow } from "../../types/general.types.js";
import { maxLength } from "../../util/strings.js";

export class FormEvent {
    public readonly name: string;

    public readonly form: string;

    public readonly section?: string;

    public constructor(form: string, data: string) {
        this.form = form;

        const sectionRegex = /_L(?<section>\d)(?:$|\D)/;
        const sectionMatch = sectionRegex.exec(data);
        const section = sectionMatch?.groups?.section;
        if (section) {
            this.section = section;
            this.name = data.replace(`_L${section}`, "");
        } else {
            this.name = data;
        }
    }

    public toDisplay() {
        return this.name.replaceAll('_', " ") + (this.section ? ` (Lesson ${this.section})` : "");
    }
}

export class Event {
    public readonly name: string;

    public readonly timeslot?: string;

    public readonly location?: string;

    public readonly teacher?: string;

    public readonly circular?: string;

    public constructor(data: string) {
        const regex = /^(?<name>.+)\s\[(?<start>\d{1,2}:\d{2}) - (?<end>\d{1,2}:\d{2})]\s?_(?<location>[^_]+)_(?<teacher>[^_]+)_(?<circular>.+)$/;
        const match = regex.exec(data);
        if (match) {
            this.name = match.groups?.name.replaceAll('_', " ") ?? "";
            this.timeslot = `${match.groups?.start} - ${match.groups?.end}`;
            this.location = match.groups?.location;
            this.teacher = match.groups?.teacher;
            this.circular = match.groups?.circular;
        } else {
            this.name = data;
        }
    }

    public toDisplay() {
        return this.name
            + (this.timeslot ? ` | ${this.timeslot}` : "")
            + (this.location ? ` @ ${this.location}` : "")
            + ` [${[this.teacher, this.circular].filter(Boolean).join("/")}]`;
    }
}

export default class EventsSchedule {
    private readonly slots: Array<[
        string,
        ApiEventsSchedulesRow["slots"][string]
    ]>;

    public constructor(data: ApiEventsSchedulesRow) {
        this.slots = Object.entries(data.slots)
    }

    public getEvents(filterForm: "S1" | "S2" | "S3" | "S4" | "S5" | "S6") {
        const events: {
            [slotName: string]: {
                events: Array<Event | FormEvent>;
                fullName: string;
                remarks: string[];
            }
        } = {};

        for (const slot of this.slots) {
            const [slotId, slotData] = slot;
            const slotEvents = [];

            if (filterForm in slotData && slotData[filterForm].length > 0) {
                for (const eventData of slotData[filterForm]) {
                    slotEvents.push(new FormEvent(filterForm, eventData));
                }
            }

            if (slotData.otherActivities.length > 0) {
                for (const eventData of slotData.otherActivities) {
                    slotEvents.push(new Event(eventData));
                }
            }

            if (slotEvents.length > 0) {
                events[slotId] = {
                    events: slotEvents,
                    fullName: slotData.fullName,
                    remarks: slotData.remarks,
                }
            }
        }

        return events;
    }

    public getEventsDisplay(filterForm: "S1" | "S2" | "S3" | "S4" | "S5" | "S6", long = false): string {
        const events = this.getEvents(filterForm);
        if (!events || Object.keys(events).length === 0) {
            return "### Events\nNo events";
        }

        let display = "### Events\n";

        for (const { fullName, events: slotEvents } of Object.values(events)) {
            display += `\n**${fullName}**: ` + (long ? "\n" : "");

            const slicedEvents = long ? slotEvents : slotEvents.slice(0, 3);
            display += slicedEvents.map(
                event => long
                    ? event.name
                    : maxLength(event.name, 10, { halfWidthFactor: 0.5 })
            ).join(", ");

            if (!long && slotEvents.length > 3) {
                display += ` - _and ${slotEvents.length - 3} more_`;
            }
        }

        const remarks = Object.values(events).flatMap(slot => slot.remarks.map(rmk => rmk.replace(/ \/$/, "")));
        const uniqueRemarks = Array.from(new Set(remarks));

        if (uniqueRemarks.length > 0) {
            display += `\n### Remarks`;
            for (const rmk of (long ? uniqueRemarks : uniqueRemarks.slice(0, 3))) {
                display += `\n*_${rmk}_`;
                if (remarks.filter(remark => remark === rmk).length === 1) {
                    display += ` (${Object.values(events).find(slot => slot.remarks.includes(rmk))?.fullName})`;
                }
            }

            if (!long && uniqueRemarks.length > 3) {
                display += `\n*...and ${uniqueRemarks.length - 3} more*`;
            }
        }

        return display;
    }
}
