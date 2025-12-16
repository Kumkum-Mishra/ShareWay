import React, { useState } from 'react';
import { Share2, MapPin, Clock, User, Check, Copy, MessageCircle } from 'lucide-react';
import { Ride, EmergencyContact } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface ShareTripProps {
  ride: Ride;
  pickupLocation: string;
  dropoffLocation: string;
  driverName: string;
}

export default function ShareTrip({ ride, pickupLocation, dropoffLocation, driverName }: ShareTripProps) {
  const { user } = useAuth();
  const [shared, setShared] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  if (!user) return null;

  const emergencyContacts = user.emergency_contacts || [];

  const getTripMessage = () => {
    return `📍 ShareWay Trip Details\n\n` +
      `Passenger: ${user.full_name}\n` +
      `Driver: ${driverName}\n\n` +
      `Pickup: ${pickupLocation}\n` +
      `Dropoff: ${dropoffLocation}\n` +
      `Time: ${new Date(ride.departure_time).toLocaleString()}\n\n` +
      `I'm sharing this ride for safety. You can track my journey.\n\n` +
      `- ShareWay Safe Travel`;
  };

  const handleShare = () => {
    const message = getTripMessage();
    
    // Try native share API
    if (navigator.share) {
      navigator.share({
        title: 'My ShareWay Trip',
        text: message
      })
      .then(() => {
        setShared(true);
        setTimeout(() => setShared(false), 3000);
      })
      .catch(() => {
        // User cancelled or not supported
      });
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(message).then(() => {
        alert('Trip details copied to clipboard! Share it with your emergency contacts.');
        setShared(true);
        setTimeout(() => setShared(false), 3000);
      });
    }
  };

  const handleCopy = () => {
    const message = getTripMessage();
    navigator.clipboard.writeText(message).then(() => {
      alert('Trip details copied to clipboard!');
    });
  };

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const sendToContacts = () => {
    if (selectedContacts.length === 0) {
      alert('Please select at least one contact');
      return;
    }

    // In production, this would send SMS/email via API
    console.log('Sending trip details to:', selectedContacts);
    alert(`Trip details will be sent to ${selectedContacts.length} contact(s).\n\nIn production, this would send SMS/email to your selected contacts.`);
    
    setShared(true);
    setTimeout(() => {
      setShared(false);
      setSelectedContacts([]);
    }, 3000);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Share2 className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <h3 className="font-bold text-gray-900">Share Trip for Safety</h3>
            <p className="text-sm text-gray-600">Let others know about your journey</p>
          </div>
        </div>
        {shared && (
          <span className="flex items-center gap-1 text-green-600 font-semibold text-sm">
            <Check className="h-4 w-4" />
            Shared!
          </span>
        )}
      </div>

      {/* Trip Summary */}
      <div className="bg-white rounded-lg p-4 mb-4 space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-emerald-600 mt-0.5" />
          <div className="flex-1">
            <div className="text-gray-600">From</div>
            <div className="font-medium text-gray-900">{pickupLocation}</div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-red-600 mt-0.5" />
          <div className="flex-1">
            <div className="text-gray-600">To</div>
            <div className="font-medium text-gray-900">{dropoffLocation}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-blue-600" />
          <span className="text-gray-600">Driver: <span className="font-medium text-gray-900">{driverName}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">{new Date(ride.departure_time).toLocaleString()}</span>
        </div>
      </div>

      {/* Emergency Contacts Selection */}
      {emergencyContacts.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Send to emergency contacts:</p>
          <div className="space-y-2">
            {emergencyContacts.map((contact) => (
              <label
                key={contact.id}
                className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedContacts.includes(contact.id)}
                  onChange={() => toggleContact(contact.id)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{contact.name}</div>
                  <div className="text-xs text-gray-600">{contact.relationship} • {contact.phone}</div>
                </div>
                {contact.isPrimary && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-bold">
                    PRIMARY
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {emergencyContacts.length > 0 && (
          <button
            onClick={sendToContacts}
            disabled={selectedContacts.length === 0}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-semibold transition-colors text-sm"
          >
            <MessageCircle className="h-4 w-4" />
            Send to Contacts
          </button>
        )}
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-semibold transition-colors text-sm"
        >
          <Share2 className="h-4 w-4" />
          Share Trip
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-2.5 rounded-lg font-semibold transition-colors text-sm"
        >
          <Copy className="h-4 w-4" />
          Copy Details
        </button>
      </div>

      {emergencyContacts.length === 0 && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            Add emergency contacts in your profile to send automatic trip notifications!
          </p>
        </div>
      )}
    </div>
  );
}

