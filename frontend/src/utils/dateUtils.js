/**
 * Date utility functions for Formula 1 race calendar and weekend timing.
 */

/**
 * Checks if a given race event is taking place during the current calendar week or weekend.
 *
 * @param {Object} event - The race event object containing event_date, session dates, etc.
 * @param {Date} [referenceDate=new Date()] - The date to check against (defaults to now).
 * @returns {boolean} True if the race is happening this week / active weekend.
 */
export const isCurrentRaceWeek = (event, referenceDate = new Date()) => {
  if (!event || !event.event_date) return false;

  try {
    // Parse event date (YYYY-MM-DD) avoiding timezone skew
    const parts = event.event_date.split('-');
    if (parts.length < 3) return false;

    const raceYear = parseInt(parts[0], 10);
    const raceMonth = parseInt(parts[1], 10) - 1;
    const raceDay = parseInt(parts[2], 10);
    const raceDate = new Date(raceYear, raceMonth, raceDay);

    const ref = new Date(referenceDate);
    const now = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());

    // Calculate Monday of the race week (race date is usually Sat or Sun)
    // In JS: 0 = Sun, 1 = Mon, ..., 6 = Sat
    const raceDayOfWeek = raceDate.getDay();
    // Days back to Monday:
    const daysToMonday = raceDayOfWeek === 0 ? 6 : raceDayOfWeek - 1;
    const mondayOfWeek = new Date(raceDate);
    mondayOfWeek.setDate(raceDate.getDate() - daysToMonday);
    mondayOfWeek.setHours(0, 0, 0, 0);

    // End of race week: Sunday 23:59:59
    const sundayOfWeek = new Date(mondayOfWeek);
    sundayOfWeek.setDate(mondayOfWeek.getDate() + 6);
    sundayOfWeek.setHours(23, 59, 59, 999);

    // Check if the reference date falls within this race week
    return now >= mondayOfWeek && now <= sundayOfWeek;
  } catch (err) {
    console.error('Error evaluating race week:', err);
    return false;
  }
};

/**
 * Formats an event date string to a human-readable display.
 */
export const formatEventDate = (dateStr) => {
  if (!dateStr) return 'TBD';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

/**
 * Formats a race weekend date range using the First Practice date and the Race date.
 * Example outputs: "Oct 8 - Oct 11", "Mar 1 - Mar 2", "May 31 - Jun 2".
 *
 * @param {string} [startStr] - Date/datetime string of First Practice (session 1)
 * @param {string} [endStr] - Date/datetime string of Race (Sunday/session 5)
 * @returns {string} Formatted weekend date range
 */
export const formatWeekendRange = (startStr, endStr) => {
  if (!startStr && !endStr) return 'TBD';

  const parseDate = (str) => {
    if (!str) return null;
    const clean = str.split(' ')[0]; // Strip time portion if present
    const parts = clean.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  };

  const raceDate = parseDate(endStr);
  let practiceDate = parseDate(startStr);

  if (!raceDate && !practiceDate) return 'TBD';

  // If practiceDate is missing or invalid, estimate start as Friday (2 days before Sunday)
  if (!practiceDate && raceDate) {
    practiceDate = new Date(raceDate);
    practiceDate.setDate(raceDate.getDate() - 2);
  }

  // If raceDate is missing, estimate end as Sunday (2 days after Friday)
  if (!raceDate && practiceDate) {
    const estimatedRace = new Date(practiceDate);
    estimatedRace.setDate(practiceDate.getDate() + 2);
    return formatWeekendRange(startStr, estimatedRace.toISOString().split('T')[0]);
  }

  const startMonth = practiceDate.toLocaleDateString('en-US', { month: 'short' });
  const startDay = practiceDate.getDate();
  const endMonth = raceDate.toLocaleDateString('en-US', { month: 'short' });
  const endDay = raceDate.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
};
