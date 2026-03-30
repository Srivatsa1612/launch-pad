// pages/admin/InvitationsManagement.js
import React, { useEffect, useState } from 'react';
import { configAPI, adminAPI } from '../../services/api';
import { PlusIcon, TrashIcon, LinkIcon, CheckIcon } from '@heroicons/react/24/solid';

const InvitationsManagement = () => {
  const [invitations, setInvitations] = useState([]);
  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    notes: ''
  });
  const [copied, setCopied] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      const response = await configAPI.getAll();
      setInvitations(response.data.invitations || []);
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const generateInvitationCode = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleCreateInvitation = async (e) => {
    e.preventDefault();
    if (!form.companyName.trim()) {
      alert('Company name is required');
      return;
    }

    try {
      setLoading(true);
      const invitationCode = generateInvitationCode();
      const newInvitation = {
        id: invitationCode,
        code: invitationCode,
        companyName: form.companyName,
        contactName: form.contactName,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        notes: form.notes,
        createdAt: new Date().toISOString(),
        used: false
      };

      await adminAPI.addInvitation(newInvitation);
      setInvitations([...invitations, newInvitation]);
      setForm({
        companyName: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating invitation:', error);
      alert('Failed to create invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvitation = async (id) => {
    if (!window.confirm('Delete this invitation?')) return;
    try {
      await adminAPI.deleteInvitation(id);
      setInvitations(invitations.filter(i => i.id !== id));
    } catch (error) {
      console.error('Error deleting invitation:', error);
      alert('Failed to delete invitation');
    }
  };

  const generateInvitationUrl = (code) => {
    return `${window.location.origin}/?invite=${code}`;
  };

  const copyToClipboard = (text, inviteId) => {
    navigator.clipboard.writeText(text);
    setCopied(inviteId);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen p-8 bg-dark-950">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <a href="/admin" className="text-primary-400 hover:underline mb-4 inline-block">
            ← Back to Admin Dashboard
          </a>
          <h1 className="text-4xl font-bold mb-2">Invitations</h1>
          <p className="text-dark-300">Create pre-filled customer invitations with Revenue Operations data</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create Invitation Form */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Create Invitation</h2>
            <form onSubmit={handleCreateInvitation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Company Name *</label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="input-field"
                  placeholder="E.g., Acme Corporation"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Primary Contact Name</label>
                <input
                  type="text"
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  className="input-field"
                  placeholder="E.g., Alex Thompson"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  className="input-field"
                  placeholder="E.g., alex@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  className="input-field"
                  placeholder="E.g., (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Any special requests or context..."
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 w-full justify-center">
                <PlusIcon className="w-5 h-5" />
                {loading ? 'Creating...' : 'Create Invitation'}
              </button>
            </form>
          </div>

          {/* Invitations List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Active Invitations ({invitations.length})</h2>
            {invitations.length === 0 ? (
              <div className="card text-center py-8 text-dark-400">
                <p>No invitations created yet</p>
              </div>
            ) : (
              [...invitations].sort((a, b) => a.companyName.localeCompare(b.companyName)).map((invite) => {
                const inviteUrl = generateInvitationUrl(invite.code);
                const isUsed = invite.used;

                return (
                  <div key={invite.id} className="card">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{invite.companyName}</h3>
                          {invite.contactName && (
                            <p className="text-sm text-dark-400">{invite.contactName}</p>
                          )}
                          {invite.contactEmail && (
                            <p className="text-sm text-dark-400">{invite.contactEmail}</p>
                          )}
                        </div>
                        {isUsed && (
                          <div className="flex items-center gap-1 text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded">
                            <CheckIcon className="w-4 h-4" />
                            Used
                          </div>
                        )}
                      </div>

                      {invite.notes && (
                        <p className="text-xs text-dark-400 italic">"{invite.notes}"</p>
                      )}

                      <div className="text-xs text-dark-500">
                        Created: {formatDate(invite.createdAt)}
                      </div>

                      <div className="pt-3 space-y-2">
                        <div className="flex gap-2 items-center bg-dark-800/50 p-2 rounded text-xs">
                          <input
                            type="text"
                            value={inviteUrl}
                            readOnly
                            className="flex-1 bg-transparent text-primary-300"
                          />
                          <button
                            onClick={() => copyToClipboard(inviteUrl, invite.id)}
                            className="p-1 hover:bg-dark-700 rounded transition-colors"
                          >
                            {copied === invite.id ? (
                              <CheckIcon className="w-4 h-4 text-green-400" />
                            ) : (
                              <LinkIcon className="w-4 h-4 text-primary-400" />
                            )}
                          </button>
                        </div>

                        <button
                          onClick={() => handleDeleteInvitation(invite.id)}
                          className="w-full p-2 hover:bg-red-900/20 text-red-400 rounded text-xs font-medium transition-colors"
                        >
                          <TrashIcon className="w-4 h-4 inline mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationsManagement;
