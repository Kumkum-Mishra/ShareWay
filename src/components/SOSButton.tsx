import React, { useState } from 'react';
import { AlertTriangle, Phone, MapPin, Share2, X, Check, Clock, User } from 'lucide-react';
import { Ride, EmergencyContact } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface SOSButtonProps {
  ride: Ride;
  pickupLocation: string;
  dropoffLocation: string;
}

export default function SOSButton({ ride, pickupLocation, dropoffLocation }: SOSButtonProps) {
  const { user } = useAuth();
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [sosActivated, setSOSActivated] = useState(false);
  const [notificationsSent, setNotificationsSent] = useState(false);

  const emergencyContacts = user?.emergency_contacts || [];
  const primaryContact = emergencyContacts.find(c => c.isPrimary);

  const activateSOS = () => {
    setSOSActivated(true);
    
    // Simulate sending notifications (in real app, this would be API calls)
    setTimeout(() => {
      setNotificationsSent(true);
      
      // In production, this would:
      // 1. Send SMS to emergency contacts
      // 2. Share live location
      // 3. Alert platform support
      // 4. Log incident
      console.log('SOS ACTIVATED - Notifications sent to:', emergencyContacts);
      
      alert('SOS Activated!\n\nEmergency contacts have been notified with your ride details and current location.');
    }, 1500);
  };

  const getRideDetailsMessage = () => {
    return `🚨 EMERGENCY ALERT 🚨\n\n` +
      `${user?.full_name} has activated SOS during a ride.\n\n` +
      `RIDE DETAILS:\n` +
      `From: ${pickupLocation}\n` +
      `To: ${dropoffLocation}\n` +
      `Driver: [Driver Name]\n` +
      `Time: ${new Date().toLocaleString()}\n\n` +
      `Please check on them immediately!`;
  };

  const shareRideDetails = () => {
    const message = getRideDetailsMessage();
    
    // Try to share via native share API
    if (navigator.share) {
      navigator.share({
        title: 'ShareWay - Emergency Alert',
        text: message
      }).catch(() => {
        // Fallback to copy to clipboard
        navigator.clipboard.writeText(message);
        alert('Ride details copied to clipboard!');
      });
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(message);
      alert('Ride details copied to clipboard!');
    }
  };

  if (!user) return null;

  return (
    <>
      {/* SOS Button */}
      <button
        onClick={() => setShowSOSModal(true)}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 animate-pulse"
        title="Emergency SOS"
      >
        <AlertTriangle className="h-8 w-8" />
      </button>

      {/* SOS Modal */}
      {showSOSModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-6 w-6 mr-3" />
                  <h2 className="text-2xl font-bold">Emergency SOS</h2>
                </div>
                <button
                  onClick={() => setShowSOSModal(false)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {!sosActivated ? (
                <>
                  {/* Warning */}
                  <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4">
                    <p className="text-yellow-900 font-semibold mb-2">
                      ⚠️ This will immediately alert your emergency contacts and support team.
                    </p>
                    <p className="text-sm text-yellow-800">
                      Use this button only in genuine emergencies during your ride.
                    </p>
                  </div>

                  {/* Emergency Contacts */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Who will be notified:</h3>
                    {emergencyContacts.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-gray-600 text-sm">
                          No emergency contacts added. Add contacts in your profile for enhanced safety.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {emergencyContacts.map((contact) => (
                          <div
                            key={contact.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center">
                              <User className="h-4 w-4 text-gray-600 mr-2" />
                              <div>
                                <div className="font-medium text-gray-900">{contact.name}</div>
                                <div className="text-sm text-gray-600">{contact.relationship}</div>
                              </div>
                            </div>
                            {contact.isPrimary && (
                              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                PRIMARY
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Current Ride Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Current Ride Details:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                        <div>
                          <div className="text-blue-900 font-medium">From: {pickupLocation}</div>
                          <div className="text-blue-900 font-medium">To: {dropoffLocation}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-blue-800">
                        <Clock className="h-4 w-4 mr-2" />
                        {new Date().toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={activateSOS}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
                    >
                      🚨 ACTIVATE SOS
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={shareRideDetails}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                      >
                        <Share2 className="h-4 w-4" />
                        Share Ride
                      </button>
                      <a
                        href="tel:911"
                        className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        Call 911
                      </a>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* SOS Activated State */}
                  <div className="text-center py-8">
                    {notificationsSent ? (
                      <div className="space-y-4">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                          <Check className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">SOS Activated</h3>
                        <p className="text-gray-600">
                          Emergency contacts have been notified with your ride details and location.
                        </p>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-sm text-green-800 font-medium">
                            ✓ {emergencyContacts.length} contact{emergencyContacts.length !== 1 ? 's' : ''} notified
                            <br />
                            ✓ Location shared
                            <br />
                            ✓ Support team alerted
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                          <AlertTriangle className="h-10 w-10 text-red-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Sending Alerts...</h3>
                        <p className="text-gray-600">Please wait while we notify your emergency contacts</p>
                      </div>
                    )}
                  </div>

                  {notificationsSent && (
                    <div className="space-y-3">
                      {primaryContact && (
                        <a
                          href={`tel:${primaryContact.phone}`}
                          className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                        >
                          <Phone className="h-4 w-4" />
                          Call {primaryContact.name}
                        </a>
                      )}
                      <a
                        href="tel:911"
                        className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        Call Emergency Services (911)
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

