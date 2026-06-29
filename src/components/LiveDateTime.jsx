import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const LiveDateTime = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Update the displayed time every second
    const timer = setInterval(() => setNow(new Date()), 1000);

    // Cleanup: stop the timer when this component unmounts
    // (e.g. if the layout itself ever gets removed) — without this,
    // the interval would keep running forever in the background, a memory leak
    return () => clearInterval(timer);
  }, []);

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className='hidden md:flex items-center gap-2 text-sm text-text-muted bg-bg border border-border rounded-lg px-3 py-1.5'>
      <Calendar size={14} />
      {dateStr} · {timeStr}
    </div>
  );
};

export default LiveDateTime;
