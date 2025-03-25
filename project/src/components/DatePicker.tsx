import React, { useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  setMonth,
  setYear,
  getDay,
  getYear,
  isBefore,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronDown } from 'lucide-react';

interface DatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date) => void;
  label: string;
  minDate?: Date | null;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onChange,
  label,
  minDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [isMonthSelectorOpen, setIsMonthSelectorOpen] = useState(false);
  const [isYearSelectorOpen, setIsYearSelectorOpen] = useState(false);

  const currentYear = getYear(currentMonth);
  const years = Array.from({ length: 50 }, (_, i) => currentYear - 25 + i);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startingDayIndex = getDay(startOfMonth(currentMonth));
  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const handleDateClick = (date: Date) => {
    if (minDate && isBefore(date, minDate)) {
      return;
    }
    onChange(date);
    setIsOpen(false);
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(setMonth(currentMonth, monthIndex));
    setIsMonthSelectorOpen(false);
  };

  const handleYearSelect = (year: number) => {
    setCurrentMonth(setYear(currentMonth, year));
    setIsYearSelectorOpen(false);
  };

  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(selectedDate);
    }
  }, [selectedDate]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
      >
        {selectedDate
          ? format(selectedDate, 'dd/MM/yyyy', { locale: es })
          : 'Seleccionar fecha'}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-72 bg-white rounded-lg shadow-lg border">
          <div className="p-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-2">
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsMonthSelectorOpen(!isMonthSelectorOpen);
                      setIsYearSelectorOpen(false);
                    }}
                    className="px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                  >
                    {format(currentMonth, 'MMMM', { locale: es })}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </button>
                  {isMonthSelectorOpen && (
                    <div className="absolute top-full left-0 mt-1 w-40 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto z-20">
                      {MONTHS.map((month, index) => (
                        <button
                          key={month}
                          onClick={() => handleMonthSelect(index)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsYearSelectorOpen(!isYearSelectorOpen);
                      setIsMonthSelectorOpen(false);
                    }}
                    className="px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                  >
                    {format(currentMonth, 'yyyy')}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </button>
                  {isYearSelectorOpen && (
                    <div className="absolute top-full left-0 mt-1 w-24 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto z-20">
                      {years.map((year) => (
                        <button
                          key={year}
                          onClick={() => handleYearSelect(year)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startingDayIndex }).map((_, index) => (
                <div key={`empty-${index}`} />
              ))}

              {daysInMonth.map((date) => {
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isCurrentMonth = isSameMonth(date, currentMonth);
                const isDisabled = minDate && isBefore(date, minDate);

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => handleDateClick(date)}
                    disabled={isDisabled}
                    className={`
                      h-9 w-9 rounded-full flex items-center justify-center text-sm
                      transition-colors duration-200
                      ${
                        isDisabled
                          ? 'text-gray-300 cursor-not-allowed'
                          : isSelected
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : isCurrentMonth
                          ? 'text-gray-900 hover:bg-gray-100'
                          : 'text-gray-400'
                      }
                    `}
                  >
                    {format(date, 'd')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};