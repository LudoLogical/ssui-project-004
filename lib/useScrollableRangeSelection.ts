import {
  MouseEvent as ReactMouseEvent,
  useEffect,
  useState,
  RefObject
} from 'react';

const LEFT_MOUSE_BUTTON = 0;

export type Position = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
};

export default function useScrollableRangeSelection(
  targetRef: RefObject<HTMLElement | null>,
  onStartSelection: (initialPosition: Position) => void,
  onDrag: (initialPosition: Position, currentPosition: Position) => void,
  onEndSelection: (initialPosition: Position, finalPosition: Position) => void
) {
  const [initialPosition, setInitialPosition] = useState<Position | null>(null);
  const [finalPosition, setFinalPosition] = useState<Position | null>(null);

  function getCurrentPosition(
    clientX: number,
    clientY: number
  ): Position | null {
    if (targetRef.current) {
      const bounds = targetRef.current.getBoundingClientRect();
      return {
        x: clientX - bounds.left,
        y: clientY - bounds.top + targetRef.current.scrollTop,
        absoluteX: clientX,
        absoluteY: clientY
      };
    }
    return null;
  }

  function handleStartSelection(e: ReactMouseEvent<HTMLElement, MouseEvent>) {
    if (e.button === LEFT_MOUSE_BUTTON) {
      e.preventDefault();
      if (targetRef.current && initialPosition === null) {
        const position = getCurrentPosition(
          e.nativeEvent.clientX,
          e.nativeEvent.clientY
        );
        if (position) {
          setInitialPosition(position);
          setFinalPosition(position);
          onStartSelection(position);
        }
      }
    }
  }

  function handleMouseMove(e: MouseEvent) {
    if (initialPosition !== null) {
      e.preventDefault();
      const currentPosition = getCurrentPosition(e.clientX, e.clientY);
      if (currentPosition !== null) {
        setFinalPosition(currentPosition);
        onDrag(initialPosition, currentPosition);
      }
    }
  }

  function handleEndSelection(e: MouseEvent) {
    if (e.button === LEFT_MOUSE_BUTTON && initialPosition) {
      onEndSelection(initialPosition, finalPosition ?? initialPosition);
      setInitialPosition(null);
      setFinalPosition(null);
    }
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEndSelection);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEndSelection);
    };
  });

  return handleStartSelection;
}
