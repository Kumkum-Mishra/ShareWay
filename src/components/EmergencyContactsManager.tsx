import React, { useState } from 'react';
import { Phone, Plus, Edit2, Trash2, Shield, AlertTriangle, Check, X } from 'lucide-react';
import { EmergencyContact } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { isValidPhone, sanitizeInput } from '../utils/security';

export default function EmergencyContactsManager() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>(user?.emergency_contacts || []);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: ''
  });

  const handleSave = () => {
    // Validate inputs
    if (!formData.name.trim() || formData.name.length < 2) {
      alert('Please enter a valid name (at least 2 characters)');
      return;
    }

    if (!isValidPhone(formData.phone)) {
      alert('Please enter a valid phone number');
      return;
    }

    if (!formData.relationship.trim()) {
      alert('Please specify the relationship');
      return;
    }

    const newContact: EmergencyContact = {
      id: editingId || `ec-${Date.now()}`,
      name: sanitizeInput(formData.name),
      phone: sanitizeInput(formData.phone),
      relationship: sanitizeInput(formData.relationship),
      isPrimary: contacts.length === 0 // First contact is primary
    };

    if (editingId) {
      setContacts(contacts.map(c => c.id === editingId ? newContact : c));
    } else {
      setContacts([...contacts, newContact]);
    }

    // Update user profile (in real app, this would be API call)
    if (user) {
      user.emergency_contacts = editingId 
        ? contacts.map(c => c.id === editingId ? newContact : c)
        : [...contacts, newContact];
    }

    setFormData({ name: '', phone: '', relationship: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (contact: EmergencyContact) => {
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship
    });
    setEditingId(contact.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this emergency contact?')) {
      const updatedContacts = contacts.filter(c => c.id !== id);
      setContacts(updatedContacts);
      
      if (user) {
        user.emergency_contacts = updatedContacts;
      }
    }
  };

  const handleSetPrimary = (id: string) => {
    const updatedContacts = contacts.map(c => ({
      ...c,
      isPrimary: c.id === id
    }));
    setContacts(updatedContacts);
    
    if (user) {
      user.emergency_contacts = updatedContacts;
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', phone: '', relationship: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Shield className="h-6 w-6 text-red-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Emergency Contacts</h2>
            <p className="text-sm text-gray-600">Manage your safety contacts for emergencies</p>
          </div>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">
            {editingId ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1234567890"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship *
              </label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Select relationship</option>
                <option value="Parent">Parent</option>
                <option value="Spouse">Spouse</option>
                <option value="Sibling">Sibling</option>
                <option value="Friend">Friend</option>
                <option value="Partner">Partner</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Check className="h-4 w-4" />
                Save Contact
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Services Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-900 mb-1">Emergency Services</h4>
            <p className="text-sm text-yellow-800 mb-2">
              In case of immediate danger, always call emergency services first:
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <a href="tel:911" className="font-bold text-yellow-900 hover:underline">
                📞 911 (Emergency)
              </a>
              <a href="tel:911" className="font-bold text-yellow-900 hover:underline">
                🚔 Police
              </a>
              <a href="tel:911" className="font-bold text-yellow-900 hover:underline">
                🚑 Ambulance
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="space-y-3">
        {contacts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No emergency contacts added</p>
            <p className="text-sm mt-1">Add contacts to enhance your safety during rides</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                contact.isPrimary
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900">{contact.name}</h4>
                    {contact.isPrimary && (
                      <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${contact.phone}`} className="hover:text-red-600 font-medium">
                        {contact.phone}
                      </a>
                    </div>
                    <span>•</span>
                    <span>{contact.relationship}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!contact.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(contact.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Set as primary"
                    >
                      <Shield className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(contact)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {contacts.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Your primary contact will be notified first when you use the SOS button during a ride.
            All contacts will receive ride details when you share your trip.
          </p>
        </div>
      )}
    </div>
  );
}

