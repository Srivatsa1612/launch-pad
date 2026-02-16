// pages/HRSetupPage.js - Step 4: HR / People Setup
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
  const [dragActive, setDragActive] = useState(false);

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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

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
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">HR / People Setup</h1>
        <p className="text-dark-300 text-lg">
          A little info here lets us prepare tailored onboarding flows.
        </p>
      </div>

      <div className="space-y-6">
        {/* HRIS System Selection */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <label className="block font-medium">HRIS / HR System in use</label>
              <p className="text-xs text-dark-400">Select the system your company uses for HR management</p>
            </div>
          </div>
          <select value={hrisSystem} onChange={(e) => setHrisSystem(e.target.value)} className="input-field">
            <option value="">Select System</option>
            {[...hrisSystems].sort((a, b) => a.name.localeCompare(b.name)).map(system => (
              <option key={system.id} value={system.name}>{system.name}</option>
            ))}
          </select>
        </div>

        {/* Update Method Selection */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <label className="block font-medium">Update Method</label>
              <p className="text-xs text-dark-400">How should we keep employee data in sync?</p>
            </div>
          </div>
          <select value={updateMethod} onChange={(e) => setUpdateMethod(e.target.value)} className="input-field">
            <option value="">Select Method</option>
            {[...updateMethods].sort((a, b) => a.name.localeCompare(b.name)).map(method => (
              <option key={method.id} value={method.name}>{method.name}</option>
            ))}
          </select>
        </div>

        {/* File Upload */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <label className="block font-medium">Upload Employee & Contractor Report</label>
              <p className="text-xs text-dark-400">CSV, XLSX, or PDF format</p>
            </div>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              dragActive
                ? 'border-primary-500 bg-primary-600/5'
                : file
                  ? 'border-green-500/50 bg-green-600/5'
                  : 'border-dark-600 hover:border-dark-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-green-400 font-medium mb-1">{file.name}</p>
                <p className="text-xs text-dark-400 mb-3">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <button
                  onClick={() => setFile(null)}
                  className="text-xs text-dark-400 hover:text-red-400 transition-colors"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <>
                <CloudArrowUpIcon className={`w-12 h-12 mx-auto mb-4 transition-colors ${
                  dragActive ? 'text-primary-400' : 'text-dark-500'
                }`} />
                <p className="text-dark-300 mb-1">Drag and drop your file here</p>
                <p className="text-xs text-dark-500 mb-4">CSV, XLSX, or PDF up to 10MB</p>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  accept=".csv,.xlsx,.xls,.pdf"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="btn-secondary inline-flex cursor-pointer text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Choose File
                </label>
              </>
            )}
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
