// pages/admin/HRISManagement.js
import React, { useEffect, useState } from 'react';
import { configAPI, adminAPI } from '../../services/api';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';

const HRISManagement = () => {
  const [systems, setSystems] = useState([]);
  const [methods, setMethods] = useState([]);
  const [tab, setTab] = useState('systems');
  const [form, setForm] = useState({ name: '', apiSupported: false });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await configAPI.getAll();
      setSystems(response.data.hrisSystems || []);
      setMethods(response.data.updateMethods || []);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const handleAddSystem = async (e) => {
    e.preventDefault();
    try {
      const newSystem = {
        id: form.name.toLowerCase().replace(/\s+/g, '-'),
        name: form.name,
        apiSupported: form.apiSupported
      };
      const updatedSystems = [...systems, newSystem];
      await adminAPI.updateHRISSystems(updatedSystems);
      setSystems(updatedSystems);
      setForm({ name: '', apiSupported: false });
    } catch (error) {
      console.error('Error adding HRIS system:', error);
      alert('Failed to add HRIS system');
    }
  };

  const handleDeleteSystem = async (id) => {
    if (!window.confirm('Delete this HRIS system?')) return;
    try {
      const updatedSystems = systems.filter(s => s.id !== id);
      await adminAPI.updateHRISSystems(updatedSystems);
      setSystems(updatedSystems);
    } catch (error) {
      console.error('Error deleting HRIS system:', error);
      alert('Failed to delete HRIS system');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-dark-950">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <a href="/admin" className="text-primary-400 hover:underline mb-4 inline-block">
            ← Back to Admin Dashboard
          </a>
          <h1 className="text-4xl font-bold mb-2">HR Integration Management</h1>
          <p className="text-dark-300">Manage HRIS systems and update methods</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-dark-700">
          <button
            onClick={() => setTab('systems')}
            className={`px-4 py-2 font-medium transition-colors ${
              tab === 'systems'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-dark-400 hover:text-dark-300'
            }`}
          >
            HRIS Systems
          </button>
          <button
            onClick={() => setTab('methods')}
            className={`px-4 py-2 font-medium transition-colors ${
              tab === 'methods'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-dark-400 hover:text-dark-300'
            }`}
          >
            Update Methods
          </button>
        </div>

        {/* HRIS Systems Tab */}
        {tab === 'systems' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Add HRIS System</h2>
              <form onSubmit={handleAddSystem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">System Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Workday, BambooHR"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.apiSupported}
                      onChange={(e) => setForm({ ...form, apiSupported: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span className="text-sm font-medium">API Integration Supported</span>
                  </label>
                </div>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <PlusIcon className="w-5 h-5" />
                  Add System
                </button>
              </form>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6">Current Systems ({systems.length})</h2>
              {[...systems].sort((a, b) => a.name.localeCompare(b.name)).map((system) => (
                <div key={system.id} className="card flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{system.name}</h3>
                    <p className="text-xs text-dark-400 mt-1">
                      {system.apiSupported ? '✓ API Supported' : 'Manual only'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteSystem(system.id)}
                    className="p-2 hover:bg-dark-700 rounded"
                  >
                    <TrashIcon className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Update Methods Tab */}
        {tab === 'methods' && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Update Methods</h2>
            <p className="text-dark-400 text-sm mb-6">These are predefined and managed by the system.</p>
            <div className="space-y-4">
              {[...methods].sort((a, b) => a.name.localeCompare(b.name)).map((method) => (
                <div key={method.id} className="p-4 bg-dark-800/50 rounded-lg">
                  <h3 className="font-semibold">{method.name}</h3>
                  <p className="text-sm text-dark-400 mt-1">{method.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRISManagement;
