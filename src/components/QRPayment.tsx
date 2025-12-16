import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, CheckCircle, Smartphone, Copy, RefreshCw, Clock } from 'lucide-react';

interface QRPaymentProps {
  amount: number;
  description: string;
  merchantName: string;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

export default function QRPayment({ amount, description, merchantName, onSuccess, onCancel }: QRPaymentProps) {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [transactionId] = useState(`TXN${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timer
  const [copied, setCopied] = useState(false);

  // Generate UPI payment string
  const upiId = '8076931646@fam'; // Your UPI ID
  const upiPaymentString = `upi://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&tn=${description}&cu=INR`;

  // Countdown timer
  useEffect(() => {
    if (paymentStatus !== 'pending') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentStatus('failed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentStatus]);

  // Simulate payment verification (In production, this would be a webhook/API call)
  const simulatePaymentVerification = () => {
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('success');
      setTimeout(() => {
        onSuccess(transactionId);
      }, 2000);
    }, 2000);
  };

  const copyUPIId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-[440px] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-6 h-6" />
              <div>
                <h2 className="text-lg font-bold">UPI Payment</h2>
                {paymentStatus === 'pending' && (
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                )}
              </div>
            </div>
            {paymentStatus === 'pending' && (
              <button
                onClick={onCancel}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Pending Payment */}
          {paymentStatus === 'pending' && (
            <>
              {/* Amount Display */}
              <div className="text-center mb-4">
                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Amount to Pay</div>
                <div className="text-5xl font-bold text-gray-900 mb-1">
                  ₹{amount.toFixed(2)}
                </div>
                <div className="text-xs text-gray-600">{description}</div>
              </div>

              {/* QR Code */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 mb-4 border border-gray-200">
                <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-center">
                  <QRCodeSVG 
                    value={upiPaymentString}
                    size={180}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
                <p className="text-center text-xs text-gray-600 mt-3 font-semibold">
                  📱 Scan with any UPI app
                </p>
              </div>

              {/* Supported Apps */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 text-center mb-2 font-medium">SUPPORTED APPS</p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                    <div key={app} className="px-2.5 py-1 bg-gray-100 rounded-md text-xs font-semibold text-gray-700">
                      {app}
                    </div>
                  ))}
                </div>
              </div>

              {/* UPI ID */}
              <div className="bg-emerald-50 rounded-xl p-3 mb-4 border border-emerald-200">
                <p className="text-xs text-gray-600 mb-2 font-semibold">OR PAY TO UPI ID:</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white px-3 py-2 rounded-lg border border-emerald-200 font-mono text-sm font-medium">
                    {upiId}
                  </div>
                  <button
                    onClick={copyUPIId}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Demo Button */}
              <div className="border-t pt-3">
                <button
                  onClick={simulatePaymentVerification}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2.5 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md text-sm"
                >
                  Simulate Payment Success (Demo)
                </button>
                <p className="text-xs text-gray-500 text-center mt-1.5">
                  For testing purposes only
                </p>
              </div>
            </>
          )}

          {/* Processing */}
          {paymentStatus === 'processing' && (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verifying Payment...</h3>
              <p className="text-sm text-gray-600">Please wait</p>
            </div>
          )}

          {/* Success */}
          {paymentStatus === 'success' && (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-sm text-gray-600 mb-3">Your ride has been booked</p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-3">
                <div className="text-xs text-emerald-700 mb-1">Transaction ID</div>
                <div className="font-mono text-xs font-bold text-emerald-900">{transactionId}</div>
              </div>
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-xs text-gray-500">Redirecting...</p>
            </div>
          )}

          {/* Failed */}
          {paymentStatus === 'failed' && (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Expired</h3>
              <p className="text-sm text-gray-600 mb-4">Time limit reached</p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setPaymentStatus('pending');
                    setTimeLeft(300);
                  }}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2.5 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all text-sm"
                >
                  Try Again
                </button>
                <button
                  onClick={onCancel}
                  className="w-full bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-300 transition-all text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {paymentStatus === 'pending' && (
          <div className="bg-gray-50 px-6 py-3 border-t">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
              <div className="w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
              <span>Secure Payment • Encrypted</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            transform: translateY(50px);
            opacity: 0;
          }
          to { 
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

