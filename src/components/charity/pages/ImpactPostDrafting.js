import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, X, Plus, MapPin } from 'lucide-react';

const ImpactPostDrafting = ({ onBack, onShare, availableDrives = [] }) => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [caption, setCaption] = useState('');
  const [selectedDrive, setSelectedDrive] = useState('');
  const [location, setLocation] = useState('');
  const fileInputRef = useRef(null);

  // Use provided drives or fallback to sample drives
  const driveOptions = availableDrives.length > 0 ? availableDrives : [
    "Emergency Food Relief",
    "Winter Clothing Drive", 
    "School Supplies Support",
    "Community Healthcare Initiative",
    "Clean Water Project"
  ];

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    // Limit to 10 images total
    const remainingSlots = 10 - uploadedImages.length;
    const filesToProcess = files.slice(0, remainingSlots);
    
    filesToProcess.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            id: Date.now() + Math.random(),
            file: file,
            url: e.target.result,
            name: file.name
          };
          
          setUploadedImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Reset file input
    event.target.value = '';
  };

  const removeImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleShare = () => {
    const postData = {
      images: uploadedImages,
      caption: caption.trim(),
      drive: selectedDrive,
      location: location.trim(),
      timestamp: new Date().toISOString()
    };
    
    onShare(postData);
  };

  // Enable share button if there are images OR caption has content
  const isShareEnabled = (uploadedImages.length > 0 || caption.trim().length > 0) && selectedDrive;

  return (
    <div className="max-w-sm mx-auto bg-gradient-to-b from-blue-200 via-blue-100 to-white min-h-screen">
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Share Impact</h1>
          </div>
          <button
            onClick={handleShare}
            disabled={!isShareEnabled}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isShareEnabled 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Share
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-24 space-y-6">
        {/* Image Upload Section */}
        <div className="mb-6 bg-white rounded-lg p-4 border border-gray-400">
          <label className="block text-lg font-bold text-gray-900 mb-2">Photos ({uploadedImages.length}/10)</label>
          
          {/* Main Upload Area - similar to CreatePostPage but for multiple images */}
          {uploadedImages.length === 0 && (
            <div className="w-full h-48 bg-gray-200 rounded-lg border-2 border-dashed border-gray-400 flex flex-col items-center justify-center hover:border-gray-500 transition-colors mb-3">
              <button
                onClick={triggerFileInput}
                className="flex flex-col items-center justify-center w-full h-full"
              >
                <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mb-3">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <span className="text-gray-400 font-medium">Add Images</span>
                <span className="text-gray-400 text-sm mt-1">Up to 10 photos</span>
              </button>
            </div>
          )}
          
          {/* Image Grid - shown when images are uploaded */}
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {uploadedImages.map((image) => (
                <div key={image.id} className="relative aspect-square">
                  <img
                    src={image.url}
                    alt="Upload preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {/* Add More Button */}
              {uploadedImages.length < 10 && (
                <button
                  onClick={triggerFileInput}
                  className="aspect-square border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-gray-500 hover:text-gray-600 transition-colors"
                >
                  <Plus className="w-6 h-6 mb-1" />
                  <span className="text-xs">Add</span>
                </button>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Caption Section */}
        <div className="mb-6 bg-white rounded-lg p-4 border border-gray-400">
          <label className="block text-lg font-bold text-gray-900 mb-2">Caption</label>
          <textarea
            rows="6"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Share the story behind your impact... Tell people about the lives you've touched, the difference you've made, or the progress of your mission. What would you like the community to know?"
            className="w-full p-4 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            maxLength={500}
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {caption.length}/500
          </div>
        </div>

        {/* Drive Selection */}
        <div className="mb-6 bg-white rounded-lg p-4 border border-gray-400">
          <label className="block text-lg font-bold text-gray-900 mb-2">Related Drive *</label>
          <select
            value={selectedDrive}
            onChange={(e) => setSelectedDrive(e.target.value)}
            className="w-full p-4 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a drive...</option>
            {driveOptions.map((drive, index) => (
              <option key={index} value={drive}>{drive}</option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="mb-6 bg-white rounded-lg p-4 border border-gray-400">
          <label className="block text-lg font-bold text-gray-900 mb-2">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where was this impact made?"
              className="w-full pl-10 pr-4 py-4 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Writing Guidance */}
        <div className="bg-white p-4 rounded-lg border border-gray-400">
          <h3 className="text-sm font-medium text-gray-900 mb-2">💡 Impact Sharing Tips</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Show the real difference your work makes</li>
            <li>• Include before/after photos when possible</li>
            <li>• Share stories of people you've helped</li>
            <li>• Thank your donors and supporters</li>
            <li>• Be authentic and heartfelt in your message</li>
          </ul>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200 px-4 py-4">
        <button 
          onClick={handleShare}
          disabled={!isShareEnabled}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-colors ${
            isShareEnabled 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Share Impact
        </button>
      </div>
    </div>
  );
};

export default ImpactPostDrafting;