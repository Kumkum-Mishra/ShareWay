import React, { useEffect, useState } from 'react';
import { Gift, X, Sparkles } from 'lucide-react';

interface ScratchCardProps {
  points: number;
  onComplete: () => void;
}

export default function ScratchCard({ points, onComplete }: ScratchCardProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  // Trigger confetti on mount
  useEffect(() => {
    setShowConfetti(true);
  }, []);


  return (
    <>
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: ['#10b981', '#0891b2', '#6366f1', '#f59e0b', '#ef4444', '#ec4899'][Math.floor(Math.random() * 6)],
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Small Square Card at Bottom */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-slideUp">
        <div className="bg-white rounded-2xl shadow-2xl w-80 h-80 overflow-hidden border-4 border-yellow-300">
          {/* Card Content */}
          <div className="h-full bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 p-6 flex flex-col items-center justify-center relative">
            {/* Decorative elements */}
            <div className="absolute top-3 right-3 text-yellow-200 text-2xl opacity-50 animate-pulse">✨</div>
            <div className="absolute bottom-3 left-3 text-yellow-200 text-xl opacity-40">🎁</div>
            <div className="absolute top-1/2 left-4 text-yellow-200 text-lg opacity-30">⭐</div>
            
            {/* Close button */}
            <button
              onClick={onComplete}
              className="absolute top-3 left-3 w-8 h-8 bg-white/30 hover:bg-white/50 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Content */}
            <div className="text-center text-white relative z-10">
              <div className="text-5xl mb-4 animate-bounce">
                🎉
              </div>
              
              <h3 className="text-2xl font-bold mb-2">
                Welcome Bonus!
              </h3>
              
              <div className="my-4">
                <div className="text-6xl font-black mb-2 drop-shadow-2xl animate-pulse-scale">
                  {points}
                </div>
                <div className="text-xl font-bold">
                  POINTS
                </div>
              </div>

              <div className="mt-4 text-sm opacity-90">
                Added to your wallet
              </div>

              <button
                onClick={onComplete}
                className="mt-4 bg-white text-orange-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { 
            transform: translate(-50%, 50px);
            opacity: 0;
          }
          to { 
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        @keyframes confettiFall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        .confetti-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9999;
          overflow: hidden;
        }
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confettiFall linear forwards;
          opacity: 0.9;
        }
        .confetti:nth-child(odd) {
          width: 8px;
          height: 16px;
        }
        .confetti:nth-child(3n) {
          width: 12px;
          height: 8px;
        }
        @keyframes pulse-scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .animate-pulse-scale {
          animation: pulse-scale 1s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

