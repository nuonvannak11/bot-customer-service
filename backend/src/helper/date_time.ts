import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

dayjs.extend(utc)
dayjs.extend(timezone)

export class TimeController {
    static nowUTC(): Date {
        return new Date()
    }

    static toTimezone(date: Date, tz: string = "Asia/Bangkok", format = "YYYY-MM-DD HH:mm:ss"): string {
        return dayjs(date).tz(tz).format(format)
    }

    static toUTC(input: string | Date, inputTz?: string): Date {
        if (inputTz) {
            return dayjs.tz(input, inputTz).utc().toDate()
        }
        return dayjs(input).utc().toDate()
    }

    static count_time(time: string | Date): number {
        const now = Date.now()
        const past = new Date(time).getTime()
        if (isNaN(past)) return 0;
        const diffMs = now - past
        return Math.floor(diffMs / (1000 * 60 * 60 * 24))
    }
}
