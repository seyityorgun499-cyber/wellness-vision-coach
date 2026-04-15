import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

interface KeyboardState {
  isOpen: boolean;
  keyboardHeight: number;
}

/**
 * Hook that listens to Capacitor Keyboard events on native platforms.
 * On web, returns default closed state (CSS handles keyboard behavior).
 */
export function useKeyboard(): KeyboardState {
  const [state, setState] = useState<KeyboardState>({ isOpen: false, keyboardHeight: 0 });

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const showListener = Keyboard.addListener('keyboardWillShow', (info) => {
      setState({ isOpen: true, keyboardHeight: info.keyboardHeight });
      document.documentElement.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
    });

    const hideListener = Keyboard.addListener('keyboardWillHide', () => {
      setState({ isOpen: false, keyboardHeight: 0 });
      document.documentElement.style.setProperty('--keyboard-height', '0px');
    });

    return () => {
      showListener.then(l => l.remove());
      hideListener.then(l => l.remove());
    };
  }, []);

  return state;
}
