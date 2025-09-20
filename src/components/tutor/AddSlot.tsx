import React, { useState } from "react";
import { Calendar, Clock, Plus, X } from "lucide-react";

interface TimeSlot {
  id: string;
  time: string;
}

interface SlotForm {
  date: string;
  timeSlots: TimeSlot[];
}

const AddSlot: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [newTimeSlot, setNewTimeSlot] = useState<string>("09:00");
  const [loading, setLoading] = useState<boolean>(false);

  const predefinedTimes = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
    "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"
  ];

  const generateId = (): string => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleAddSlot = (): void => {
    if (newTimeSlot) {
      const newSlot: TimeSlot = {
        id: generateId(),
        time: newTimeSlot,
      };
       
      const exists = availableSlots.some(slot => slot.time === newTimeSlot);
      if (!exists) {
        setAvailableSlots(prev => [...prev, newSlot]);
      }
    }
  };

  const handleRemoveSlot = (slotId: string): void => {
    setAvailableSlots(prev => prev.filter(slot => slot.id !== slotId));
  };

  const handleQuickAddSlot = (time: string): void => {
    const exists = availableSlots.some(slot => slot.time === time);
    if (!exists) {
      const newSlot: TimeSlot = {
        id: generateId(),
        time: time,
      };
      setAvailableSlots(prev => [...prev, newSlot]);
    }
  };

  const handleSaveSlots = async (): Promise<void> => {
    if (!selectedDate || availableSlots.length === 0) {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      console.log("Saving slots:", {
        date: selectedDate,
        slots: availableSlots
      });
      
      setSelectedDate("");
      setAvailableSlots([]);
      setLoading(false);
      
      alert("Slots added successfully!");
    }, 1000);
  };

  const getTodayDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Available Slots</h1>
          <p className="text-gray-600 mt-2">
            Create time slots for students to book sessions with you
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
            Selected Slots: <span className="font-medium">{availableSlots.length}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Calendar className="w-4 h-4 inline mr-2" />
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getTodayDate()}
              className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Clock className="w-4 h-4 inline mr-2" />
              Add Time Slots
            </label>

            <div className="flex items-center space-x-3 mb-4">
              <select
                value={newTimeSlot}
                onChange={(e) => setNewTimeSlot(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {predefinedTimes.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              <button
                onClick={handleAddSlot}
                disabled={!selectedDate}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Slot
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Quick Add:</h4>
              <div className="flex flex-wrap gap-2">
                {predefinedTimes.map(time => (
                  <button
                    key={time}
                    onClick={() => handleQuickAddSlot(time)}
                    disabled={!selectedDate || availableSlots.some(slot => slot.time === time)}
                    className="px-3 py-1 text-xs font-medium border border-gray-300 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {availableSlots.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Selected Time Slots for {selectedDate}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {availableSlots.map(slot => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <span className="text-sm font-medium text-blue-800">
                      {slot.time}
                    </span>
                    <button
                      onClick={() => handleRemoveSlot(slot.id)}
                      className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setSelectedDate("");
                setAvailableSlots([]);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSlots}
              disabled={!selectedDate || availableSlots.length === 0 || loading}
              className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Save Slots
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Instructions:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Select a date for which you want to create available time slots</li>
          <li>• Add time slots either by using the dropdown or clicking quick add buttons</li>
          <li>• You can remove any slot by clicking the X button</li>
          <li>• Click "Save Slots" to make these times available for student bookings</li>
        </ul>
      </div>
    </div>
  );
};

export default AddSlot;