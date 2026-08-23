import { useEffect, useRef, useState } from 'react';

export function CountdownTimer({ initialSeconds, onEnd, serverSeconds }: { initialSeconds: number; onEnd?: () => void; serverSeconds?: number }) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (serverSeconds !== undefined) {
      setTimeLeft(serverSeconds);
    }
  }, [serverSeconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (onEnd) onEnd();
      return;
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (onEnd) onEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, onEnd]);

  if (timeLeft <= 0) {
    return <span className="font-bold text-danger">TERMINÉE</span>;
  }

  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const formatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  let colorClass = 'text-primary';
  if (timeLeft < 60) colorClass = 'text-danger font-bold animate-pulse';
  else if (timeLeft > 300) colorClass = 'text-success';

  return <span className={`font-mono text-xl ${colorClass}`}>{formatted}</span>;
}
