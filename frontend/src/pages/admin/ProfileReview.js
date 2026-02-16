// pages/admin/ProfileReview.js
import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  EyeIcon,
  PencilIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/solid';

const ProfileReview = () => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [auditHistory, setAuditHistory] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState(null); // 'approve' or 'reject'
  const [reviewNotes, setReviewNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('pending_review');

  useEffect(() => {
    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStagingProfiles(filter);
      setProfiles(response.data || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditHistory = async (profileCode) => {
    try {
      const response = await adminAPI.getProfileAuditHistory(profileCode);
      setAuditHistory(response.data || []);
    } catch (error) {
      console.error('Error loading audit history:', error);
    }
  };

  const handleViewProfile = (profile) => {
    setSelectedProfile(profile);
    loadAuditHistory(profile.profile_code);
  };

  const handleReviewClick = (action) => {
    setReviewAction(action);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedProfile) return;
    
    const reviewer = 'admin@m-theorygrp.com'; // TODO: Get from auth context
    
    try {
      setLoading(true);
      
      if (reviewAction === 'approve') {
        await adminAPI.approveProfile(selectedProfile.profile_code, {
          approvedBy: reviewer,
          reviewNotes
        });
        alert('Profile approved and moved to production!');
      } else if (reviewAction === 'reject') {
        await adminAPI.rejectProfile(selectedProfile.profile_code, {
          rejectedBy: reviewer,
          reviewNotes
        });
        alert('Profile rejected. Admin will be notified.');
      }
      
      setShowReviewModal(false);
      setReviewNotes('');
      setSelectedProfile(null);
      loadProfiles();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (profileCode) => {
    if (!window.confirm('Archive this profile? It will be removed from active invitations but data will be retained.')) {
      return;
    }
    
    const reason = prompt('Reason for archiving (optional):');
    
    try {
      await adminAPI.archiveProfile(profileCode, {
        archivedBy: 'admin@m-theorygrp.com',
        reason
      });
      alert('Profile archived');
      loadProfiles();
    } catch (error) {
      console.error('Error archiving profile:', error);
      alert('Failed to archive profile');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-gray-600',
      pending_review: 'bg-yellow-600',
      approved: 'bg-green-600',
      rejected: 'bg-red-600',
      completed: 'bg-blue-600'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded ${badges[status] || 'bg-gray-600'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateCompleteness = (profile) => {
    const fields = [
      profile.company_name,
      profile.contact_email,
      profile.billing_email || profile.tech_email,
      profile.service_tier,
      profile.hris_system,
      profile.device_choice
    ];
    
    const filled = fields.filter(f => f && f.trim()).length;
    return Math.round((filled / fields.length) * 100);
  };

  return (
    <div className="min-h-screen p-8 bg-dark-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/admin" className="text-primary-400 hover:underline mb-4 inline-block">
            ← Back to Admin Dashboard
          </a>
          <h1 className="text-4xl font-bold mb-2">Profile Review & Approval</h1>
          <p className="text-dark-300">Review and approve customer pre-setup profiles before sending invitations</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          {['pending_review', 'draft', 'approved', 'rejected', 'all'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded font-medium ${
                filter === f 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
              }`}
            >
              {f.replace('_', ' ').toUpperCase()}
              {f === 'pending_review' && profiles.length > 0 && (
                <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                  {profiles.filter(p => p.status === 'pending_review').length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold mb-4">
              {filter === 'all' ? 'All Profiles' : `${filter.replace('_', ' ')} Profiles`}
            </h2>
            
            {loading ? (
              <div className="card text-center py-12">
                <ClockIcon className="h-12 w-12 mx-auto mb-4 text-primary-400 animate-spin" />
                <p>Loading profiles...</p>
              </div>
            ) : profiles.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-dark-400">No profiles found</p>
              </div>
            ) : (
              profiles.map(profile => (
                <div 
                  key={profile.staging_id} 
                  className={`card cursor-pointer hover:border-primary-500 transition-colors ${
                    selectedProfile?.staging_id === profile.staging_id ? 'border-primary-500' : ''
                  }`}
                  onClick={() => handleViewProfile(profile)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold">{profile.company_name}</h3>
                      <p className="text-dark-400 text-sm">Code: {profile.profile_code}</p>
                    </div>
                    {getStatusBadge(profile.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-dark-400">Contact:</span> {profile.contact_name || 'N/A'}
                    </div>
                    <div>
                      <span className="text-dark-400">Email:</span> {profile.contact_email || 'N/A'}
                    </div>
                    <div>
                      <span className="text-dark-400">Service:</span> {profile.service_tier || 'N/A'}
                    </div>
                    <div>
                      <span className="text-dark-400">Submitted:</span> {formatDate(profile.submitted_at)}
                    </div>
                  </div>
                  
                  {/* Completeness bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-dark-400 mb-1">
                      <span>Completeness</span>
                      <span>{calculateCompleteness(profile)}%</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full" 
                        style={{ width: `${calculateCompleteness(profile)}%` }}
                      />
                    </div>
                  </div>
                  
                  {profile.status === 'pending_review' && (
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProfile(profile);
                          handleReviewClick('approve');
                        }}
                        className="flex-1 btn-primary text-sm py-2"
                      >
                        <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                        Approve
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProfile(profile);
                          handleReviewClick('reject');
                        }}
                        className="flex-1 btn-secondary text-sm py-2"
                      >
                        <XCircleIcon className="h-4 w-4 inline mr-1" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Profile Detail Panel */}
          <div className="lg:col-span-1">
            {selectedProfile ? (
              <div className="card sticky top-8">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">Profile Details</h2>
                  {getStatusBadge(selectedProfile.status)}
                </div>
                
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                  {/* Company Info */}
                  <div>
                    <h3 className="font-bold text-primary-400 mb-2">Company Information</h3>
                    <div className="space-y-1 text-sm">
                      <div><span className="text-dark-400">Name:</span> {selectedProfile.company_name}</div>
                      <div><span className="text-dark-400">Contact:</span> {selectedProfile.contact_name || 'N/A'}</div>
                      <div><span className="text-dark-400">Email:</span> {selectedProfile.contact_email || 'N/A'}</div>
                      <div><span className="text-dark-400">Phone:</span> {selectedProfile.contact_phone || 'N/A'}</div>
                    </div>
                  </div>
                  
                  {/* Key Contacts */}
                  {(selectedProfile.billing_email || selectedProfile.tech_email || selectedProfile.emergency_email) && (
                    <div>
                      <h3 className="font-bold text-primary-400 mb-2">Key Contacts</h3>
                      <div className="space-y-2 text-sm">
                        {selectedProfile.billing_email && (
                          <div className="p-2 bg-dark-800 rounded">
                            <div className="font-semibold">Billing</div>
                            <div>{selectedProfile.billing_name}</div>
                            <div className="text-dark-400">{selectedProfile.billing_email}</div>
                          </div>
                        )}
                        {selectedProfile.tech_email && (
                          <div className="p-2 bg-dark-800 rounded">
                            <div className="font-semibold">Technical</div>
                            <div>{selectedProfile.tech_name}</div>
                            <div className="text-dark-400">{selectedProfile.tech_email}</div>
                          </div>
                        )}
                        {selectedProfile.emergency_email && (
                          <div className="p-2 bg-dark-800 rounded">
                            <div className="font-semibold">Emergency</div>
                            <div>{selectedProfile.emergency_name}</div>
                            <div className="text-dark-400">{selectedProfile.emergency_email}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Service Order */}
                  {selectedProfile.service_tier && (
                    <div>
                      <h3 className="font-bold text-primary-400 mb-2">Service Order</h3>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-dark-400">Tier:</span> {selectedProfile.service_tier}</div>
                        {selectedProfile.start_date && <div><span className="text-dark-400">Start Date:</span> {formatDate(selectedProfile.start_date)}</div>}
                        {selectedProfile.contract_term && <div><span className="text-dark-400">Term:</span> {selectedProfile.contract_term} months</div>}
                      </div>
                    </div>
                  )}
                  
                  {/* HR Setup */}
                  {selectedProfile.hris_system && (
                    <div>
                      <h3 className="font-bold text-primary-400 mb-2">HR Setup</h3>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-dark-400">System:</span> {selectedProfile.hris_system}</div>
                        {selectedProfile.update_method && <div><span className="text-dark-400">Update Method:</span> {selectedProfile.update_method}</div>}
                      </div>
                    </div>
                  )}
                  
                  {/* Hardware */}
                  {(selectedProfile.device_choice || selectedProfile.gift_choice) && (
                    <div>
                      <h3 className="font-bold text-primary-400 mb-2">Hardware Preferences</h3>
                      <div className="space-y-1 text-sm">
                        {selectedProfile.device_choice && <div><span className="text-dark-400">Device:</span> {selectedProfile.device_choice}</div>}
                        {selectedProfile.gift_choice && <div><span className="text-dark-400">Gift:</span> {selectedProfile.gift_choice}</div>}
                      </div>
                    </div>
                  )}
                  
                  {/* Notes */}
                  {selectedProfile.notes && (
                    <div>
                      <h3 className="font-bold text-primary-400 mb-2">Notes</h3>
                      <p className="text-sm text-dark-300">{selectedProfile.notes}</p>
                    </div>
                  )}
                  
                  {selectedProfile.admin_notes && (
                    <div>
                      <h3 className="font-bold text-red-400 mb-2">Internal Notes (Admin Only)</h3>
                      <p className="text-sm text-dark-300">{selectedProfile.admin_notes}</p>
                    </div>
                  )}
                  
                  {/* Review Info */}
                  {selectedProfile.review_notes && (
                    <div>
                      <h3 className="font-bold text-primary-400 mb-2">Review Notes</h3>
                      <p className="text-sm text-dark-300">{selectedProfile.review_notes}</p>
                      <div className="text-xs text-dark-400 mt-1">
                        By {selectedProfile.reviewed_by} on {formatDate(selectedProfile.reviewed_at)}
                      </div>
                    </div>
                  )}
                  
                  {/* Audit History */}
                  {auditHistory.length > 0 && (
                    <div>
                      <h3 className="font-bold text-primary-400 mb-2">Audit History</h3>
                      <div className="space-y-2">
                        {auditHistory.map(entry => (
                          <div key={entry.audit_id} className="text-xs p-2 bg-dark-800 rounded">
                            <div className="font-semibold">{entry.action.toUpperCase()}</div>
                            <div className="text-dark-400">{entry.performed_by}</div>
                            <div className="text-dark-500">{formatDate(entry.performed_at)}</div>
                            {entry.notes && <div className="mt-1">{entry.notes}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-dark-700 flex gap-2">
                  {selectedProfile.status === 'draft' && (
                    <button className="flex-1 btn-secondary text-sm">
                      <PencilIcon className="h-4 w-4 inline mr-1" />
                      Edit
                    </button>
                  )}
                  <button 
                    onClick={() => handleArchive(selectedProfile.profile_code)}
                    className="flex-1 btn-secondary text-sm"
                  >
                    <ArchiveBoxIcon className="h-4 w-4 inline mr-1" />
                    Archive
                  </button>
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <EyeIcon className="h-12 w-12 mx-auto mb-4 text-dark-600" />
                <p className="text-dark-400">Select a profile to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-dark-900 border border-dark-700 rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {reviewAction === 'approve' ? 'Approve Profile' : 'Reject Profile'}
            </h2>
            <p className="text-dark-300 mb-4">
              {reviewAction === 'approve' 
                ? 'This will move the profile to production and enable the invitation link for the customer.'
                : 'This will reject the profile and notify the admin to make corrections.'}
            </p>
            
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="input-field w-full h-32 mb-4"
              placeholder="Review notes (optional)"
            />
            
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewNotes('');
                }}
                className="flex-1 btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitReview}
                className={`flex-1 ${reviewAction === 'approve' ? 'btn-primary' : 'bg-red-600 hover:bg-red-700'} text-white px-4 py-2 rounded font-medium`}
                disabled={loading}
              >
                {loading ? 'Processing...' : (reviewAction === 'approve' ? 'Approve' : 'Reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileReview;
