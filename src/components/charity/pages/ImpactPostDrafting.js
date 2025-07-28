import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, MapPin, ChevronDown } from 'lucide-react';

const ImapctPostDrafting = ({ onBack = () => {}, onShare = () => {} }) => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [caption, setCaption] = useState('');
  const [selectedDrive, setSelectedDrive] = useState('');
  const [location, setLocation] = useState('');
  const [showDriveDropdown, setShowDriveDropdown] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Mock ongoing drives data
  const ongoingDrives = [
    'Clean Water Initiative',
    'Education for All',
    'Food Security Program',
    'Healthcare Access',
    'Environmental Conservation',
    'Youth Empowerment'
  ];

  // Mock location suggestions
  const locationSuggestions = [
    'Singapore',
    'SUTD Singapore University of Technology and Design',
    'Bedok New Town',
    'Marina Bay Sands',
    'Gardens by the Bay'
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    imageFiles.forEach(file => {
      if (uploadedImages.length < 10) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedImages(prev => [...prev, {
            id: Date.now() + Math.random(),
            url: e.target.result,
            file: file
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const nextImage = () => {
    if (currentImageIndex < uploadedImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  const removeImage = (imageId) => {
    const imageIndex = uploadedImages.findIndex(img => img.id === imageId);
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    
    // Adjust current index if needed
    if (imageIndex <= currentImageIndex && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else if (uploadedImages.length === 1) {
      setCurrentImageIndex(0);
    }
  };

  const handleLocationInput = (value) => {
    setLocation(value);
    setShowLocationSuggestions(value.length > 0);
  };

  const selectLocation = (selectedLoc) => {
    setLocation(selectedLoc);
    setShowLocationSuggestions(false);
  };

  const handleShare = () => {
    const postData = {
      images: uploadedImages,
      caption,
      drive: selectedDrive,
      location
    };
    onShare(postData);
  };

  const isShareEnabled = uploadedImages.length > 0 && selectedDrive;

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-white text-sm font-medium">
        <span>9:30</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 bg-black rounded-sm"></div>
          <div className="w-4 h-2 bg-black rounded-sm"></div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack}>
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">New Impact </h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Image Upload Area */}
        <div className="space-y-4">
          {uploadedImages.length === 0 ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Drop images here or click to upload</p>
              <p className="text-sm text-gray-400">Support multiple images (max 10)</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Instagram-style Image Carousel */}
              <div className="relative rounded-lg overflow-hidden">
                {/* Main Image Display */}
                <div className="relative h-80">
                  <img 
                    src={uploadedImages[currentImageIndex].url} 
                    alt={`Upload ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Remove Current Image Button */}
                  <button
                    onClick={() => removeImage(uploadedImages[currentImageIndex].id)}
                    className="absolute top-2 right-2 w-6 h-6 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                  
                  {/* Navigation Arrows (only show if multiple images) */}
                  {uploadedImages.length > 1 && (
                    <>
                      {currentImageIndex > 0 && (
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center"
                        >
                          ‹
                        </button>
                      )}
                      
                      {currentImageIndex < uploadedImages.length - 1 && (
                        <button
                          onClick={nextImage}
                          className="absolute right-8 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center"
                        >
                          ›
                        </button>
                      )}
                    </>
                  )}
                  
                  {/* Image Counter */}
                  {uploadedImages.length > 1 && (
                    <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      {currentImageIndex + 1}/{uploadedImages.length}
                    </div>
                  )}
                </div>
                
                {/* Dot Indicators */}
                {uploadedImages.length > 1 && (
                  <div className="flex justify-center space-x-2 mt-3">
                    {uploadedImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToImage(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Add More Button */}
              {uploadedImages.length < 10 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 transition-colors"
                >
                  + Add more images ({uploadedImages.length}/10)
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Caption */}
        <div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            className="w-full p-3 border-0 resize-none text-base placeholder-gray-500 focus:outline-none"
            rows="3"
          />
        </div>

        {/* Drive Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 py-3">
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
            </div>
            <span className="text-base text-gray-900">Select fundraising drive</span>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowDriveDropdown(!showDriveDropdown)}
              className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white"
            >
              <span className={selectedDrive ? 'text-gray-900' : 'text-gray-500'}>
                {selectedDrive || 'Choose a drive...'}
              </span>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
            
            {showDriveDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {ongoingDrives.map((drive) => (
                  <button
                    key={drive}
                    onClick={() => {
                      setSelectedDrive(drive);
                      setShowDriveDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  >
                    {drive}  
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Location */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-gray-600" />
            <span className="text-base text-gray-900">Add location</span>
          </div>
          
          <div className="relative">
            <input
              type="text"
              value={location}
              onChange={(e) => handleLocationInput(e.target.value)}
              placeholder="Search for a location..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            
            {showLocationSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                {locationSuggestions
                  .filter(loc => loc.toLowerCase().includes(location.toLowerCase()))
                  .map((loc) => (
                    <button
                      key={loc}
                      onClick={() => selectLocation(loc)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      {loc}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200">
        <div className="max-w-sm mx-auto">
          <button
            onClick={handleShare}
            disabled={!isShareEnabled}
            className={`w-full py-4 rounded-full font-semibold text-white transition-colors ${
              isShareEnabled 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Share
          </button>
        </div>
      </div>

      {/* Bottom spacing for fixed button */}
      <div className="h-20"></div>
    </div>
  );
};

export default ImapctPostDrafting;