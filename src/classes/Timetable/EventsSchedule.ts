import type { EventsDataJSON } from "../../types/general.types.js";
import { maxLength } from "../../util/strings.js";

type AllFormsEvents = { S1: FormEvent[], S2: FormEvent[], S3: FormEvent[], S4: FormEvent[], S5: FormEvent[], S6: FormEvent[] };

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
                const formEventsData = [S1, S2, S3, S4, S5, S6];
                
                // Loop through each form
                for (const [formIdx, eventData] of formEventsData.entries()) {
                    const form = `S${formIdx + 1}` as "S1" | "S2" | "S3" | "S4" | "S5" | "S6";
                    if (eventData) {
                        const thisFormEvents = eventData.split(" /\n")
                            .map(data => data.trim())
                            .map(data => new FormEvent(form, data));
                            
                        // Loop through each event in the form
                        for (const event of thisFormEvents) {
                            formEvents[form].push(event);
                        }
                    }
                }

                const otherActivities = event["Other Activities (School circulars)"];
                if (otherActivities) {
                    for (const activity of otherActivities.split("\n")) {
                        const eventData = activity.trim();
                        if (eventData) {
                            otherEvents.push(new Event(eventData));
                        }
                    }
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

    private getEventsDisplayShort(filterForm: "S1" | "S2" | "S3" | "S4" | "S5" | "S6") {
        const events = this.getEvents(filterForm);
        if (!events || Object.keys(events).length === 0) {
            return "### Events\nNo events";
        }

        let display = "### Events\n";
        for (const [slotName, slotEvents] of Object.entries(events)) {
            display += `**${slotName}**: `

            const slicedEvents = slotEvents.slice(0, 3);
            display += slicedEvents.map(
                event => maxLength(event.name, 10, { alpha: 0.5 })
            ).join(", ");

            if (slotEvents.length > 3) {
                display += ` - _and ${slotEvents.length - 3} more_`;
            }

            display += "\n";
        }

        return display;
    }

    private getEventsDisplayLong(filterForm: "S1" | "S2" | "S3" | "S4" | "S5" | "S6") {
        const events = this.getEvents(filterForm);
        if (!events || Object.keys(events).length === 0) {
            return "### Events\nNo events";
        }

        let display = "### Events\n";
        for (const [slotName, slotEvents] of Object.entries(events)) {
            display += `**${slotName}**\n`;
            for (const event of slotEvents) {
                display += `* ${event.toDisplay()}\n`;
            }
        }

        return display;
    }

    public getEventsDisplay(filterForm: "S1" | "S2" | "S3" | "S4" | "S5" | "S6", long = false): string {
        return long
            ? this.getEventsDisplayLong(filterForm)
            : this.getEventsDisplayShort(filterForm);
    }
}
