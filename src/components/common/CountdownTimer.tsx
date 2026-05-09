import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  durationInMinutes: number;
  onExpire: () => void;
  onTick?: (remainingSeconds: number) => void;
}

export default function CountdownTimer({
  durationInMinutes,
  onExpire,
  onTick,
}: CountdownTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(
    durationInMinutes * 60
  );

  useEffect(() => {
    if (remainingSeconds <= 0) {
      onExpire();
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        const newValue = prev - 1;
        if (onTick) {
          onTick(newValue);
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds, onExpire, onTick]);

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const getColorClass = () => {
    const percentageLeft = (remainingSeconds / (durationInMinutes * 60)) * 100;
    if (percentageLeft <= 20) return "text-red-600 bg-red-50 border-red-200";
    if (percentageLeft <= 50)
      return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  const getProgressColor = () => {
    const percentageLeft = (remainingSeconds / (durationInMinutes * 60)) * 100;
    if (percentageLeft <= 20) return "bg-red-500";
    if (percentageLeft <= 50) return "bg-orange-500";
    return "bg-green-500";
  };

  const progressPercentage =
    (remainingSeconds / (durationInMinutes * 60)) * 100;

  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all ${getColorClass()}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <span className="font-semibold text-sm">Payment Time Remaining</span>
        </div>
        <div className="text-2xl font-bold tabular-nums">
          {hours > 0 && <>{String(hours).padStart(2, "0")}:</>}
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${getProgressColor()}`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {remainingSeconds <= 60 && (
        <p className="text-xs mt-2 font-semibold animate-pulse">
          ⚠️ Payment will expire soon!
        </p>
      )}
    </div>
  );
}
