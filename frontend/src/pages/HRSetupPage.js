// pages/HRSetupPage.js - Placeholder for Step 4
import React, { useState, useEffect } from 'react';
import { useWizard } from '../context/WizardContext';
import { hrSetupAPI, configAPI } from '../services/api';
import { ArrowLeftIcon, ArrowRightIcon, CloudArrowUpIcon } from '@heroicons/react/24/solid';

const HRSetupPage = () => {
  const { sessionId, nextStep, previousStep } = useWizard();
  const [loading, setLoading] = useState(false);
  const [hrisSystem, setHrisSystem] = useState('');
  const [updateMethod, setUpdateMethod] = useState('');
  const [file, setFile] = useState(null);
  const [hrisSystems, setHrisSystems] = useState([]);
  const [updateMethods, setUpdateMethods] = useState([]);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await configAPI.getAll();
        setHrisSystems(response.data.hrisSystems || []);
        setUpdateMethods(response.data.updateMethods || []);
      } catch (error) {
        console.error('Error loading HR config:', error);
      }
    };
    loadConfig();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      let filePath = null;
      if (file) {
        const uploadResponse = await hrSetupAPI.uploadFile(sessionId, file);
        filePath = uploadResponse.data.filePath;
      }

      await hrSetupAPI.save(sessionId, {
        hrisSystem,
        updateMethod,
        employeeFilePath: filePath
      });
      
      nextStep();
    } catch (error) {
      console.error('Error saving HR setup:', error);
      alert('Failed to save HR setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">HR / People Setup</h1>
      <p className="text-dark-300 text-lg mb-12">
        A little info here lets us prepare tailored onboarding flows.
      </p>

      <div className="space-y-6">
        <div className="card">
          <label className="block text-sm font-medium mb-3">HRIS / HR System in use</label>
          <select value={hrisSystem} onChange={(e) => setHrisSystem(e.target.value)} className="input-field">
            <option value="">Select System</option>
            {[...hrisSystems].sort((a, b) => a.name.localeCompare(b.name)).map(system => (
              <option key={system.id} value={system.name}>{system.name}</option>
            ))}
          </select>
        </div>

        <div className="card">
          <label className="block text-sm font-medium mb-3">Update Method</label>
          <select value={updateMethod} onChange={(e) => setUpdateMethod(e.target.value)} className="input-field">
            <option value="">Select Method</option>
            {[...updateMethods].sort((a, b) => a.name.localeCompare(b.name)).map(method => (
              <option key={method.id} value={method.name}>{method.name}</option>
            ))}
          </select>
        </div>

        <div className="card">
          <label className="block text-sm font-medium mb-3">Upload Employee & Contractor Report</label>
          <div className="border-2 border-dashed border-dark-600 rounded-lg p-8 text-center">
            <CloudArrowUpIcon className="w-12 h-12 mx-auto text-dark-500 mb-4" />
            <p className="text-dark-300 mb-4">Drag and drop CSV, XLSX, or PDF here</p>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              accept=".csv,.xlsx,.xls,.pdf"
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="btn-primary inline-flex cursor-pointer">
              Choose File
            </label>
            {file && <p className="mt-4 text-sm text-primary-400">{file.name}</p>}
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-between">
        <button onClick={previousStep} className="btn-secondary">
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>
        <button onClick={handleSave} disabled={!hrisSystem || !updateMethod || loading} className="btn-primary">
          {loading ? 'Saving...' : 'Uploaded & ready — continue'}
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default HRSetupPage;
