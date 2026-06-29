/**
 * Formats a Date object as an ISO 8601 string in the 'America/Sao_Paulo' timezone (GMT-3)
 * with the correct offset (e.g., YYYY-MM-DDTHH:mm:ss.sss-03:00).
 * 
 * @param {Date} [date] - The Date object to format. Defaults to the current time.
 * @returns {string} The formatted ISO string in America/Sao_Paulo timezone.
 */
function getGMT3ISOString(date = new Date()) {
  const tz = 'America/Sao_Paulo';
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(date);
  const getValue = (type) => parts.find(p => p.type === type).value;
  
  const year = getValue('year');
  const month = getValue('month');
  const day = getValue('day');
  const hour = getValue('hour');
  const minute = getValue('minute');
  const second = getValue('second');
  
  const ms = String(date.getMilliseconds()).padStart(3, '0');
  
  // Calculate timezone offset dynamically
  const utcDate = new Date(Date.UTC(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hour, 10),
    parseInt(minute, 10),
    parseInt(second, 10)
  ));
  
  const baseTime = date.getTime() - date.getMilliseconds();
  const diffMinutes = Math.round((utcDate.getTime() - baseTime) / 60000);
  
  const absDiff = Math.abs(diffMinutes);
  const offsetHours = String(Math.floor(absDiff / 60)).padStart(2, '0');
  const offsetMins = String(absDiff % 60).padStart(2, '0');
  const sign = diffMinutes >= 0 ? '+' : '-';
  const offsetStr = `${sign}${offsetHours}:${offsetMins}`;
  
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.${ms}${offsetStr}`;
}

module.exports = {
  getGMT3ISOString
};
