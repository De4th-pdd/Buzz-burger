import type { StoreStatus } from './types';

const PREV: Record<string, string> = {
  Sun: 'Sat',
  Mon: 'Sun',
  Tue: 'Mon',
  Wed: 'Tue',
  Thu: 'Wed',
  Fri: 'Thu',
  Sat: 'Fri',
};

function pktParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '';
  const weekday = get('weekday');
  const hour = parseInt(get('hour'), 10);
  const minute = parseInt(get('minute'), 10);
  return { weekday, hour, minute, mins: hour * 60 + minute };
}

function isWeekendServiceDay(weekday: string) {
  return weekday === 'Fri' || weekday === 'Sat' || weekday === 'Sun';
}

export function computeLocalStatus(): StoreStatus {
  const now = pktParts();
  let open = false;
  if (now.mins < 2 * 60) {
    const prev = PREV[now.weekday];
    const closeMins = isWeekendServiceDay(prev) ? 2 * 60 : 60;
    open = now.mins < closeMins;
  } else if (now.mins >= 17 * 60) {
    open = true;
  }
  return {
    open,
    label: open
      ? 'Open Now \u2014 Delivering to Sargodha Road'
      : 'Closed \u2014 Pre-order for Tomorrow',
    timezone: 'Asia/Karachi',
    weekdayHours: 'Mon\u2013Thu 5:00 PM \u2013 1:00 AM',
    weekendHours: 'Fri\u2013Sun 5:00 PM \u2013 2:00 AM',
  };
}
