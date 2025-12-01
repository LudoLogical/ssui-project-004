'use client';

import RadialSelector, {
  RADIAL_SELECTOR_RADIUS_PX
} from '@/components/radial-selector';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MOCK_DATES, MOCK_LONG_CONTENT } from '@/lib/mock';
import {
  CalendarTimeCode,
  ctcFromQuartersSafely,
  ctcsAreEqual,
  DAYS,
  HOURS,
  naturalFormFromCTC,
  QUARTERS_PER_HOUR,
  quartersFromCTC,
  TimePurpose,
  TimeType
} from '@/lib/time';
import useScrollableRangeSelection, {
  Position
} from '@/lib/useScrollableRangeSelection';
import clsx from 'clsx';
import {
  BriefcaseBusinessIcon,
  PlayIcon,
  StarIcon,
  TargetIcon
} from 'lucide-react';
import {
  useRef,
  useState,
  MouseEvent as ReactMouseEvent,
  useEffect
} from 'react';

const LEFT_MOUSE_BUTTON = 0;
const LEFT_GUTTER_SIZE_PX = 64;
const HOUR_HEIGHT_PX = 64;

export default function Home() {
  const calendarScrollArea = useRef<HTMLDivElement>(null);
  const calendarSpanSelector = useRef<HTMLDivElement>(null);
  const purposeSelector = useRef<HTMLDivElement>(null);

  const startRangeSelection = useScrollableRangeSelection(
    calendarScrollArea,
    handleStartCalendarSelection,
    handleDragCalendarSelection,
    handleEndCalendarSelection
  );

  const [calendarDate, setCalendarDate] = useState<number>(-1);
  const [calendarTimeCodeA, setCalendarTimeCodeA] =
    useState<CalendarTimeCode | null>(null);
  const [calendarTimeCodeB, setCalendarTimeCodeB] =
    useState<CalendarTimeCode | null>(null);
  const [selectedTimeType, setSelectedTimeType] = useState<TimeType | null>(
    null
  );

  function handleAgendaSelection(
    e: ReactMouseEvent<HTMLDivElement, MouseEvent>,
    i: number
  ) {
    if (calendarTimeCodeA === null && selectedTimeType === null) {
      console.log(
        'In Progress: User selected the DATE ' +
          DAYS[i] +
          ' ' +
          MOCK_DATES[i] +
          '.'
      );
      setSelectedTimeType(TimeType.Date);
      positionPurposeSelector(e.clientX, e.clientY);
    }
  }

  function deduceCalendarDate(position: Position) {
    if (calendarScrollArea.current) {
      return Math.floor(
        ((position.x - LEFT_GUTTER_SIZE_PX) /
          (calendarScrollArea.current.clientWidth - LEFT_GUTTER_SIZE_PX)) *
          DAYS.length
      );
    }
  }

  function deduceCalendarTimeCode(position: Position) {
    if (calendarScrollArea.current) {
      return ctcFromQuartersSafely(
        Math.round(
          (position.y * HOURS.length * QUARTERS_PER_HOUR) /
            calendarScrollArea.current.scrollHeight
        )
      );
    }
  }

  function handleStartCalendarSelection(initialPosition: Position) {
    setCalendarDate(deduceCalendarDate(initialPosition) ?? -1);
    const initialTimeCode = deduceCalendarTimeCode(initialPosition) ?? null;
    setCalendarTimeCodeA(initialTimeCode);
    setCalendarTimeCodeB(initialTimeCode);
  }

  function handleDragCalendarSelection(_: Position, currentPosition: Position) {
    if (
      calendarScrollArea.current &&
      calendarSpanSelector.current &&
      calendarTimeCodeA &&
      selectedTimeType === null
    ) {
      const newTimeCodeB = deduceCalendarTimeCode(currentPosition);
      if (newTimeCodeB) {
        if (!ctcsAreEqual(calendarTimeCodeA, newTimeCodeB)) {
          const ctcAQuarters = quartersFromCTC(calendarTimeCodeA);
          const ctcBQuarters = quartersFromCTC(newTimeCodeB);
          calendarSpanSelector.current.style.left =
            (calendarDate *
              (calendarScrollArea.current.clientWidth - LEFT_GUTTER_SIZE_PX)) /
              DAYS.length +
            'px';
          calendarSpanSelector.current.style.top =
            (Math.min(ctcAQuarters, ctcBQuarters) * HOUR_HEIGHT_PX) /
              QUARTERS_PER_HOUR +
            'px';
          calendarSpanSelector.current.style.width =
            (calendarScrollArea.current.clientWidth - LEFT_GUTTER_SIZE_PX) /
              DAYS.length +
            'px';
          calendarSpanSelector.current.style.height =
            (Math.abs(ctcAQuarters - ctcBQuarters) * HOUR_HEIGHT_PX) /
              QUARTERS_PER_HOUR +
            'px';
        }
        setCalendarTimeCodeB(newTimeCodeB);
      }
    }
  }

  function handleEndCalendarSelection(_: Position, finalPosition: Position) {
    if (
      calendarScrollArea.current &&
      purposeSelector.current &&
      calendarTimeCodeA
    ) {
      let output = 'In Progress: User selected a ';
      if (
        calendarTimeCodeB &&
        !ctcsAreEqual(calendarTimeCodeA, calendarTimeCodeB)
      ) {
        output +=
          'SPAN (' +
          naturalFormFromCTC(calendarTimeCodeA, true) +
          ' to ' +
          naturalFormFromCTC(calendarTimeCodeB, true) +
          ')';
        setSelectedTimeType(TimeType.Span);
      } else {
        output += 'MOMENT (' + naturalFormFromCTC(calendarTimeCodeA) + ')';
        setSelectedTimeType(TimeType.Moment);
      }
      output +=
        ' from ' + DAYS[calendarDate] + ' ' + MOCK_DATES[calendarDate] + '.';
      console.log(output);
      setCalendarTimeCodeA(null);
      setCalendarTimeCodeB(null);
      positionPurposeSelector(finalPosition.absoluteX, finalPosition.absoluteY);
    }
  }

  function positionPurposeSelector(x: number, y: number) {
    const epsilon = 8;
    if (purposeSelector.current) {
      const diameter = RADIAL_SELECTOR_RADIUS_PX; // width === height
      const radius = diameter / 2;
      purposeSelector.current.style.left =
        (x < radius + epsilon
          ? epsilon
          : x + radius + epsilon > window.innerWidth
            ? window.innerWidth - diameter - epsilon
            : x - radius) + 'px';
      purposeSelector.current.style.top =
        (y < radius + epsilon
          ? epsilon
          : y + radius + epsilon > window.innerHeight
            ? window.innerHeight - diameter - epsilon
            : y - radius) + 'px';
    }
  }

  function handlePurposeDecision(decision: TimePurpose | null) {
    if (decision === null) {
      console.log(
        'Incomplete: User cancelled the operation. No action would be taken.'
      );
    } else {
      console.log(
        'Complete: The user intends to use their prior selection as a ' +
          TimePurpose[decision] +
          ' time. A complete implementation would proceed to another modal dialog to request more conventional details.'
      );
    }
    setCalendarTimeCodeA(null);
    setCalendarTimeCodeB(null);
    setSelectedTimeType(null);
  }

  function handleMouseUp(e: MouseEvent) {
    if (
      e.button === LEFT_MOUSE_BUTTON &&
      purposeSelector.current &&
      selectedTimeType
    ) {
      const selector = purposeSelector.current;
      const radius = purposeSelector.current.clientWidth / 2;
      if (
        Math.sqrt(
          Math.pow(selector.offsetLeft + radius - e.clientX, 2) +
            Math.pow(selector.offsetTop + radius - e.clientY, 2)
        ) > radius
      ) {
        handlePurposeDecision(null);
      }
    }
  }

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black overflow-hidden">
      <main className="flex max-h-screen w-full max-w-6xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-row w-full">
          <div className="w-16 min-h-full border-r" />
          <div className="grow flex flex-col border-b">
            <div className="flex flex-row w-full">
              {DAYS.map((day, i) => (
                <div key={i} className="basis-0 grow text-center border-r pt-4">
                  {day}
                </div>
              ))}
            </div>
            <div className="flex flex-row w-full">
              {MOCK_DATES.map((date, i) => (
                <div
                  key={i}
                  className="basis-0 grow text-center pb-4 border-r border-b"
                >
                  {date}
                </div>
              ))}
            </div>
            <ScrollArea className="w-full h-32 overflow-y-auto">
              <div className="flex flex-row">
                {DAYS.map((_, i) => (
                  <div
                    key={i}
                    onClick={(e) => handleAgendaSelection(e, i)}
                    className="basis-0 grow text-center border-r min-h-32"
                  >
                    {MOCK_LONG_CONTENT}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        <ScrollArea
          ref={calendarScrollArea}
          onMouseDown={startRangeSelection}
          className="flex flex-col grow w-full overflow-y-auto"
        >
          <div className="flex flex-row w-full">
            <div className="flex flex-row min-w-16">
              <div className="flex flex-col text-nowrap text-end overflow-visible">
                {HOURS.map((hour, i) => (
                  <div
                    key={i}
                    className={clsx(
                      i === 0 ? 'h-13 text-xs text-zinc-500' : 'h-16'
                    )}
                  >
                    {hour}
                  </div>
                ))}
                <div className="text-xs text-zinc-500 relative -top-1 -mb-1">
                  {HOURS[0]}
                </div>
              </div>
              <div className="grow border-r" />
            </div>
            <div className="flex flex-row w-full relative">
              <div className="absolute w-full h-full">
                {HOURS.map((_, i) => (
                  <div key={i} className="w-full h-16 border-b" />
                ))}
              </div>
              {DAYS.map((_, i) => (
                <div key={i} className="basis-0 grow border-r" />
              ))}
              <div
                ref={calendarSpanSelector}
                className={clsx(
                  'absolute bg-blue-200 text-white rounded',
                  calendarTimeCodeA !== null &&
                    calendarTimeCodeB !== null &&
                    !ctcsAreEqual(calendarTimeCodeA, calendarTimeCodeB)
                    ? ''
                    : 'hidden'
                )}
              />
            </div>
          </div>
        </ScrollArea>
      </main>
      <RadialSelector
        ref={purposeSelector}
        visible={selectedTimeType === null}
        topButton={{
          icon: PlayIcon,
          text: 'Start',
          disabled: selectedTimeType === TimeType.Span,
          onClick: () => handlePurposeDecision(TimePurpose.Start)
        }}
        leftButton={{
          icon: BriefcaseBusinessIcon,
          text: 'Work',
          disabled: selectedTimeType === TimeType.Moment,
          onClick: () => handlePurposeDecision(TimePurpose.Work)
        }}
        rightButton={{
          icon: TargetIcon,
          text: 'Due',
          disabled: selectedTimeType === TimeType.Span,
          onClick: () => handlePurposeDecision(TimePurpose.Due)
        }}
        bottomButton={{
          icon: StarIcon,
          text: 'Event',
          disabled: false,
          onClick: () => handlePurposeDecision(TimePurpose.Event)
        }}
        onCancel={() => handlePurposeDecision(null)}
      />
    </div>
  );
}
