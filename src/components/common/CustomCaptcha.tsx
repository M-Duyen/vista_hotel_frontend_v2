import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface CustomCaptchaProps {
    onVerify: (isValid: boolean) => void;
    className?: string;
}

const CustomCaptcha: React.FC<CustomCaptchaProps> = ({
    onVerify,
    className = '',
}) => {
    const [captchaText, setCaptchaText] = useState('');
    const [userInput, setUserInput] = useState('');
    const [isVerified, setIsVerified] = useState(false);

    // Generate random captcha text
    const generateCaptcha = () => {
        const chars =
            'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let text = '';
        for (let i = 0; i < 6; i++) {
            text += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptchaText(text);
        setUserInput('');
        setIsVerified(false);
        onVerify(false);
    };

    useEffect(() => {
        generateCaptcha();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Draw captcha on canvas
    useEffect(() => {
        const canvas = document.getElementById(
            'captcha-canvas',
        ) as HTMLCanvasElement;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background with gradient
        const gradient = ctx.createLinearGradient(
            0,
            0,
            canvas.width,
            canvas.height,
        );
        gradient.addColorStop(0, '#f0f0f0');
        gradient.addColorStop(1, '#e0e0e0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add noise lines
        for (let i = 0; i < 5; i++) {
            ctx.strokeStyle = `rgba(${Math.random() * 100}, ${
                Math.random() * 100
            }, ${Math.random() * 100}, 0.3)`;
            ctx.beginPath();
            ctx.moveTo(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
            );
            ctx.lineTo(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
            );
            ctx.stroke();
        }

        // Draw captcha text
        ctx.font = 'bold 32px Arial';
        ctx.textBaseline = 'middle';

        const charSpacing = canvas.width / (captchaText.length + 1);
        for (let i = 0; i < captchaText.length; i++) {
            const x = charSpacing * (i + 1);
            const y = canvas.height / 2 + (Math.random() - 0.5) * 10;
            const rotation = (Math.random() - 0.5) * 0.4;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);

            // Random color for each character
            const hue = Math.random() * 360;
            ctx.fillStyle = `hsl(${hue}, 70%, 40%)`;
            ctx.fillText(captchaText[i], 0, 0);

            ctx.restore();
        }

        // Add noise dots
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = `rgba(${Math.random() * 255}, ${
                Math.random() * 255
            }, ${Math.random() * 255}, 0.3)`;
            ctx.fillRect(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                2,
                2,
            );
        }
    }, [captchaText]);

    // Verify captcha
    const handleInputChange = (value: string) => {
        setUserInput(value);
        const isValid = value.toLowerCase() === captchaText.toLowerCase();
        setIsVerified(isValid);
        onVerify(isValid);
    };

    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-3">
          {/* Captcha Input */}
          <div className="flex-1">
            <input
              type="text"
              value={userInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Nhập mã"
              maxLength={6}
              className={`w-full px-4 py-3 bg-white/10 border-2 rounded-lg text-white placeholder-white/50 focus:outline-none transition-all ${
                userInput
                  ? isVerified
                    ? "border-green-500 focus:border-green-500"
                    : "border-red-500 focus:border-red-500"
                  : "border-white/40 focus:border-[#c3923c]"
              }`}
            />
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={generateCaptcha}
            className="p-3 bg-white/10 hover:bg-white/20 border border-white/40 rounded-lg transition-all group"
            title="Tạo mã mới"
          >
            <RefreshCw className="w-5 h-5 text-white group-hover:rotate-180 transition-transform duration-500" />
          </button>

          {/* Captcha Canvas */}
          <div className="bg-white rounded-lg p-2 shadow-md">
            <canvas
              id="captcha-canvas"
              width="200"
              height="60"
              className="rounded"
            />
          </div>
        </div>

        {/* Validation Message */}
        {userInput && (
          <p
            className={`text-xs transition-all ${
              isVerified ? "text-green-400" : "text-red-400"
            }`}
          >
            {isVerified
              ? "Correct authentication code"
              : "Incorrect verification code"}
          </p>
        )}
      </div>
    );
};

export default CustomCaptcha;
