import { Pipe, PipeTransform } from '@angular/core';
// import moment from 'moment';

@Pipe({
    name: 'time',
    standalone: true,
})
export class TimePipe implements PipeTransform {

    constructor() {
    }

    public get(value: string | Date, attribute?: string): string {
        value = typeof value === "string" ? value : value.toISOString();
        const date = new Date(value);

        if (isNaN(date.getTime())) return '';

        switch (attribute) {
            case 'plain':
                return `${this.formatDate(date)}, ${this.formatTime(date)} Uhr`;
            case 'date':
                return this.formatDate(date);
            case 'iso-date':
                return date.toISOString().split('T')[0];
            case 'time':
                return this.formatTime(date);
            case 'time-seconds':
                return this.formatTime(date, true);
            case 'dayOfWeek':
                const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
                return days[date.getDay()]; // 0 = Sonntag, 1 = Montag, ...
            default:
                return this.timeAgo(date);
        }
    }
    private formatDate(date: Date): string {
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    private formatTime(date: Date, withSeconds = false): string {
        return date.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
            second: withSeconds ? '2-digit' : undefined
        });
    }

    private timeAgo(date: Date): string {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) return 'gerade eben';
        if (diffMin < 60) return `${diffMin} Minuten her`;
        if (diffHour < 24) return `${diffHour} Stunden her`;
        if (diffDay === 1) return `gestern um ${this.formatTime(date)}`;
        return `${diffDay} Tage her`;
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