// AI batchest
/**
 * Formats a number (representing seconds) to a string in h:mm:ss format
 * using as minimal digits to the left as possible.
 *
 * @param seconds - Number of seconds to format
 * @returns Formatted time string in h:mm:ss format
 *
 * Examples:
 * - 65 -> "1:05"
 * - 3661 -> "1:01:01"
 * - 65.5 -> "1:05"
 */
export function format_time(seconds: number): string {
	// Handle negative numbers
	if (seconds < 0) {
		return "0:00"
	}

	// Round to nearest second
	const total_seconds = Math.round(seconds)

	// Calculate hours, minutes, and seconds
	const hours = Math.floor(total_seconds / 3600)
	const remaining_seconds = total_seconds % 3600

	const minutes = Math.floor(remaining_seconds / 60)
	const secs = remaining_seconds % 60

	// Format based on whether hours are needed
	if (hours > 0) {
		// Show hours: always 2 digits for minutes and seconds
		return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
	} else {
		// No hours: show minimal digits for minutes, always 2 digits for seconds
		return `${minutes}:${secs.toString().padStart(2, "0")}`
	}
}
