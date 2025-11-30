'use client';

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
import clsx from 'clsx';
import {
  BriefcaseBusinessIcon,
  PlayIcon,
  StarIcon,
  TargetIcon,
  XIcon
} from 'lucide-react';
import {
  useRef,
  useState,
  MouseEvent as ReactMouseEvent,
  useEffect
} from 'react';

const LEFT_GUTTER_SIZE_PX = 64;
const HOUR_HEIGHT_PX = 64;
const PURPOSE_SELECTOR_RADIUS_PX = 192;

export default function Home() {
  const calendarScrollArea = useRef<HTMLDivElement>(null);
  const calendarSpanSelector = useRef<HTMLDivElement>(null);
  const purposeSelector = useRef<HTMLDivElement>(null);

  const [calendarDate, setCalendarDate] = useState<number>(-1);
  const [calendarTimeCodeA, setCalendarTimeCodeA] =
    useState<CalendarTimeCode | null>(null);
  const [calendarTimeCodeB, setCalendarTimeCodeB] =
    useState<CalendarTimeCode | null>(null);
  const [selectedTimeType, setSelectedTimeType] = useState<TimeType | null>(
    null
  );

  // const isDragAndDropping = useRef<boolean>(false);
  // const draggedElement = useRef<HTMLDivElement>(null);

  function deduceCalendarDate(calendarDiv: HTMLDivElement, clientX: number) {
    const bounds = calendarDiv.getBoundingClientRect();
    const relativeX = clientX - bounds.left - LEFT_GUTTER_SIZE_PX; // must account for gutter size
    return Math.floor(
      (relativeX * DAYS.length) /
        (calendarDiv.clientWidth - LEFT_GUTTER_SIZE_PX)
    );
  }

  function deduceCalendarTimeCode(
    calendarDiv: HTMLDivElement,
    clientY: number
  ): CalendarTimeCode {
    const bounds = calendarDiv.getBoundingClientRect();
    const relativeY = clientY - bounds.top + calendarDiv.scrollTop;
    return ctcFromQuartersSafely(
      Math.round(
        (relativeY * HOURS.length * QUARTERS_PER_HOUR) /
          calendarDiv.scrollHeight
      )
    );
  }

  function handleBeginCalendarSelection(
    e: ReactMouseEvent<HTMLDivElement, MouseEvent>
  ) {
    e.preventDefault();
    if (calendarScrollArea.current && calendarTimeCodeA === null) {
      setCalendarDate(
        deduceCalendarDate(calendarScrollArea.current, e.nativeEvent.clientX)
      );
      const firstMomentPoint = deduceCalendarTimeCode(
        calendarScrollArea.current,
        e.nativeEvent.clientY
      );
      setCalendarTimeCodeA(firstMomentPoint);
      setCalendarTimeCodeB(firstMomentPoint);
    }
  }

  function handleEndCalendarSelection(e: MouseEvent) {
    if (
      calendarScrollArea.current &&
      purposeSelector.current &&
      calendarTimeCodeA !== null
    ) {
      let output = 'In Progress: User selected a ';
      if (
        calendarTimeCodeB !== null &&
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
      positionPurposeSelector(e.clientX, e.clientY);
    }
  }

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

  function positionPurposeSelector(clientX: number, clientY: number) {
    const epsilon = 8;
    if (purposeSelector.current) {
      const diameter = PURPOSE_SELECTOR_RADIUS_PX; // width === height
      const radius = diameter / 2;
      purposeSelector.current.style.left =
        (clientX < radius + epsilon
          ? epsilon
          : clientX + radius + epsilon > window.innerWidth
            ? window.innerWidth - diameter - epsilon
            : clientX - radius) + 'px';
      purposeSelector.current.style.top =
        (clientY < radius + epsilon
          ? epsilon
          : clientY + radius + epsilon > window.innerHeight
            ? window.innerHeight - diameter - epsilon
            : clientY - radius) + 'px';
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

  function handleMouseMove(e: MouseEvent) {
    e.preventDefault();
    if (
      calendarScrollArea.current &&
      calendarSpanSelector.current &&
      calendarTimeCodeA !== null &&
      selectedTimeType === null
    ) {
      const newTimeCodeB = deduceCalendarTimeCode(
        calendarScrollArea.current,
        e.clientY
      );
      if (
        calendarTimeCodeB !== null &&
        !ctcsAreEqual(calendarTimeCodeA, newTimeCodeB)
      ) {
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

  function handleMouseUp(e: MouseEvent) {
    if (calendarTimeCodeA !== null && selectedTimeType === null) {
      handleEndCalendarSelection(e);
    } else if (purposeSelector.current && selectedTimeType !== null) {
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
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
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
          onMouseDown={handleBeginCalendarSelection}
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
      <div
        ref={purposeSelector}
        className={clsx(
          'absolute w-48 h-48 bg-zinc-800 text-white rounded-full overflow-clip',
          selectedTimeType === null ? 'hidden' : ''
        )}
      >
        <div className="group">
          <div className="absolute origin-bottom-right rotate-45 w-1/2 h-1/2 group-hover:bg-zinc-700 rounded-tl-full transition-all" />
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <PlayIcon />
            Start
          </div>
          <button
            disabled={selectedTimeType === TimeType.Span}
            onClick={() => handlePurposeDecision(TimePurpose.Start)}
            className="absolute origin-bottom-right rotate-45 w-1/2 h-1/2 rounded-tl-full disabled:bg-white/20"
          />
        </div>
        <div className="group">
          <div className="absolute origin-bottom-left left-1/2 rotate-45 w-1/2 h-1/2 group-hover:bg-zinc-700 rounded-tr-full transition-all" />
          <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col items-center">
            <TargetIcon />
            Due
          </div>
          <button
            disabled={selectedTimeType === TimeType.Span}
            onClick={() => handlePurposeDecision(TimePurpose.Due)}
            className="absolute origin-bottom-left left-1/2 rotate-45 w-1/2 h-1/2 rounded-tr-full disabled:bg-white/20"
          />
        </div>
        <div className="group">
          <div className="absolute origin-top-left left-1/2 top-1/2 rotate-45 w-1/2 h-1/2 group-hover:bg-zinc-700 rounded-br-full transition-all" />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <StarIcon />
            Event
          </div>
          <button
            onClick={() => handlePurposeDecision(TimePurpose.Event)}
            className="absolute origin-top-left left-1/2 top-1/2 rotate-45 w-1/2 h-1/2 rounded-br-full disabled:bg-white/20"
          />
        </div>
        <div className="group">
          <div className="absolute origin-top-right top-1/2 rotate-45 w-1/2 h-1/2 group-hover:bg-zinc-700 rounded-bl-full transition-all" />
          <div className="absolute top-1/2 -translate-y-1/2 left-4 flex flex-col items-center">
            <BriefcaseBusinessIcon />
            Work
          </div>
          <button
            disabled={selectedTimeType === TimeType.Moment}
            onClick={() => handlePurposeDecision(TimePurpose.Work)}
            className="absolute origin-top-right top-1/2 rotate-45 w-1/2 h-1/2 rounded-bl-full disabled:bg-white/20"
          />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 rotate-45 h-48 w-0.5 bg-zinc-300" />
        <div className="absolute left-1/2 -translate-x-1/2 -rotate-45 h-48 w-0.5 bg-zinc-300" />
        <button
          onClick={() => handlePurposeDecision(null)}
          className="absolute left-1/2 top-1/2 -translate-1/2 flex flex-col justify-center items-center w-16 h-16 bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-300 rounded-full transition-all"
        >
          <XIcon />
        </button>
      </div>
    </div>
  );
}
