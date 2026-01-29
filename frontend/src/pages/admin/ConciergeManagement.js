// pages/admin/ConciergeManagement.js
import React, { useEffect, useState } from 'react';
import { configAPI, adminAPI } from '../../services/api';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

const ConciergeManagement = () => {
  const [concierges, setConcierges] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', specialties: '' });

  useEffect(() => {
    loadConcierges();
  }, []);

  const loadConcierges = async () => {
    try {
      const response = await configAPI.getConcierges();
      setConcierges(response.data);
    } catch (error) {
      console.error('Error loading concierges:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        specialties: form.specialties.split(',').map(s => s.trim()).filter(Boolean)
      };

      if (editing) {
        await adminAPI.updateConcierge(editing, data);
      } else {
        await adminAPI.addConcierge(data);
      }

      setForm({ name: '', email: '', phone: '', specialties: '' });
      setEditing(null);
      loadConcierges();
    } catch (error) {
      console.error('Error saving concierge:', error);
      alert('Failed to save concierge');
    }
  };

  const handleEdit = (concierge) => {
    setForm({
      name: concierge.name,
      email: concierge.email,
      phone: concierge.phone,
      specialties: concierge.specialties?.join(', ') || ''
    });
    setEditing(concierge.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this concierge?')) return;
    try {
      await adminAPI.deleteConcierge(id);
      loadConcierges();
    } catch (error) {
      console.error('Error deleting concierge:', error);
      alert('Failed to delete concierge');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-dark-950">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <a href="/admin" className="text-primary-400 hover:underline mb-4 inline-block">
            ← Back to Admin Dashboard
          </a>
          <h1 className="text-4xl font-bold mb-2">Concierge Management</h1>
          <p className="text-dark-300">Add, edit, or remove concierge team members</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">
              {editing ? 'Edit Concierge' : 'Add New Concierge'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Specialties (comma-separated)</label>
                <input
                  type="text"
                  value={form.specialties}
                  onChange={(e) => setForm({ ...form, specialties: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Technical Support, Customer Success"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <PlusIcon className="w-5 h-5" />
                  {editing ? 'Update' : 'Add'} Concierge
                </button>
                {editing && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(null);
                      setForm({ name: '', email: '', phone: '', specialties: '' });
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
            <h2 className="text-2xl font-bold mb-6">Current Concierges ({concierges.length})</h2>
              {[...concierges].sort((a, b) => a.name.localeCompare(b.name)).map((concierge) => (
              <div key={concierge.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{concierge.name}</h3>
                    <p className="text-dark-400 text-sm mb-2">📧 {concierge.email}</p>
                    <p className="text-dark-400 text-sm mb-3">📞 {concierge.phone}</p>
                    {concierge.specialties?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {concierge.specialties.map((spec, idx) => (
                          <span key={idx} className="px-2 py-1 bg-primary-600/20 text-primary-300 rounded text-xs">
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(concierge)}
                      className="p-2 hover:bg-dark-700 rounded transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="w-5 h-5 text-primary-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(concierge.id)}
                      className="p-2 hover:bg-dark-700 rounded transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {concierges.length === 0 && (
              <p className="text-dark-400 text-center py-8">No concierges added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConciergeManagement;
