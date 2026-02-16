// pages/admin/HardwareManagement.js
import React, { useEffect, useState } from 'react';
import { configAPI, adminAPI } from '../../services/api';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';

const HardwareManagement = () => {
  const [hardware, setHardware] = useState([]);
  const [tab, setTab] = useState('devices');
  const [form, setForm] = useState({ name: '', description: '', value: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await configAPI.getAll();
      const options = Array.isArray(response.data.hardwareOptions) 
        ? response.data.hardwareOptions 
        : [];
      setHardware(options);
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    try {
      const newDevice = {
        id: form.name.toLowerCase().replace(/\s+/g, '-'),
        name: form.name,
        description: form.description,
        option_type: 'device',
        estimated_value: 0
      };
      const updated = [...hardware, newDevice];
      await adminAPI.updateHardwareOptions(updated);
      setHardware(updated);
      setForm({ name: '', description: '', value: 0 });
    } catch (error) {
      console.error('Error adding device:', error);
      alert('Failed to add device option');
    }
  };

  const handleAddGift = async (e) => {
    e.preventDefault();
    try {
      const newGift = {
        id: form.name.toLowerCase().replace(/\s+/g, '-'),
        name: form.name,
        description: form.description,
        value: parseFloat(form.value) || 0,
        option_type: 'gift',
        estimated_value: parseFloat(form.value) || 0
      };
      const updated = [...hardware, newGift];
      await adminAPI.updateHardwareOptions(updated);
      setHardware(updated);
      setForm({ name: '', description: '', value: 0 });
    } catch (error) {
      console.error('Error adding gift:', error);
      alert('Failed to add welcome gift');
    }
  };

  const handleDeleteDevice = async (id) => {
    if (!window.confirm('Delete this device option?')) return;
    try {
      const updated = hardware.filter(h => h.id !== id);
      await adminAPI.updateHardwareOptions(updated);
      setHardware(updated);
    } catch (error) {
      console.error('Error deleting device:', error);
      alert('Failed to delete device option');
    }
  };

  const handleDeleteGift = async (id) => {
    if (!window.confirm('Delete this welcome gift?')) return;
    try {
      const updated = hardware.filter(h => h.id !== id);
      await adminAPI.updateHardwareOptions(updated);
      setHardware(updated);
    } catch (error) {
      console.error('Error deleting gift:', error);
      alert('Failed to delete welcome gift');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-dark-950">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <a href="/admin" className="text-primary-400 hover:underline mb-4 inline-block">
            ← Back to Admin Dashboard
          </a>
          <h1 className="text-4xl font-bold mb-2">Hardware Management</h1>
          <p className="text-dark-300">Manage device and welcome gift options</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-dark-700">
              <button
                onClick={() => setTab('devices')}
                className={`px-4 py-2 font-medium transition-colors ${
                  tab === 'devices'
                    ? 'text-primary-400 border-b-2 border-primary-400'
                    : 'text-dark-400 hover:text-dark-300'
                }`}
              >
                Device Procurement
              </button>
              <button
                onClick={() => setTab('gifts')}
                className={`px-4 py-2 font-medium transition-colors ${
                  tab === 'gifts'
                    ? 'text-primary-400 border-b-2 border-primary-400'
                    : 'text-dark-400 hover:text-dark-300'
                }`}
              >
                Welcome Gifts
              </button>
            </div>

        {/* Device Procurement Tab */}
        {tab === 'devices' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Add Device Option</h2>
              <form onSubmit={handleAddDevice} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Option Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Standard"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder="Describe this device option"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <PlusIcon className="w-5 h-5" />
                  Add Device Option
                </button>
              </form>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6">Current Options ({hardware.filter(h => h.option_type === 'device').length})</h2>
              {hardware.filter(h => h.option_type === 'device').length === 0 ? (
                <div className="card text-center py-8 text-dark-400">
                  No devices added yet. Create one above to get started.
                </div>
              ) : (
                [...hardware.filter(h => h.option_type === 'device')].sort((a, b) => a.name.localeCompare(b.name)).map((device) => (
                  <div key={device.id} className="card">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{device.name}</h3>
                        <p className="text-sm text-dark-400 mt-2">{device.description}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteDevice(device.id)}
                        className="p-2 hover:bg-dark-700 rounded"
                      >
                        <TrashIcon className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Welcome Gifts Tab */}
        {tab === 'gifts' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Add Welcome Gift</h2>
              <form onSubmit={handleAddGift} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Gift Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Premium Bundle"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder="Describe this welcome gift"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Estimated Value ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    className="input-field"
                    placeholder="150.00"
                  />
                </div>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <PlusIcon className="w-5 h-5" />
                  Add Welcome Gift
                </button>
              </form>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6">Current Options ({hardware.filter(h => h.option_type === 'gift').length})</h2>
              {hardware.filter(h => h.option_type === 'gift').length === 0 ? (
                <div className="card text-center py-8 text-dark-400">
                  No gifts added yet. Create one above to get started.
                </div>
              ) : (
                [...hardware.filter(h => h.option_type === 'gift')].sort((a, b) => a.name.localeCompare(b.name)).map((gift) => (
                  <div key={gift.id} className="card">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{gift.name}</h3>
                        <p className="text-sm text-dark-400 mt-2">{gift.description}</p>
                        <p className="text-xs text-primary-400 mt-2">Value: ${gift.estimated_value || gift.value}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteGift(gift.id)}
                        className="p-2 hover:bg-dark-700 rounded"
                      >
                        <TrashIcon className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default HardwareManagement;
