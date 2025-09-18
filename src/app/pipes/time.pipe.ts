import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
/**
 * @author Chris Michel
 * Represents the pipe taking care of the translations in html code
 */
@Pipe({
    name: 'time',
    standalone: true,
})
export class TimePipe implements PipeTransform {

    constructor() {
    }

    public static get(value: string | Date, attribute?: string): any {
        value = typeof value === "string" ? value : value.toISOString();


        const date = moment(value);
        const d = moment.duration(moment().diff(date));
        const minDiff = Math.floor(d.asMinutes());
        const hourDiff = d.asHours();
        const nowHour = Number.parseInt(moment().local().format("HH"));

        if (attribute && attribute === "plain") {
            return date.local().format("DD.MM.YYYY, HH:mm");
        }

        if (attribute && attribute === "date") {
            return date.local().format("DD.MM.YYYY");
        }

        if (attribute && attribute === "iso-date") {
            return date.local().format("YYYY-MM-DD");
        }

        if (attribute && attribute === "time") {
            return date.local().format("HH:mm");
        }

        if (attribute && attribute === "time-seconds") {
            return date.local().format("HH:mm:ss");
        }
    }

    /**
     * Transform a given string to a locale translated string
     * @param value the string identifier that should be translated
     * Possible values:
     * "dayOfWeek": @returns the numeric value of the given date's day, e.g. 0 for sunday, 1 for monday ...
     * "plain": @returns simply the date in a pretty format
     * "": @returns a pretty time like "5 minutes ago, right now, 3 hours ago, yesterday 8:15"
     * @returns time piped string
     */
    transform(value: string | Date, attribute?: string): string {
        return TimePipe.get(value, attribute);
    }


}