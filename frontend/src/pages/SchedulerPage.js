// pages/SchedulerPage.js - Step 3: Schedule Kickoff Call
import React, { useState } from 'react';
import { useWizard } from '../context/WizardContext';
import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon } from '@heroicons/react/24/solid';

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
];

const SchedulerPage = () => {
  const { nextStep, previousStep } = useWizard();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Generate next 14 business days
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    let current = new Date(today);
    current.setDate(current.getDate() + 1); // Start from tomorrow

    while (dates.length < 14) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) { // Skip weekends
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  const formatDateValue = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleContinue = () => {
    // Scheduler is optional — customer can schedule now or have it ready by kickoff
    nextStep();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Schedule Your Kickoff Call</h1>
        <p className="text-dark-300 text-lg">
          Select a date and time for your kickoff call with our project management team. You can also skip this and schedule later.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Date Selection */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-primary-400" />
              Select a Date
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {availableDates.map((date) => {
                const dateStr = formatDateValue(date);
                const isSelected = selectedDate === dateStr;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      isSelected
                        ? 'bg-primary-600 border-primary-500 text-white'
                        : 'border-dark-700 hover:border-primary-500/50 hover:bg-dark-800'
                    }`}
                  >
                    <p className={`text-xs ${isSelected ? 'text-primary-200' : 'text-dark-400'}`}>
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="text-lg font-semibold">
                      {date.toLocaleDateString('en-US', { day: 'numeric' })}
                    </p>
                    <p className={`text-xs ${isSelected ? 'text-primary-200' : 'text-dark-400'}`}>
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div className="card mt-6 animate-fade-in">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Select a Time
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {timeSlots.map((time) => {
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        isSelected
                          ? 'bg-primary-600 border-primary-500 text-white'
                          : 'border-dark-700 hover:border-primary-500/50 hover:bg-dark-800'
                      }`}
                    >
                      <p className="font-medium">{time}</p>
                    </button>
                  );
                })}
              </div>

              {/* Timezone */}
              <div className="mt-4">
                <label className="block text-xs text-dark-400 mb-1.5 font-medium">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="input-field"
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="America/Anchorage">Alaska Time (AKT)</option>
                  <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                  <option value="Europe/London">GMT / UTC</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-32">
            <h3 className="text-lg font-semibold mb-4">Kickoff Call Details</h3>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-dark-400 mb-1">Meeting Type</p>
                <p className="font-medium">mBRANE PROOF Kickoff</p>
              </div>

              <div>
                <p className="text-dark-400 mb-1">Duration</p>
                <p className="font-medium">60 minutes</p>
              </div>

              <div>
                <p className="text-dark-400 mb-1">With</p>
                <p className="font-medium">M-Theory Project Management Team</p>
              </div>

              {selectedDate && (
                <div className="border-t border-dark-700 pt-4">
                  <p className="text-dark-400 mb-1">Selected Date</p>
                  <p className="font-medium text-primary-400">
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}

              {selectedTime && (
                <div>
                  <p className="text-dark-400 mb-1">Selected Time</p>
                  <p className="font-medium text-primary-400">{selectedTime}</p>
                </div>
              )}
            </div>

            {!selectedDate && (
              <div className="mt-6 p-3 bg-dark-800 rounded-lg">
                <p className="text-xs text-dark-400">
                  Select a date and time above, or skip to schedule later during your kickoff call setup.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-between">
        <button onClick={previousStep} className="btn-secondary">
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>

        <div className="flex gap-4">
          {!selectedDate && (
            <button
              onClick={handleContinue}
              className="btn-secondary"
            >
              Skip for Now
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleContinue}
            className="btn-primary"
          >
            {selectedDate && selectedTime ? 'Confirm & Continue' : 'Continue'}
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchedulerPage;
