"use client";

import { useState, useEffect } from "react";
import { FiClock } from "react-icons/fi";

interface BusinessHour {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

interface BusinessHoursFormProps {
  defaultHours?: BusinessHour[];
  isEditing?: boolean; 
}

export default function BusinessHoursForm({
  defaultHours, // editing mode will pass this prop
  isEditing,
}: BusinessHoursFormProps) {
  // Default hours template
  const getDefaultHours = (): BusinessHour[] => [
    { day: "monday", open: "09:00", close: "22:00", isClosed: false },
    { day: "tuesday", open: "09:00", close: "22:00", isClosed: false },
    { day: "wednesday", open: "09:00", close: "22:00", isClosed: false },
    { day: "thursday", open: "09:00", close: "22:00", isClosed: false },
    { day: "friday", open: "09:00", close: "22:00", isClosed: false },
    { day: "saturday", open: "09:00", close: "22:00", isClosed: false },
    { day: "sunday", open: "09:00", close: "22:00", isClosed: false },
  ];

  const [hours, setHours] = useState<BusinessHour[]>(getDefaultHours());

  // Update state when defaultHours changes (editing mode)
  useEffect(() => {
    if (defaultHours && defaultHours.length > 0) {
      setHours(defaultHours);
    }
  }, [defaultHours]);

  const updateHour = (
    index: number,  
    field: keyof BusinessHour,
    value: string | boolean
  ) => {
    const updated = [...hours];
    updated[index] = { ...updated[index], [field]: value };
    setHours(updated);
  };

  const dayNames = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <FiClock className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Business Hours{" "}
          {isEditing && (
            <span className="text-sm text-gray-500">(Current Schedule)</span>
          )}
        </h3>
      </div>

      <div className="space-y-3">
        {hours.map((hour, index) => (
          <div
            key={hour.day}
            className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
          >
            {/* Day Name */}
            <div className="w-24">
              <span className="text-sm font-medium text-gray-700">
                {dayNames[hour.day as keyof typeof dayNames]}
              </span>
            </div>

            {/* Closed Checkbox */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={hour.isClosed}
                onChange={(e) =>
                  updateHour(index, "isClosed", e.target.checked)
                }
                className="rounded border-gray-300 text-red-600 "
              />
              <span className="ml-1 text-sm text-red-600">Closed</span>
            </label>

            {/* Time Inputs */}
            {!hour.isClosed ? (
              <div className="flex items-center space-x-2 flex-1">
                <input
                  type="time"
                  value={hour.open}
                  onChange={(e) => updateHour(index, "open", e.target.value)}
                  className="p-2 border border-gray-300 rounded text-sm text-gray-700"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="time"
                  value={hour.close}
                  onChange={(e) => updateHour(index, "close", e.target.value)}
                  className="p-2 border border-gray-300 rounded text-sm text-gray-700"
                />
              </div>
            ) : (
              <div className="flex-1">
                <span className="text-red-500 text-sm">Closed all day</span>
              </div>
            )}

            {/* Hidden inputs are for SERVER COMMUNICATION */}
            {/* These invisible inputs mirror your React state */}
            <input
              type="hidden"
              name={`businessHours[${index}][day]`} // ← This "name" sends data so server can get!
              value={hour.day} // this value come from the state
            />
            <input
              type="hidden"
              name={`businessHours[${index}][open]`}
              value={hour.open}
            />
            <input
              type="hidden"
              name={`businessHours[${index}][close]`}
              value={hour.close}
            />
            <input
              type="hidden"
              name={`businessHours[${index}][isClosed]`}
              value={hour.isClosed.toString()}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
