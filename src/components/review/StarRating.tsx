/* eslint-disable*/
import { Star } from "lucide-react";
import type React from "react";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  onHover: (value: number) => void;
  onHoverLeave: () => void;
  hoverValue: number;
}

const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  onHover,
  onHoverLeave,
  hoverValue,
}: StarRatingProps) => {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => onHover(star)}
          onMouseLeave={onHoverLeave}
          className="p-1 transition-transform hover:scale-110"
        >
          <Star
            size={24}
            className={`${
              star <= (hoverValue > 0 ? hoverValue : value)
                ? "fill-[#d4c5b9] text-[#d4c5b9]"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;