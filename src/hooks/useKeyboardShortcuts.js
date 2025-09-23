import { useEffect } from 'react';

const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if any modifier key is pressed
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      const isShift = event.shiftKey;
      const isAlt = event.altKey;
      
      shortcuts.forEach((shortcut) => {
        const { key, ctrl, shift, alt, action, preventDefault = true } = shortcut;
        
        // Check if all modifiers match
        const ctrlMatch = ctrl ? isCtrlOrCmd : !isCtrlOrCmd;
        const shiftMatch = shift ? isShift : !isShift;
        const altMatch = alt ? isAlt : !isAlt;
        
        // Check if the key matches
        const keyMatch = event.key.toLowerCase() === key.toLowerCase();
        
        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          if (preventDefault) {
            event.preventDefault();
          }
          action(event);
        }
      });
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};

export default useKeyboardShortcuts;