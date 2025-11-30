type Moment = Date; // unlike Date, can expect both the date and time represented therein are accurate
type Span = {
  start: Date | Moment;
  end: Date | Moment;
};
type Time = Date | Moment | Span;

type CalendarTimeCode = {
  hours: number; // 0 <= hours <= 23
  quarters: number; // 0 <= quarters <= 3
};

const QUARTERS_PER_HOUR = 4;

enum TimeType {
  'Date',
  'Moment',
  'Span'
}

enum TimePurpose {
  'Start',
  'Due',
  'Event',
  'Work'
}

const MONTHS = <const>[
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dateFromNaturalForm(
  year: number,
  month: (typeof MONTHS)[number],
  date: number
) {
  return new Date(year, MONTHS.indexOf(month), date, 0, 0, 0, 0);
}

function ctcsAreEqual(a: CalendarTimeCode, b: CalendarTimeCode): boolean {
  return a.hours === b.hours && a.quarters === b.quarters;
}

function ctcFromQuartersSafely(quarters: number): CalendarTimeCode {
  const safeQuarters = Math.min(
    Math.max(0, quarters),
    HOURS.length * QUARTERS_PER_HOUR - 1
  );
  return {
    hours: Math.floor(safeQuarters / QUARTERS_PER_HOUR),
    quarters: safeQuarters % QUARTERS_PER_HOUR
  };
}

function quartersFromCTC(ctc: CalendarTimeCode): number {
  return ctc.hours * QUARTERS_PER_HOUR + ctc.quarters;
}

function momentFromDateAndCTC(date: Date, ctc: CalendarTimeCode): Moment {
  const output = new Date(date.getTime());
  output.setHours(ctc.hours);
  output.setMinutes(ctc.quarters * 15);
  output.setSeconds(0);
  output.setMilliseconds(0);
  return output;
}

function naturalFormFromCTC(
  ctc: CalendarTimeCode,
  includeMinutes: boolean = false
): string {
  let output = '';
  const mod12 = ctc.hours % 12;
  output += mod12 === 0 ? 12 : mod12;
  if (includeMinutes) {
    output += ':' + (ctc.quarters === 0 ? '00' : ctc.quarters * 15);
  }
  output += ctc.hours >= 12 ? ' PM' : ' AM';
  return output;
}

const HOURS: string[] = [];
for (let i = 0; i < 24; i++) {
  HOURS.push(naturalFormFromCTC({ hours: i, quarters: 0 }, false));
}

export {
  /*type Date,*/
  type Moment,
  type Span,
  type Time,
  type CalendarTimeCode,
  QUARTERS_PER_HOUR,
  TimeType,
  TimePurpose,
  MONTHS,
  DAYS,
  ctcsAreEqual,
  ctcFromQuartersSafely,
  quartersFromCTC,
  dateFromNaturalForm,
  momentFromDateAndCTC,
  naturalFormFromCTC,
  HOURS
};
