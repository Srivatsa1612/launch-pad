// pages/admin/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { configAPI } from '../../services/api';
import { 
  UserGroupIcon, 
  ShoppingCartIcon, 
  UsersIcon, 
  ComputerDesktopIcon,
  Cog6ToothIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await configAPI.getAll();
      setConfig(response.data);
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-dark-950">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-dark-300">Manage wizard configuration and options</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Customer Pre-Setup */}
          <a href="/admin/customer-setup" className="card hover:border-primary-500 transition-all group border-primary-500/50 bg-gradient-to-br from-primary-900/20 to-dark-900">
            <div className="flex items-center justify-between mb-4">
              <DocumentTextIcon className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Customer Pre-Setup</h3>
            <p className="text-dark-400 text-sm">Enter customer details before sending invitation</p>
            <div className="mt-4 text-primary-400 text-sm group-hover:translate-x-1 transition-transform">
              Create Profile →
            </div>
          </a>

          {/* Profile Review & Approval */}
          <a href="/admin/profile-review" className="card hover:border-primary-500 transition-all group border-green-500/50 bg-gradient-to-br from-green-900/20 to-dark-900">
            <div className="flex items-center justify-between mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
              <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded-full font-semibold">
                REVIEW
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Profile Review</h3>
            <p className="text-dark-400 text-sm">Approve pre-setup profiles before sending invitations</p>
            <div className="mt-4 text-green-400 text-sm group-hover:translate-x-1 transition-transform">
              Review Queue →
            </div>
          </a>

          {/* Concierges */}
          <a href="/admin/concierges" className="card hover:border-primary-500 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <UserGroupIcon className="w-8 h-8 text-primary-400" />
              <span className="text-3xl font-bold text-primary-400">
                {config?.concierges?.length || 0}
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Concierges</h3>
            <p className="text-dark-400 text-sm">Manage team members and assignments</p>
            <div className="mt-4 text-primary-400 text-sm group-hover:translate-x-1 transition-transform">
              Manage →
            </div>
          </a>

          {/* Service Tiers */}
          <a href="/admin/service-tiers" className="card hover:border-primary-500 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <ShoppingCartIcon className="w-8 h-8 text-primary-400" />
              <span className="text-3xl font-bold text-primary-400">
                {config?.serviceTiers?.length || 0}
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Service Tiers</h3>
            <p className="text-dark-400 text-sm">Manage pricing and features</p>
            <div className="mt-4 text-primary-400 text-sm group-hover:translate-x-1 transition-transform">
              Manage →
            </div>
          </a>

          {/* HRIS Systems */}
          <a href="/admin/hris" className="card hover:border-primary-500 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <UsersIcon className="w-8 h-8 text-primary-400" />
              <span className="text-3xl font-bold text-primary-400">
                {config?.hrisSystems?.length || 0}
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-2">HRIS Systems</h3>
            <p className="text-dark-400 text-sm">Manage HR integrations</p>
            <div className="mt-4 text-primary-400 text-sm group-hover:translate-x-1 transition-transform">
              Manage →
            </div>
          </a>

          {/* Hardware Options */}
          <a href="/admin/hardware" className="card hover:border-primary-500 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <ComputerDesktopIcon className="w-8 h-8 text-primary-400" />
              <span className="text-3xl font-bold text-primary-400">
                {Array.isArray(config?.hardwareOptions) ? config.hardwareOptions.length : 0}
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Hardware Options</h3>
            <p className="text-dark-400 text-sm">Manage devices and welcome gifts</p>
            <div className="mt-4 text-primary-400 text-sm group-hover:translate-x-1 transition-transform">
              Manage →
            </div>
          </a>

          {/* Invitations */}
          <a href="/admin/invitations" className="card hover:border-primary-500 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <EnvelopeIcon className="w-8 h-8 text-primary-400" />
              <span className="text-3xl font-bold text-primary-400">
                {config?.invitations?.length || 0}
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Invitations</h3>
            <p className="text-dark-400 text-sm">Create pre-filled customer invites</p>
            <div className="mt-4 text-primary-400 text-sm group-hover:translate-x-1 transition-transform">
              Manage →
            </div>
          </a>

          {/* General Settings */}
          <a href="/admin/settings" className="card hover:border-primary-500 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <Cog6ToothIcon className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">General Settings</h3>
            <p className="text-dark-400 text-sm">Company info and preferences</p>
            <div className="mt-4 text-primary-400 text-sm group-hover:translate-x-1 transition-transform">
              Manage →
            </div>
          </a>
        </div>

        <div className="mt-8 flex gap-4">
          <a href="/" className="btn-secondary">
            ← Back to Wizard
          </a>
          <a href="/dashboard" className="btn-secondary">
            View Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
