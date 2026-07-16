import { useEffect } from 'react';

type KeyCombo = {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
};

export function useKeyboardShortcut(
  combo: KeyCombo,
  callback: (e: KeyboardEvent) => void,
  options: { preventDefault?: boolean; enableOnFormTags?: boolean } = {}
) {
  const { preventDefault = true, enableOnFormTags = false } = options;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger on input fields unless specified
      if (!enableOnFormTags) {
        const target = event.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return;
        }
      }

      const isKeyMatch = event.key.toLowerCase() === combo.key.toLowerCase();
      const isCtrlMatch = combo.ctrl ? event.ctrlKey || event.metaKey : true;
      const isShiftMatch = combo.shift ? event.shiftKey : true;
      const isAltMatch = combo.alt ? event.altKey : true;

      // Ensure that if ctrl is not required, it is not pressed (to prevent overlapping shortcuts)
      const exactCtrlMatch = combo.ctrl === (event.ctrlKey || event.metaKey);

      if (isKeyMatch && isCtrlMatch && isShiftMatch && isAltMatch && exactCtrlMatch) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [combo, callback, preventDefault, enableOnFormTags]);
}
