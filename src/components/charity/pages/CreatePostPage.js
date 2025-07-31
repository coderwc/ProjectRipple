import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Plus, Calendar, ChevronUp, ChevronDown, Camera } from 'lucide-react';

const CreatePostPage = ({
  selectedImage,
  setSelectedImage,
  formData = {},
  setFormData,
  addedItems = [],
  setAddedItems,
  onBack = () => {},
  onAddItems = () => {},
  onPostNeed = () => {},
  onAIRecommendation = () => {},
  onImageUpload
}) => {
  
  // Add missing state variables
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get days for current month view
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isPrevMonth: true
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        isPrevMonth: false
      });
    }
    
    // Next month's leading days
    const remainingSlots = 42 - days.length;
    for (let day = 1; day <= remainingSlots; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isPrevMonth: false
      });
    }
    
    return days;
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateClick = (dayObj) => {
    let newDate;
    
    if (!dayObj.isCurrentMonth) {
      // Handle clicking on prev/next month days
      const newMonth = new Date(currentMonth);
      if (dayObj.isPrevMonth) {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      newMonth.setDate(dayObj.day);
      setCurrentMonth(new Date(newMonth.getFullYear(), newMonth.getMonth(), 1));
      newDate = newMonth;
    } else {
      newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayObj.day);
    }
    
    // Validate date is within allowed range (today to 3 months from today)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for comparison
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
    
    if (newDate < today || newDate > maxDate) {
      return; // Don't allow selection of invalid dates
    }
    
    setFormData({...formData, deadline: formatDate(newDate)});
    setIsCalendarOpen(false);
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    
    // Limit navigation to 3 months from today
    const today = new Date();
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
    
    if (direction > 0 && newMonth > maxDate) {
      return; // Don't navigate beyond 3 months
    }
    
    if (direction < 0 && newMonth < new Date(today.getFullYear(), today.getMonth(), 1)) {
      return; // Don't navigate before current month
    }
    
    setCurrentMonth(newMonth);
  };

  const handleClear = () => {
    setFormData({...formData, deadline: ''});
    setIsCalendarOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    setFormData({...formData, deadline: formatDate(today)});
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setIsCalendarOpen(false);
  };

  const isToday = (dayObj) => {
    if (!dayObj.isCurrentMonth) return false;
    const today = new Date();
    return dayObj.day === today.getDate() && 
           currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear();
  };

  const isSelected = (dayObj) => {
    if (!formData.deadline || !dayObj.isCurrentMonth) return false;
    
    const [selectedDay, selectedMonth, selectedYear] = formData.deadline.split('/').map(Number);
    if (isNaN(selectedDay) || isNaN(selectedMonth) || isNaN(selectedYear)) return false;
    
    return dayObj.day === selectedDay && 
           (currentMonth.getMonth() + 1) === selectedMonth && 
           currentMonth.getFullYear() === selectedYear;
  };

  const isDateDisabled = (dayObj) => {
    let checkDate;
    
    if (!dayObj.isCurrentMonth) {
      const newMonth = new Date(currentMonth);
      if (dayObj.isPrevMonth) {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      newMonth.setDate(dayObj.day);
      checkDate = newMonth;
    } else {
      checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayObj.day);
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
    
    return checkDate < today || checkDate > maxDate;
  };

  // Fixed image upload handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Use the parent function if provided, otherwise handle locally
      if (onImageUpload) {
        onImageUpload(file);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => setSelectedImage(e.target.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const days = getDaysInMonth();

  return (
    <div className="max-w-sm mx-auto bg-gray-50 min-h-screen">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-white text-sm font-medium">
        <span>9:30</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 bg-black rounded-sm"></div>
          <div className="w-4 h-2 bg-black rounded-sm"></div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Create A Post</h1>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-4 py-6 pb-24">
        {/* Image Upload Section */}
        <div className="mb-6">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload}
            className="hidden" 
            id="image-upload" 
          />
          <label htmlFor="image-upload" className="cursor-pointer block">
            <div className="w-full h-48 bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-gray-400 transition-colors overflow-hidden">
              {selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt="Selected" 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <>
                  <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mb-3">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-gray-400 font-medium">Add Image</span>
                </>
              )}
            </div>
          </label>
          {selectedImage && (
            <button 
              onClick={() => setSelectedImage(null)}
              className="mt-2 text-sm text-red-500 hover:text-red-700"
            >
              Remove Image
            </button>
          )}
        </div>

        {/* Headline */}
        <div className="mb-6">
          <label className="block text-lg font-bold text-gray-900 mb-2">Headline</label>
          <input 
            type="text" 
            value={formData.headline || ''}
            onChange={(e) => setFormData({...formData, headline: e.target.value})}
            className="w-full p-4 bg-gray-100 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your headline..."
          />
        </div>

        {/* Story Description */}
        <div className="mb-6">
          <label className="block text-lg font-bold text-gray-900 mb-2">Story Description</label>
          <textarea 
            rows="6"
            value={formData.storyDescription || ''}
            onChange={(e) => setFormData({...formData, storyDescription: e.target.value})}
            className="w-full p-4 bg-gray-100 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Tell your story..."
          />
        </div>

        {/* Deadline with Calendar */}
        <div className="mb-6">
          <label className="block text-lg font-bold text-gray-900 mb-2">Deadline</label>
          <div className="relative" ref={calendarRef}>
            {/* Calendar Dropdown */}
            {isCalendarOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">
                    {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => navigateMonth(-1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronUp className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => navigateMonth(1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-1 p-2 border-b border-gray-100">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1 p-2">
                  {days.map((dayObj, index) => {
                    const disabled = isDateDisabled(dayObj);
                    return (
                      <button
                        key={index}
                        onClick={() => !disabled && handleDateClick(dayObj)}
                        disabled={disabled}
                        className={`
                          w-8 h-8 text-sm rounded flex items-center justify-center
                          ${disabled 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : dayObj.isCurrentMonth 
                              ? 'text-gray-900 hover:bg-gray-100' 
                              : 'text-gray-400 hover:bg-gray-50'
                          }
                          ${!disabled && isSelected(dayObj) ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                          ${!disabled && isToday(dayObj) && !isSelected(dayObj) ? 'bg-gray-100 font-medium' : ''}
                        `}
                      >
                        {dayObj.day}
                      </button>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center p-3 border-t border-gray-200">
                  <button
                    onClick={handleClear}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleToday}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Today
                  </button>
                </div>
              </div>
            )}

            {/* Date Input */}
            <div className="relative">
              <input 
                type="text" 
                value={formData.deadline || ''}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                placeholder="dd/mm/yyyy"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                readOnly
              />
              <button
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                type="button"
              >
                <div className="w-5 h-5 border border-gray-400 rounded flex items-center justify-center">
                  <Calendar className="w-3 h-3 text-gray-600" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Add Items Needed */}
        <div className="mb-6">
          <label className="block text-lg font-bold text-gray-900 mb-2">Add Items needed</label>
          <div className="flex flex-wrap gap-3">
            {addedItems.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-2 min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.category} • Qty: {item.quantity}</p>
                </div>
                <button 
                  onClick={() => setAddedItems(addedItems.filter(i => i.id !== item.id))}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
            <button 
              onClick={onAddItems}
              className="w-32 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
            >
              <Plus className="w-8 h-8 text-gray-400" />
            </button>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="mb-6">
          <p className="text-gray-500 mb-3">Not Sure What To Add?</p>
          <button 
            onClick={onAIRecommendation}
            className="w-full bg-gray-800 text-white py-4 rounded-lg font-bold text-lg hover:bg-gray-900 transition-colors"
          >
            AI AID RECOMMENDATION
          </button>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200 px-4 py-4">
        <button 
          onClick={onPostNeed}
          className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors"
        >
          Post Need
        </button>
      </div>
    </div>
  );
};

export default CreatePostPage;