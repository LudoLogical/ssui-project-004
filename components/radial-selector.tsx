'use client';

import clsx from 'clsx';
import { LucideIcon, XIcon } from 'lucide-react';
import { Ref } from 'react';

export type RadialSelectorButtonConfig = {
  icon: LucideIcon;
  text: string;
  disabled: boolean;
  onClick: () => void;
};

export type RadialSelectorProps = {
  ref?: Ref<HTMLDivElement>;
  visible: boolean;
  topButton: RadialSelectorButtonConfig;
  leftButton: RadialSelectorButtonConfig;
  rightButton: RadialSelectorButtonConfig;
  bottomButton: RadialSelectorButtonConfig;
  onCancel: () => void;
};

export const RADIAL_SELECTOR_RADIUS_PX = 192;

export default function RadialSelector({
  ref,
  visible,
  topButton,
  leftButton,
  rightButton,
  bottomButton,
  onCancel
}: RadialSelectorProps) {
  return (
    <div
      ref={ref}
      className={clsx(
        'absolute w-48 h-48 bg-zinc-800 text-white rounded-full overflow-clip',
        visible ? 'hidden' : ''
      )}
    >
      <div className="group">
        <div className="absolute origin-bottom-right rotate-45 w-1/2 h-1/2 group-hover:bg-zinc-700 rounded-tl-full transition-all" />
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <topButton.icon />
          {topButton.text}
        </div>
        <button
          disabled={topButton.disabled}
          onClick={topButton.onClick}
          className="absolute origin-bottom-right rotate-45 w-1/2 h-1/2 rounded-tl-full disabled:bg-white/20"
        />
      </div>
      <div className="group">
        <div className="absolute origin-bottom-left left-1/2 rotate-45 w-1/2 h-1/2 group-hover:bg-zinc-700 rounded-tr-full transition-all" />
        <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col items-center">
          <rightButton.icon />
          {rightButton.text}
        </div>
        <button
          disabled={rightButton.disabled}
          onClick={rightButton.onClick}
          className="absolute origin-bottom-left left-1/2 rotate-45 w-1/2 h-1/2 rounded-tr-full disabled:bg-white/20"
        />
      </div>
      <div className="group">
        <div className="absolute origin-top-left left-1/2 top-1/2 rotate-45 w-1/2 h-1/2 group-hover:bg-zinc-700 rounded-br-full transition-all" />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <bottomButton.icon />
          {bottomButton.text}
        </div>
        <button
          disabled={bottomButton.disabled}
          onClick={bottomButton.onClick}
          className="absolute origin-top-left left-1/2 top-1/2 rotate-45 w-1/2 h-1/2 rounded-br-full disabled:bg-white/20"
        />
      </div>
      <div className="group">
        <div className="absolute origin-top-right top-1/2 rotate-45 w-1/2 h-1/2 group-hover:bg-zinc-700 rounded-bl-full transition-all" />
        <div className="absolute top-1/2 -translate-y-1/2 left-4 flex flex-col items-center">
          <leftButton.icon />
          {leftButton.text}
        </div>
        <button
          disabled={leftButton.disabled}
          onClick={leftButton.onClick}
          className="absolute origin-top-right top-1/2 rotate-45 w-1/2 h-1/2 rounded-bl-full disabled:bg-white/20"
        />
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 rotate-45 h-48 w-0.5 bg-zinc-300" />
      <div className="absolute left-1/2 -translate-x-1/2 -rotate-45 h-48 w-0.5 bg-zinc-300" />
      <button
        onClick={onCancel}
        className="absolute left-1/2 top-1/2 -translate-1/2 flex flex-col justify-center items-center w-16 h-16 bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-300 rounded-full transition-all"
      >
        <XIcon />
      </button>
    </div>
  );
}
