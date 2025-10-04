import React, { useState } from "react";
import { Calendar, Clock, Plus, X, IndianRupee  } from "lucide-react";

enum SlotDuration {
  HALF_HOUR = 30,
  ONE_HOUR = 60,
}

interface TimeSlot {
  id: string;
  time: string;
  duration: SlotDuration;
  price: number;
}

const AddSlot: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [newTimeSlot, setNewTimeSlot] = useState<string>("09:00 AM");
  const [selectedDuration, setSelectedDuration] = useState<SlotDuration>(SlotDuration.ONE_HOUR);
  const [halfHourPrice, setHalfHourPrice] = useState<number>(500);
  const [oneHourPrice, setOneHourPrice] = useState<number>(900);
  const [loading, setLoading] = useState<boolean>(false);

  const predefinedTimes = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", 
    "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
    "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM"
  ];

  const generateId = (): string => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const getPrice = (duration: SlotDuration): number => {
    return duration === SlotDuration.HALF_HOUR ? halfHourPrice : oneHourPrice;
  };

  const handleAddSlot = (): void => {
    if (newTimeSlot) {
      const newSlot: TimeSlot = {
        id: generateId(),
        time: newTimeSlot,
        duration: selectedDuration,
        price: getPrice(selectedDuration),
      };
       
      const exists = availableSlots.some(slot => 
        slot.time === newTimeSlot && slot.duration === selectedDuration
      );
      if (!exists) {
        setAvailableSlots(prev => [...prev, newSlot]);
      }
    }
  };

  const handleRemoveSlot = (slotId: string): void => {
    setAvailableSlots(prev => prev.filter(slot => slot.id !== slotId));
  };


  const handleSaveSlots = async (): Promise<void> => {
    if (!selectedDate || availableSlots.length === 0) {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      console.log("Saving slots:", {
        date: selectedDate,
        halfHourPrice,
        oneHourPrice,
        slots: availableSlots.map(slot => ({
          time: slot.time,
          duration: slot.duration,
          price: slot.price,
          availability: true,
          bookedBy: null
        }))
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

  const getDurationText = (duration: SlotDuration): string => {
    return duration === SlotDuration.HALF_HOUR ? "30 min" : "1 hour";
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Available Slots</h1>
          <p className="text-gray-600 mt-2">
            Create time slots with duration and pricing for students to book sessions
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Calendar className="w-4 h-4 inline mr-2" />
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getTodayDate()}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <IndianRupee  className="w-4 h-4 inline mr-2" />
                Session Pricing
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">30 Minutes</label>
                  <input
                    type="number"
                    value={halfHourPrice}
                    onChange={(e) => setHalfHourPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">1 Hour</label>
                  <input
                    type="number"
                    value={oneHourPrice}
                    onChange={(e) => setOneHourPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Clock className="w-4 h-4 inline mr-2" />
              Add Time Slots
            </label>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <select
                value={newTimeSlot}
                onChange={(e) => setNewTimeSlot(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {predefinedTimes.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(Number(e.target.value) as SlotDuration)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={SlotDuration.HALF_HOUR}>30 minutes (₹{halfHourPrice})</option>
                <option value={SlotDuration.ONE_HOUR}>1 hour (₹{oneHourPrice})</option>
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

            
          </div>

          {availableSlots.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Selected Time Slots for {selectedDate}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableSlots.sort((a, b) => a.time.localeCompare(b.time)).map(slot => (
                  <div
                    key={slot.id}
                    className={`flex items-center justify-between px-3 py-3 border rounded-lg ${
                      slot.duration === SlotDuration.HALF_HOUR 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div>
                      <span className={`text-sm font-medium ${
                        slot.duration === SlotDuration.HALF_HOUR ? 'text-green-800' : 'text-blue-800'
                      }`}>
                        {slot.time}
                      </span>
                      <div className={`text-xs ${
                        slot.duration === SlotDuration.HALF_HOUR ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {getDurationText(slot.duration)} • ₹{slot.price}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSlot(slot.id)}
                      className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                Total Slots: {availableSlots.length} • 
                Revenue Potential: ₹{availableSlots.reduce((sum, slot) => sum + slot.price, 0)}
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
          <li>• Set your base pricing for 30-minute and 1-hour sessions</li>
          <li>• Select a date and add time slots with preferred duration</li>
          <li>• Use quick add buttons: Green for 30-min slots, Blue for 1-hour slots</li>
          <li>• Price is automatically calculated based on session duration</li>
          <li>• Click "Save Slots" to make these times available for student bookings</li>
        </ul>
      </div>
    </div>
  );
};

export default AddSlot;