import { useState, useEffect } from 'react';

/**
 * TimeElapsed Component
 * Displays time elapsed from created_at timestamp in minutes only
 * Shows 0 min if less than 1 minute
 * Updates every minute
 */
const TimeElapsed = ({ createdAt }) => {
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    const calculateTimeElapsed = () => {
      if (!createdAt) {
        setMinutes(0);
        return;
      }

      const createdDate = new Date(createdAt);
      const now = new Date();
      const diffMs = now - createdDate;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffMinutes < 1) {
        setMinutes(0);
      } else {
        setMinutes(diffMinutes);
      }
    };

    // Calculate immediately
    calculateTimeElapsed();

    // Update every minute (60 seconds)
    const interval = setInterval(calculateTimeElapsed, 60000);

    return () => clearInterval(interval);
  }, [createdAt]);

  if (!createdAt) return '-';

  return (
    <div className="flex items-center gap-1 text-blue-600">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-sm">{minutes} min</span>
    </div>
  );
};

export default TimeElapsed;
