import { useRef, useState, useEffect } from 'react';

export function useFlashOnChange(value: number): string {
  const prevRef = useRef(value);
  const [flashClass, setFlashClass] = useState('');

  useEffect(() => {
    const prev = prevRef.current;
    if (prev !== value) {
      const cls = value > prev ? 'animate-flash-green' : 'animate-flash-orange';
      setFlashClass(cls);
      const timer = setTimeout(() => setFlashClass(''), 200);
      prevRef.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  return flashClass;
}
