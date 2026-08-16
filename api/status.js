export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    return res.status(200).json(computeStatus());
  } catch (err) {
    console.error('Status API error:', err);
    res.status(500).json({ error: err.message });
  }
}

function pktParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const get = (type) => parts.find((p) => p.type === type)?.value || '';
  const weekday = get('weekday');
  const hour = parseInt(get('hour'), 10);
  const minute = parseInt(get('minute'), 10);
  return { weekday, hour, minute, mins: hour * 60 + minute };
}

function isWeekendServiceDay(weekday) {
  return weekday === 'Fri' || weekday === 'Sat' || weekday === 'Sun';
}

const PREV = { Sun: 'Sat', Mon: 'Sun', Tue: 'Mon', Wed: 'Tue', Thu: 'Wed', Fri: 'Thu', Sat: 'Fri' };

function computeStatus() {
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
    weekday: now.weekday,
    hours: now.hour,
    minutes: now.minute,
    weekdayHours: 'Mon\u2013Thu 5:00 PM \u2013 1:00 AM',
    weekendHours: 'Fri\u2013Sun 5:00 PM \u2013 2:00 AM',
  };
}
