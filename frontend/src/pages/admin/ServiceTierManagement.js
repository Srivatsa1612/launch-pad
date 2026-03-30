// pages/admin/ServiceTierManagement.js
import React, { useEffect, useState } from 'react';
import { configAPI, adminAPI } from '../../services/api';
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

const ServiceTierManagement = () => {
  const [tiers, setTiers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ 
    name: '', 
    monthlyPrice: '', 
    features: '', 
    recommended: false 
  });

  useEffect(() => {
    loadTiers();
  }, []);

  const loadTiers = async () => {
    try {
      const response = await configAPI.getServiceTiers();
      setTiers(response.data);
    } catch (error) {
      console.error('Error loading service tiers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        monthlyPrice: parseFloat(form.monthlyPrice),
        features: form.features.split('\n').map(f => f.trim()).filter(Boolean)
      };

      if (editing) {
        await adminAPI.updateServiceTier(editing, data);
      } else {
        await adminAPI.addServiceTier(data);
      }

      setForm({ name: '', monthlyPrice: '', features: '', recommended: false });
      setEditing(null);
      loadTiers();
    } catch (error) {
      console.error('Error saving service tier:', error);
      alert('Failed to save service tier');
    }
  };

  const handleEdit = (tier) => {
    setForm({
      name: tier.name,
      monthlyPrice: tier.monthlyPrice.toString(),
      features: tier.features?.join('\n') || '',
      recommended: tier.recommended || false
    });
    setEditing(tier.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service tier?')) return;
    try {
      await adminAPI.deleteServiceTier(id);
      loadTiers();
    } catch (error) {
      console.error('Error deleting service tier:', error);
      alert('Failed to delete service tier');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-dark-950">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <a href="/admin" className="text-primary-400 hover:underline mb-4 inline-block">
            ← Back to Admin Dashboard
          </a>
          <h1 className="text-4xl font-bold mb-2">Service Tier Management</h1>
          <p className="text-dark-300">Manage pricing plans and features</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">
              {editing ? 'Edit Service Tier' : 'Add New Service Tier'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tier Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Enterprise Elite"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Monthly Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.monthlyPrice}
                  onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })}
                  className="input-field"
                  placeholder="2450.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Features (one per line)</label>
                <textarea
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  className="input-field"
                  rows="6"
                  placeholder="24/7 Concierge&#10;Priority Patching&#10;Custom Modules"
                  required
                />
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.recommended}
                    onChange={(e) => setForm({ ...form, recommended: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium">Mark as recommended tier</span>
                </label>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <PlusIcon className="w-5 h-5" />
                  {editing ? 'Update' : 'Add'} Tier
                </button>
                {editing && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(null);
                      setForm({ name: '', monthlyPrice: '', features: '', recommended: false });
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Current Tiers ({tiers.length})</h2>
            {[...tiers].sort((a, b) => a.name.localeCompare(b.name)).map((tier) => (
              <div key={tier.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{tier.name}</h3>
                      {tier.recommended && (
                        <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs flex items-center gap-1">
                          <CheckCircleIcon className="w-4 h-4" />
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-primary-400 mb-3">
                      ${tier.monthlyPrice.toLocaleString()}/mo
                    </p>
                    <ul className="space-y-1 text-sm text-dark-300">
                      {tier.features?.map((feature, idx) => (
                        <li key={idx}>✓ {feature}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(tier)}
                      className="p-2 hover:bg-dark-700 rounded transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="w-5 h-5 text-primary-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(tier.id)}
                      className="p-2 hover:bg-dark-700 rounded transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {tiers.length === 0 && (
              <p className="text-dark-400 text-center py-8">No service tiers added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceTierManagement;
