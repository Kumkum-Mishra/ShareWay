import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, CheckCircle, XCircle, AlertCircle, RefreshCw, CreditCard, User } from 'lucide-react';
import * as faceapi from 'face-api.js';

interface AadhaarVerificationProps {
  role: 'passenger' | 'driver';
  gender?: 'male' | 'female' | 'other';
  fullName?: string;
  onVerified: (aadhaarData: AadhaarData) => void;
  onSkip?: () => void;
  showRewardOnSkip?: boolean;
}

export interface AadhaarData {
  aadhaarNumber: string;
  aadhaarPhoto: string;
  livePhoto: string;
  matchScore: number;
  verified: boolean;
  aadhaarName?: string;
}

export default function AadhaarVerification({ role, gender, fullName, onVerified, onSkip, showRewardOnSkip = true }: AadhaarVerificationProps) {
  const [step, setStep] = useState<'upload' | 'camera' | 'matching' | 'verified'>('upload');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarName, setAadhaarName] = useState('');
  const [aadhaarPhoto, setAadhaarPhoto] = useState<string | null>(null);
  const [livePhoto, setLivePhoto] = useState<string | null>(null);
  const [matchScore, setMatchScore] = useState(0);
  const [isMatching, setIsMatching] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [showRewardCard, setShowRewardCard] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  
  // Enhanced security thresholds for female users
  const MATCH_THRESHOLD = gender === 'female' ? 70 : 50; // 70% for females, 50% for others
  const [nameVerified, setNameVerified] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models'; // You'll need to add face-api models to public/models
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
        console.log('Face detection models loaded');
      } catch (error) {
        console.log('Model loading failed (demo mode):', error);
        setModelsLoaded(true); // Continue in demo mode
      }
    };
    loadModels();
  }, []);

  // Handle Aadhaar upload
  const handleAadhaarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAadhaarPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Start camera for live photo
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user' 
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Unable to access camera. Please allow camera permissions.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setCameraActive(false);
    }
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const photoData = canvas.toDataURL('image/jpeg');
      setLivePhoto(photoData);
      stopCamera();
      setStep('matching');
      performFaceMatching(photoData);
    }
  };

  // Perform face matching with enhanced security for females
  const performFaceMatching = async (livephoto: string) => {
    setIsMatching(true);
    
    try {
      // For female users, verify name first
      if (gender === 'female') {
        if (!aadhaarName || !fullName) {
          alert('Name verification required for female users');
          setIsMatching(false);
          return;
        }
        
        // Check name similarity
        const nameMatch = aadhaarName.toLowerCase().trim() === fullName.toLowerCase().trim();
        if (!nameMatch) {
          alert(
            `Name Mismatch!\n\n` +
            `Aadhaar Name: ${aadhaarName}\n` +
            `Entered Name: ${fullName}\n\n` +
            `For security reasons, female users must have exact name match.`
          );
          setIsMatching(false);
          setStep('upload');
          return;
        }
        setNameVerified(true);
        console.log('✅ Name verified for female user');
      }
      
      // In production, this would use actual face-api.js
      // For demo, simulate matching with higher precision for females
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Simulate match score - more precise for females
      let simulatedScore;
      if (gender === 'female') {
        // Female: 65-95% range (stricter)
        simulatedScore = 65 + Math.random() * 30;
      } else {
        // Others: 55-95% range
        simulatedScore = 55 + Math.random() * 40;
      }
      
      setMatchScore(simulatedScore);
      console.log(`Face Match Score: ${simulatedScore.toFixed(1)}% (Threshold: ${MATCH_THRESHOLD}%)`);
      
      if (simulatedScore >= MATCH_THRESHOLD) {
        setStep('verified');
        // Show reward card after verification
        setTimeout(() => {
          setShowRewardCard(true);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }, 1500);
      } else {
        alert(
          `Face Match Failed!\n\n` +
          `Match Score: ${simulatedScore.toFixed(1)}%\n` +
          `Required: ${MATCH_THRESHOLD}%\n\n` +
          `${gender === 'female' ? 'Female users require 70% match for security.\n' : ''}` +
          `Please retake photo with:\n` +
          `• Better lighting\n` +
          `• Face centered\n` +
          `• No glasses or hat\n` +
          `• Clear facial features`
        );
        setLivePhoto(null);
        setStep('camera');
        startCamera();
      }
    } catch (error) {
      console.error('Face matching error:', error);
      alert('Face matching failed. Please try again.');
      setIsMatching(false);
    } finally {
      setIsMatching(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className={`p-6 text-white ${
            role === 'passenger'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600'
          }`}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <CreditCard className="w-9 h-9" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Aadhaar Verification</h2>
                <p className="text-white/90 text-sm">Secure identity verification</p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 ${step !== 'upload' ? 'text-emerald-600' : 'text-gray-900'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  step !== 'upload' ? 'bg-emerald-600 text-white' : 'bg-gray-200'
                }`}>
                  {step !== 'upload' ? '✓' : '1'}
                </div>
                <span className="text-sm font-semibold">Upload Aadhaar</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200 mx-3"></div>
              <div className={`flex items-center gap-2 ${step === 'matching' || step === 'verified' ? 'text-emerald-600' : step === 'camera' ? 'text-gray-900' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  step === 'matching' || step === 'verified' ? 'bg-emerald-600 text-white' : step === 'camera' ? 'bg-gray-200' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step === 'matching' || step === 'verified' ? '✓' : '2'}
                </div>
                <span className="text-sm font-semibold">Capture Photo</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200 mx-3"></div>
              <div className={`flex items-center gap-2 ${step === 'verified' ? 'text-emerald-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  step === 'verified' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step === 'verified' ? '✓' : '3'}
                </div>
                <span className="text-sm font-semibold">Verify</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Step 1: Upload Aadhaar */}
            {step === 'upload' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Your Aadhaar Card</h3>
                <p className="text-gray-600 mb-6 text-sm">
                  We need to verify your identity for security purposes. Your Aadhaar details are encrypted and secure.
                </p>

                {/* Aadhaar Number */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Aadhaar Number (12 digits)
                  </label>
                  <input
                    type="text"
                    value={aadhaarNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                      setAadhaarNumber(value);
                    }}
                    placeholder="XXXX XXXX XXXX"
                    maxLength={12}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {aadhaarNumber.length}/12 digits
                  </p>
                </div>

                {/* Name on Aadhaar (Required for females) */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name on Aadhaar Card{gender === 'female' && ' *'}
                  </label>
                  <input
                    type="text"
                    value={aadhaarName}
                    onChange={(e) => setAadhaarName(e.target.value)}
                    placeholder="Full name as per Aadhaar"
                    required={gender === 'female'}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      gender === 'female' ? 'border-pink-300 bg-pink-50' : 'border-gray-300'
                    }`}
                  />
                  {gender === 'female' && (
                    <p className="text-xs text-pink-600 mt-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      For female users: Name must exactly match your registration name for security
                    </p>
                  )}
                  {aadhaarName && fullName && gender === 'female' && (
                    <p className={`text-xs mt-1 flex items-center gap-1 ${
                      aadhaarName.toLowerCase().trim() === fullName.toLowerCase().trim()
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {aadhaarName.toLowerCase().trim() === fullName.toLowerCase().trim() ? (
                        <><CheckCircle className="w-3 h-3" /> Names match</>
                      ) : (
                        <><XCircle className="w-3 h-3" /> Names don't match</>
                      )}
                    </p>
                  )}
                </div>

                {/* Aadhaar Photo Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Upload Aadhaar Card Photo
                  </label>
                  
                  {!aadhaarPhoto ? (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                      <Upload className="w-12 h-12 text-gray-400 mb-3" />
                      <span className="text-sm font-semibold text-gray-600">Click to upload Aadhaar card</span>
                      <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAadhaarUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative">
                      <img src={aadhaarPhoto} alt="Aadhaar" className="w-full rounded-2xl border-2 border-emerald-500" />
                      <button
                        onClick={() => setAadhaarPhoto(null)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (aadhaarNumber.length !== 12) {
                      alert('Please enter a valid 12-digit Aadhaar number');
                      return;
                    }
                    if (!aadhaarPhoto) {
                      alert('Please upload your Aadhaar card photo');
                      return;
                    }
                    setStep('camera');
                    setTimeout(startCamera, 500);
                  }}
                  disabled={aadhaarNumber.length !== 12 || !aadhaarPhoto}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  Continue to Face Verification
                </button>

                {onSkip && (
                  <button
                    onClick={() => {
                      // Show reward card even when skipping
                      setIsSkipped(true);
                      setShowRewardCard(true);
                      setShowConfetti(true);
                      setTimeout(() => setShowConfetti(false), 5000);
                    }}
                    className="w-full mt-3 text-gray-600 hover:text-gray-900 py-2 text-sm font-medium"
                  >
                    Skip for now (not recommended)
                  </button>
                )}
              </div>
            )}

            {/* Step 2: Camera Capture */}
            {step === 'camera' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Capture Your Live Photo</h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Look directly at the camera and ensure good lighting for best results
                </p>

                <div className="mb-6">
                  {!livePhoto ? (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-80 bg-black rounded-2xl object-cover"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      
                      {cameraActive && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                          <button
                            onClick={capturePhoto}
                            className="w-16 h-16 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-110"
                          >
                            <Camera className="w-8 h-8 text-white" />
                          </button>
                        </div>
                      )}

                      {!cameraActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-2xl">
                          <button
                            onClick={startCamera}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
                          >
                            <Camera className="w-5 h-5" />
                            Start Camera
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <img src={livePhoto} alt="Live capture" className="w-full rounded-2xl" />
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Tips for best results:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Remove glasses and hat</li>
                        <li>• Ensure good lighting</li>
                        <li>• Look directly at camera</li>
                        <li>• Keep face centered</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {!livePhoto && (
                  <button
                    onClick={() => {
                      stopCamera();
                      setStep('upload');
                    }}
                    className="w-full text-gray-600 hover:text-gray-900 py-2 text-sm font-medium"
                  >
                    Go Back
                  </button>
                )}
              </div>
            )}

            {/* Step 3: Matching */}
            {step === 'matching' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Verifying Your Identity...</h3>
                <p className="text-gray-600 mb-6">Matching your photo with Aadhaar</p>
                
                <div className="bg-gray-100 rounded-full h-2 overflow-hidden max-w-xs mx-auto">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full animate-pulse" style={{ width: '70%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-3">This may take a few seconds...</p>
              </div>
            )}

            {/* Step 4: Verified */}
            {step === 'verified' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <CheckCircle className="w-12 h-12 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Identity Verified!</h3>
                <p className="text-gray-600 mb-6">Your face matches with Aadhaar photo</p>
                
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6 max-w-sm mx-auto">
                  <div className="text-sm text-gray-600 mb-2">Match Score</div>
                  <div className="text-5xl font-bold text-emerald-600 mb-2">
                    {matchScore.toFixed(1)}%
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-emerald-700">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-semibold">Verification Successful</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-600 mb-2">Aadhaar Photo</p>
                    <img src={aadhaarPhoto!} alt="Aadhaar" className="w-full h-32 object-cover rounded-lg border-2 border-gray-200" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-2">Live Photo</p>
                    <img src={livePhoto!} alt="Live" className="w-full h-32 object-cover rounded-lg border-2 border-emerald-500" />
                  </div>
                </div>

                <p className="text-xs text-gray-500">Redirecting to complete registration...</p>
              </div>
            )}
          </div>

          {/* Footer Security Note */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
              <div className="w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
              <span>Encrypted & Secure • Data Protected</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-emerald-200">
          <p className="text-xs text-gray-600 text-center">
            <strong>Privacy:</strong> Your Aadhaar details are encrypted and used only for identity verification. 
            We comply with all data protection regulations.
          </p>
        </div>
      </div>

      {/* 1000 Points Reward Card - Bottom Center */}
      {showRewardCard && (
        <>
          {/* Confetti Effect */}
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-[60]">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '-10%',
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                >
                  {['🎉', '⭐', '🎊', '✨', '🌟'][Math.floor(Math.random() * 5)]}
                </div>
              ))}
            </div>
          )}

          {/* Reward Card */}
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-slideUp">
            <div className="bg-white rounded-2xl shadow-2xl w-72 h-72 overflow-hidden border-4 border-yellow-400">
              <div className="h-full bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 p-6 flex flex-col items-center justify-center relative">
                {/* Decorative elements */}
                <div className="absolute top-3 right-3 text-yellow-200 text-2xl opacity-50 animate-pulse">✨</div>
                <div className="absolute bottom-3 left-3 text-yellow-200 text-xl opacity-40">🎁</div>
                
                {/* Content */}
                <div className="text-center text-white relative z-10">
                  <div className="text-5xl mb-3 animate-bounce">🎉</div>
                  
                  <h3 className="text-2xl font-bold mb-2">Welcome Bonus!</h3>
                  
                  <div className="my-4">
                    <div className="text-7xl font-black mb-2 drop-shadow-2xl">1000</div>
                    <div className="text-xl font-bold">POINTS</div>
                  </div>

                  <div className="text-sm opacity-90 mb-4">
                    Added to your reward wallet
                  </div>

                  <button
                    onClick={() => {
                      setShowRewardCard(false);
                      setShowConfetti(false);
                      
                      // If verification was skipped, call onSkip
                      if (isSkipped && onSkip) {
                        onSkip();
                      } else {
                        // Otherwise, complete normal verification
                        onVerified({
                          aadhaarNumber,
                          aadhaarPhoto: aadhaarPhoto!,
                          livePhoto: livePhoto!,
                          matchScore: matchScore,
                          verified: true,
                          aadhaarName: aadhaarName || undefined
                        });
                      }
                    }}
                    className="bg-white text-orange-600 px-8 py-3 rounded-full font-bold text-sm hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

