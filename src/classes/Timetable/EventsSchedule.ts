import type { EventsDataJSON } from "../../types/general.types.js";

type AllFormsEvents = { S1: FormEvent[], S2: FormEvent[], S3: FormEvent[], S4: FormEvent[], S5: FormEvent[], S6: FormEvent[] };

export class FormEvent {
    public readonly name: string;

    public readonly section?: string;

    public constructor(data: string) {
        const sectionRegex = /_L(\d)$/;
        const sectionMatch = sectionRegex.exec(data);
        if (sectionMatch) {
            this.section = sectionMatch[1];
            this.name = data.replace(sectionRegex, "");
        } else {
            this.name = data;
        }
    }

    public toDisplay() {
        return this.name.replaceAll('_', "") + (this.section ? ` (Lesson ${this.section})` : "");
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
            this.name = match.groups?.name.replaceAll('_', "") ?? "";
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
    private readonly slots: Array<{
        formEvents: AllFormsEvents;
        name: string;
        otherEvents: Event[];
    }>;

    public constructor(events: EventsDataJSON) {
        const slots: string[] = [];
        for (const event of events) {
            let { Slot: eventSlot } = event;
            if (!eventSlot) eventSlot = "Other"
            if (!slots.includes(eventSlot)) {
                slots.push(eventSlot);
            }
        }

        this.slots = [];
        for (const slot of slots) {
            const slotEvents = events.filter(event => event.Slot === slot);
            const formEvents: AllFormsEvents = {
                S1: [], S2: [], S3: [], S4: [], S5: [], S6: []
            }
            const otherEvents: Event[] = [];
            for (const event of slotEvents) {
                const { S1, S2, S3, S4, S5, S6 } = event;
                if (S1) formEvents.S1.push(new FormEvent(S1));
                if (S2) formEvents.S2.push(new FormEvent(S2));
                if (S3) formEvents.S3.push(new FormEvent(S3));
                if (S4) formEvents.S4.push(new FormEvent(S4));
                if (S5) formEvents.S5.push(new FormEvent(S5));
                if (S6) formEvents.S6.push(new FormEvent(S6));

                const otherActivities = event["Other Activities (School circulars)"];
                if (otherActivities) {
                    otherEvents.push(new Event(otherActivities));
                }
            }

            this.slots.push({
                name: slot,
                formEvents,
                otherEvents
            });
        }
    }

    public getEvents(filterForm: "S1" | "S2" | "S3" | "S4" | "S5" | "S6"): { [slotName: string]: Array<Event | FormEvent> } {
        const events: { [slotName: string]: Array<Event | FormEvent> } = {};
        for (const slot of this.slots) {
            events[slot.name] = [];
            if (slot.formEvents[filterForm].length > 0) {
                events[slot.name].push(...slot.formEvents[filterForm]);
            }

            if (slot.otherEvents.length > 0) {
                events[slot.name].push(...slot.otherEvents);
            }
        }

        return Object.fromEntries(
            Object.entries(events).filter(([_, events]) => events.length > 0)
        ); // Filter out empty slots
    }
}
