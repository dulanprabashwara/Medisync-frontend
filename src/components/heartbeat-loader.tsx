import React from "react";

export function HeartbeatLoader({
  className = "",
  size = 40,
}: {
  className?: string;
  size?: number | string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <style>{`
        @keyframes custom-heartbeat {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.15); }
          30% { transform: scale(1); }
          45% { transform: scale(1.15); }
          60% { transform: scale(1); }
        }
        .animate-custom-heartbeat {
          animation: custom-heartbeat 1.5s ease-in-out infinite;
        }
        @keyframes draw-ecg {
          0% { stroke-dashoffset: 100; opacity: 0; }
          20% { opacity: 1; }
          80% { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }
        .animate-ecg {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: draw-ecg 1.5s linear infinite;
        }
      `}</style>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-custom-heartbeat w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="heartGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0ea5e9" />
            <stop offset="1" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="url(#heartGradient)"
        />
        <path
          d="M2 12h4.5l2-5 3.5 10 2.5-5H18"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-ecg"
          filter="drop-shadow(0px 0px 1px rgba(255,255,255,0.8))"
        />
        <circle cx="18" cy="12" r="1.5" fill="white" className="animate-ecg" />
      </svg>
    </div>
  );
}
