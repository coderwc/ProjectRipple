import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, MapPin, ChevronDown, Move, ZoomIn, ZoomOut } from 'lucide-react';

const ImpactPostDrafting = ({ onBack = () => {}, onShare = () => {} }) => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [caption, setCaption] = useState('');
  const [selectedDrive, setSelectedDrive] = useState('');
  const [location, setLocation] = useState('');
  const [showDriveDropdown, setShowDriveDropdown] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showCropAdjust, setShowCropAdjust] = useState(false);
  const [imageTransforms, setImageTransforms] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef(null);
  const scrollContainerRef = useRef(null);

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
          const imageId = Date.now() + Math.random();
          setUploadedImages(prev => [...prev, {
            id: imageId,
            url: e.target.result,
            file: file
          }]);
          // Initialize transform for new image
          setImageTransforms(prev => ({
            ...prev,
            [imageId]: { scale: 1, x: 0, y: 0 }
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (imageId) => {
    const imageIndex = uploadedImages.findIndex(img => img.id === imageId);
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    // Remove transform data
    setImageTransforms(prev => {
      const newTransforms = { ...prev };
      delete newTransforms[imageId];
      return newTransforms;
    });
    // Adjust current index if needed
    if (imageIndex <= currentImageIndex && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else if (uploadedImages.length === 1) {
      setCurrentImageIndex(0);
    }
  };

  // Crop adjustment functions
  const getCurrentTransform = () => {
    const currentImage = uploadedImages[currentImageIndex];
    return imageTransforms[currentImage?.id] || { scale: 1, x: 0, y: 0 };
  };

  const updateCurrentTransform = (updates) => {
    const currentImage = uploadedImages[currentImageIndex];
    if (!currentImage) return;
    
    setImageTransforms(prev => ({
      ...prev,
      [currentImage.id]: { ...getCurrentTransform(), ...updates }
    }));
  };

  const handleZoom = (delta) => {
    const current = getCurrentTransform();
    const newScale = Math.max(0.5, Math.min(3, current.scale + delta));
    updateCurrentTransform({ scale: newScale });
  };

  const handleMouseDown = (e) => {
    if (!showCropAdjust) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !showCropAdjust) return;
    
    const current = getCurrentTransform();
    const deltaX = (e.clientX - dragStart.x) * 2;
    const deltaY = (e.clientY - dragStart.y) * 2;
    
    updateCurrentTransform({
      x: current.x + deltaX,
      y: current.y + deltaY
    });
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetCrop = () => {
    updateCurrentTransform({ scale: 1, x: 0, y: 0 });
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
            <h1 className="text-lg font-semibold text-gray-900">New post</h1>
          </div>
        </div>
      </div>

      {/* Image Upload Area - Full Width */}
      {uploadedImages.length === 0 ? (
        <div className="px-4 mt-6">
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
        </div>
      ) : (
        <>
          {/* Instagram-style Full Width Image Preview */}
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <div
              ref={scrollContainerRef}
              className="flex h-full overflow-x-auto snap-x snap-mandatory"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                WebkitScrollbarWidth: 'none'
              }}
              onScroll={(e) => {
                const container = e.target;
                const containerWidth = container.clientWidth;
                const scrollLeft = container.scrollLeft;
                const newIndex = Math.round(scrollLeft / containerWidth);
                if (newIndex !== currentImageIndex && newIndex >= 0 && newIndex < uploadedImages.length) {
                  setCurrentImageIndex(newIndex);
                }
              }}
            >
              {uploadedImages.map((image, index) => {
                const transform = imageTransforms[image.id] || { scale: 1, x: 0, y: 0 };
                return (
                  <div key={image.id} className="relative flex-shrink-0 w-full h-full snap-center">
                    <div 
                      className="w-full h-full overflow-hidden cursor-move"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      <img
                        src={image.url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-100"
                        style={{
                          transform: `scale(${transform.scale}) translate(${transform.x}px, ${transform.y}px)`,
                          cursor: showCropAdjust ? 'move' : 'default'
                        }}
                        draggable={false}
                      />
                    </div>
                    
                    {/* Remove Image Button */}
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute top-3 right-3 w-8 h-8 bg-black bg-opacity-60 text-white rounded-full flex items-center justify-center text-lg hover:bg-opacity-80 transition-opacity z-10"
                    >
                      ×
                    </button>
                    
                    {/* Crop Adjust Button */}
                    <button
                      onClick={() => setShowCropAdjust(!showCropAdjust)}
                      className="absolute top-3 left-3 w-8 h-8 bg-black bg-opacity-60 text-white rounded-full flex items-center justify-center hover:bg-opacity-80 transition-opacity z-10"
                    >
                      <Move className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Crop Controls */}
            {showCropAdjust && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-black bg-opacity-80 rounded-full px-4 py-2">
                <button
                  onClick={() => handleZoom(-0.1)}
                  className="w-8 h-8 text-white flex items-center justify-center hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-white text-sm min-w-12 text-center">
                  {Math.round(getCurrentTransform().scale * 100)}%
                </span>
                <button
                  onClick={() => handleZoom(0.1)}
                  className="w-8 h-8 text-white flex items-center justify-center hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-white bg-opacity-30 mx-1"></div>
                <button
                  onClick={resetCrop}
                  className="text-white text-sm px-3 py-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  Reset
                </button>
              </div>
            )}

            {/* Image Counter Dots - Instagram Style */}
            {uploadedImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {uploadedImages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white drop-shadow-sm' : 'bg-white bg-opacity-60 drop-shadow-sm'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Add More Button */}
          {uploadedImages.length < 10 && (
            <div className="px-4 mt-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 transition-colors"
              >
                + Add more images ({uploadedImages.length}/10)
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </>
      )}

      <div className="px-4 py-4 space-y-6">
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

export default ImpactPostDrafting;