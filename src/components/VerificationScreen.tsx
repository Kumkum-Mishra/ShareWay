import React, { useState, useEffect, useRef } from 'react';
import { Mail, Smartphone, ArrowLeft, CheckCircle, RefreshCw, Send } from 'lucide-react';
import { generateVerificationCode, sendVerificationEmail, sendVerificationSMS } from '../services/emailService';

interface VerificationScreenProps {
  email: string;
  phone: string;
  onVerified: () => void;
  onBack: () => void;
}

export default function VerificationScreen({ email, phone, onVerified, onBack }: VerificationScreenProps) {
  const [emailCode, setEmailCode] = useState(['', '', '', '', '', '']);
  const [emailVerified, setEmailVerified] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Store actual verification code
  const [actualEmailCode, setActualEmailCode] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Send verification email on mount
  useEffect(() => {
    const sendVerificationCode = async () => {
      setSending(true);
      
      // Generate code
      const emailVerificationCode = generateVerificationCode();
      setActualEmailCode(emailVerificationCode);
      
      // Extract name from email (before @)
      const userName = email.split('@')[0];
      
      // Send email
      const emailSent = await sendVerificationEmail(email, userName, emailVerificationCode);
      
      setSending(false);
      
      // Show code in console and alert for demo
      console.log('=== EMAIL VERIFICATION CODE SENT ===');
      console.log('Email:', email);
      console.log('Code:', emailVerificationCode);
      console.log('Status:', emailSent ? 'Sent successfully!' : 'Demo mode (check console)');
      console.log('====================================');
      
      alert(
        `📧 Verification Email Sent!\n\n` +
        `To: ${email}\n` +
        `Code: ${emailVerificationCode}\n\n` +
        `${emailSent ? '✓ Check your inbox!' : 'ℹ️ Demo mode - code shown above'}\n\n` +
        `The code will expire in 10 minutes.`
      );
    };
    
    sendVerificationCode();
  }, [email]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const code = [...emailCode];
    code[index] = value.slice(-1);
    setEmailCode(code);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (code.every(digit => digit !== '')) {
      const enteredCode = code.join('');
      if (enteredCode === actualEmailCode) {
        setEmailVerified(true);
        setTimeout(onVerified, 1000);
      } else {
        // Wrong code
        alert('Invalid verification code. Please try again.');
        setEmailCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && index > 0) {
      if (!emailCode[index]) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleResendCode = async () => {
    setSending(true);
    setCountdown(60);
    setCanResend(false);
    
    const newCode = generateVerificationCode();
    setActualEmailCode(newCode);
    const userName = email.split('@')[0];
    const sent = await sendVerificationEmail(email, userName, newCode);
    
    console.log('Email code resent:', newCode);
    alert(`New verification code sent to ${email}\nCode: ${newCode}\n${sent ? '✓ Email sent!' : 'ℹ️ Demo mode'}`);
    
    setSending(false);
  };

  const renderCodeInputs = () => {
    return (
      <div className="flex justify-center gap-3 mb-6">
        {emailCode.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={emailVerified}
            className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl transition-all focus:ring-2 focus:ring-emerald-500 ${
              emailVerified
                ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                : 'bg-white border-gray-300 focus:border-emerald-500'
            }`}
            autoFocus={index === 0 && !emailVerified}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back</span>
        </button>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white text-center relative">
            {sending && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs">
                <Send className="w-3 h-3 animate-pulse" />
                <span>Sending...</span>
              </div>
            )}
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
            <p className="text-white/90 text-sm">
              We sent a verification code to your email
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                {emailVerified ? 'Email Verified!' : 'Enter Verification Code'}
              </h3>
              <p className="text-gray-600 text-center mb-6 text-sm">
                {emailVerified ? (
                  <span className="text-emerald-600 font-semibold">
                    ✓ {email} verified successfully
                  </span>
                ) : (
                  <>We sent a 6-digit code to<br /><strong>{email}</strong></>
                )}
              </p>

              {!emailVerified && (
                <>
                  {renderCodeInputs()}

                  <div className="text-center mb-6">
                    {canResend ? (
                      <button
                        onClick={handleResendCode}
                        disabled={sending}
                        className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm flex items-center gap-2 mx-auto disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${sending ? 'animate-spin' : ''}`} />
                        {sending ? 'Sending...' : 'Resend Code'}
                      </button>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Resend code in {countdown}s
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-xs text-blue-800">
                      <strong>Tip:</strong> Check your spam folder if you don't see the email. 
                      In demo mode, codes are shown in console/alert.
                    </p>
                  </div>
                </>
              )}

              {emailVerified && (
                <div className="text-center">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <CheckCircle className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Email Verified! 🎉</h4>
                  <p className="text-gray-600 text-sm mb-4">Your account is ready</p>
                  <p className="text-xs text-gray-500">Redirecting to tutorial...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-emerald-200">
          <p className="text-xs text-gray-600 text-center">
            <strong>Setup EmailJS</strong> to send real verification emails. 
            Currently in demo mode - codes shown in console/alert.
          </p>
        </div>
      </div>
    </div>
  );
}

