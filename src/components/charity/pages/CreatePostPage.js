import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';

const CreatePostPage = ({
  selectedImage,
  setSelectedImage,
  formData,
  setFormData,
  addedItems,
  setAddedItems,
  onBack,
  onAddItems,
  onPostNeed,
  onAIRecommendation // Add this new prop
}) => (
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
      {/* Add Image Section */}
      <div className="mb-6">
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => setSelectedImage(e.target.result);
              reader.readAsDataURL(file);
            }
          }}
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
                  <Plus className="w-8 h-8 text-white" />
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
          value={formData.headline}
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
          value={formData.storyDescription}
          onChange={(e) => setFormData({...formData, storyDescription: e.target.value})}
          className="w-full p-4 bg-gray-100 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Tell your story..."
        />
      </div>

      {/* Deadline */}
      <div className="mb-6">
        <label className="block text-lg font-bold text-gray-900 mb-2">Deadline</label>
        <input 
          type="text" 
          value={formData.deadline}
          onChange={(e) => setFormData({...formData, deadline: e.target.value})}
          placeholder="dd/mm/yyyy"
          className="w-full p-4 bg-gray-100 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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

      {/* AI Recommendation - NOW FUNCTIONAL! */}
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

export default CreatePostPage;