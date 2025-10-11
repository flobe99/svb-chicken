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

    public get(value: string | Date, attribute?: string): string {
        value = typeof value === "string" ? value : value.toISOString();
        const date = moment(value);

        if (!date.isValid()) return '';

        switch (attribute) {
            case 'plain':
                return date.local().format("DD.MM.YYYY, HH:mm");
            case 'date':
                return date.local().format("DD.MM.YYYY");
            case 'iso-date':
                return date.local().format("YYYY-MM-DD");
            case 'time':
                return date.local().format("HH:mm");
            case 'time-seconds':
                return date.local().format("HH:mm:ss");
            case 'dayOfWeek':
                return date.local().day().toString();
            default:
                return date.fromNow();
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
        return this.get(value, attribute);
    }
}