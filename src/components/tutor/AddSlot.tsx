import React, { useState, useEffect } from "react";
import { Calendar, Clock, Plus, X, IndianRupee, Eye } from "lucide-react";
import { createTutorSlots, getTutorSlots } from "../../services/tutorService";
import {
  TimeSlot,
  SlotDuration,
  SavedSlotDate,
  SlotRequest,
} from "../../interfaces/slotBookingInterface";
import { toast } from "sonner";

const AddSlot: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [newTimeSlot, setNewTimeSlot] = useState<string>("09:00 AM");
  const [selectedDuration, setSelectedDuration] = useState<SlotDuration>(
    SlotDuration.ONE_HOUR
  );
  const [halfHourPrice, setHalfHourPrice] = useState<number>(500);
  const [oneHourPrice, setOneHourPrice] = useState<number>(900);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSlots, setSavedSlots] = useState<SavedSlotDate[]>([]);
  const [loadingSavedSlots, setLoadingSavedSlots] = useState<boolean>(false);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const predefinedTimes = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
    "05:30 PM",
    "06:00 PM",
    "06:30 PM",
    "07:00 PM",
    "07:30 PM",
    "08:00 PM",
    "08:30 PM",
  ];

  useEffect(() => {
    fetchSavedSlots();
  }, []);

  const fetchSavedSlots = async (): Promise<void> => {
    setLoadingSavedSlots(true);
    try {
      const response = await getTutorSlots();
      if (response.success && response.data) {
        const today = getTodayDate();
        const filteredSlots = response.data.filter(
          (slotGroup: SavedSlotDate) => slotGroup.date >= today
        );
        setSavedSlots(filteredSlots);
      }
    } catch (err) {
      console.error("Error fetching saved slots:", err);
      toast.error("Failed to load saved slots");
    } finally {
      setLoadingSavedSlots(false);
    }
  };

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

      const exists = availableSlots.some(
        (slot) =>
          slot.time === newTimeSlot && slot.duration === selectedDuration
      );
      if (!exists) {
        setAvailableSlots((prev) => [...prev, newSlot]);
      }
    }
  };

  const handleRemoveSlot = (slotId: string): void => {
    setAvailableSlots((prev) => prev.filter((slot) => slot.id !== slotId));
  };

  const handleSaveSlots = async (): Promise<void> => {
    if (!selectedDate || availableSlots.length === 0) {
      setError("Please select a date and add at least one slot");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const slotData: SlotRequest = {
        date: selectedDate,
        halfHourPrice,
        oneHourPrice,
        slots: availableSlots.map((slot) => ({
          time: slot.time,
          duration: slot.duration,
          price: slot.price,
          availability: true,
          bookedBy: null,
        })),
      };

      const response = await createTutorSlots(slotData);

      if (response.success) {
        setSelectedDate("");
        setAvailableSlots([]);
        toast.success("Slots added successfully!");
        fetchSavedSlots();
      } else {
        setError(response.message || "Failed to add slots");
      }
    } catch (err) {
      console.error("Error saving slots:", err);
      setError("An error occurred while saving slots. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = (): string => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getDurationText = (duration: number): string => {
    return duration === 30 ? "30 min" : "1 hour";
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTotalSlots = (slotGroup: SavedSlotDate): number => {
    return slotGroup.slots.length;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Add Available Slots
          </h1>
          <p className="text-gray-600 mt-2">
            Create time slots with duration and pricing for students to book
            sessions
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
            Selected Slots:{" "}
            <span className="font-medium">{availableSlots.length}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
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
                <IndianRupee className="w-4 h-4 inline mr-2" />
                Session Pricing
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    30 Minutes
                  </label>
                  <input
                    type="number"
                    value={halfHourPrice}
                    onChange={(e) => setHalfHourPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    1 Hour
                  </label>
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
                {predefinedTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>

              <select
                value={selectedDuration}
                onChange={(e) =>
                  setSelectedDuration(Number(e.target.value) as SlotDuration)
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={SlotDuration.HALF_HOUR}>
                  30 minutes (₹{halfHourPrice})
                </option>
                <option value={SlotDuration.ONE_HOUR}>
                  1 hour (₹{oneHourPrice})
                </option>
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
                {availableSlots
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((slot) => (
                    <div
                      key={slot.id}
                      className={`flex items-center justify-between px-3 py-3 border rounded-lg ${
                        slot.duration === SlotDuration.HALF_HOUR
                          ? "bg-green-50 border-green-200"
                          : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div>
                        <span
                          className={`text-sm font-medium ${
                            slot.duration === SlotDuration.HALF_HOUR
                              ? "text-green-800"
                              : "text-blue-800"
                          }`}
                        >
                          {slot.time}
                        </span>
                        <div
                          className={`text-xs ${
                            slot.duration === SlotDuration.HALF_HOUR
                              ? "text-green-600"
                              : "text-blue-600"
                          }`}
                        >
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
                Total Slots: {availableSlots.length} • Revenue : ₹
                {availableSlots.reduce((sum, slot) => sum + slot.price, 0)}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setSelectedDate("");
                setAvailableSlots([]);
                setError(null);
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Saved Slots
            </h2>
            <button
              onClick={fetchSavedSlots}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Refresh
            </button>
          </div>

          {loadingSavedSlots ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : savedSlots.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg">No slots added yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Create your first time slot above to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedSlots.map((slotGroup) => (
                <div
                  key={slotGroup._id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedDate(
                        expandedDate === slotGroup.date ? null : slotGroup.date
                      )
                    }
                    className="w-full px-4 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">
                          {formatDate(slotGroup.date)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getTotalSlots(slotGroup)} slots
                        </p>
                      </div>
                    </div>
                    <div
                      className={`transform transition-transform ${
                        expandedDate === slotGroup.date ? "rotate-180" : ""
                      }`}
                    >
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </div>
                  </button>

                  {expandedDate === slotGroup.date && (
                    <div className="border-t border-gray-200 p-4 bg-white">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {slotGroup.slots
                          .sort((a, b) => a.time.localeCompare(b.time))
                          .map((slot) => (
                            <div
                              key={slot._id}
                              className={`p-3 rounded-lg border ${
                                slot.availability
                                  ? slot.duration === 30
                                    ? "bg-green-50 border-green-200"
                                    : "bg-blue-50 border-blue-200"
                                  : "bg-gray-50 border-gray-300"
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p
                                    className={`font-medium ${
                                      slot.availability
                                        ? slot.duration === 30
                                          ? "text-green-800"
                                          : "text-blue-800"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {slot.time}
                                  </p>
                                  <p
                                    className={`text-xs mt-1 ${
                                      slot.availability
                                        ? slot.duration === 30
                                          ? "text-green-600"
                                          : "text-blue-600"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {getDurationText(slot.duration)} • ₹
                                    {slot.price}
                                  </p>
                                  <p
                                    className={`text-xs mt-1 font-medium ${
                                      slot.availability
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {slot.availability
                                      ? "Available"
                                      : `Booked by ${slot.bookedBy}`}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Instructions:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Set your base pricing for 30-minute and 1-hour sessions</li>
          <li>• Select a date and add time slots with preferred duration</li>
          <li>
            • Use quick add buttons: Green for 30-min slots, Blue for 1-hour
            slots
          </li>
          <li>• Price is automatically calculated based on session duration</li>
          <li>
            • Click "Save Slots" to make these times available for student
            bookings
          </li>
          <li>
            • View all saved slots below and expand to see details for each date
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AddSlot;
