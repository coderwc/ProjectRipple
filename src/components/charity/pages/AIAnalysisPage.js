import React from 'react';
import { ArrowLeft } from 'lucide-react';

const AIAnalysisPage = ({
  articleText,
  setArticleText,
  aiAnalysis,
  generatedItems,
  setGeneratedItems,  // Now we can edit the items!
  onBack,
  onAnalyze,
  onUseItems
}) => {
  
  // Function to update quantity
  const updateQuantity = (index, newQuantity) => {
    const updatedItems = [...generatedItems];
    updatedItems[index].quantity = newQuantity;
    setGeneratedItems(updatedItems);
  };

  return (
 <div className="max-w-sm mx-auto bg-gradient-to-b from-blue-200 via-blue-100 to-white min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">AI Article Analysis</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-24">
        {/* Article Input */}
        <div className="mb-6 bg-white rounded-lg p-4 border border-gray-400">
          <label className="block text-lg font-bold text-gray-900 mb-2">
            Paste Article or Disaster Description
          </label>
          <textarea 
            rows="8"
            value={articleText}
            onChange={(e) => setArticleText(e.target.value)}
            className="w-full p-4 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Paste news article, disaster report, or description here...

Example: 'Earthquake in Turkey: 7.8 magnitude earthquake hits southern Turkey. At least 50,000 people affected, many buildings collapsed. Emergency shelters needed urgently for displaced families.'"
          />
        </div>

        {/* Analyze Button */}
        <button 
          onClick={onAnalyze}
          disabled={!articleText.trim() || aiAnalysis?.loading}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 mb-6"
        >
          {aiAnalysis?.loading ? 'Analyzing...' : 'ANALYZE WITH AI'}
        </button>

        {/* Loading State */}
        {aiAnalysis?.loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">AI is analyzing the article and generating relief recommendations...</p>
          </div>
        )}

        {/* Error State */}
        {aiAnalysis?.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600">{aiAnalysis.error}</p>
            <p className="text-sm text-gray-600 mt-2">
              Make sure your backend server is running on http://localhost:5001
            </p>
          </div>
        )}

        {/* Results */}
        {aiAnalysis && !aiAnalysis.loading && !aiAnalysis.error && generatedItems.length > 0 && (
          <div className="space-y-6">
            {/* Analysis Summary */}
            <div className="bg-white rounded-lg p-4 border border-gray-400 border-l-4 border-l-blue-500">
              <h3 className="font-bold text-gray-900 mb-2">Analysis Summary</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Cause Type:</span> {aiAnalysis.cause_type}</p>
                <p><span className="font-medium">Severity:</span> {aiAnalysis.severity}</p>
                <p><span className="font-medium">Affected Population:</span> {aiAnalysis.affected_population}</p>
                <p><span className="font-medium">Location:</span> {aiAnalysis.location}</p>
              </div>
            </div>

            {/* Generated Items - NOW EDITABLE! */}
            <div className="bg-white rounded-lg p-4 border border-gray-400">
              <h3 className="font-bold text-gray-900 mb-3">Generated Relief Items</h3>
              <p className="text-sm text-blue-600 mb-3">💡 Click on quantities to edit them!</p>
              <div className="space-y-3">
                {generatedItems.map((item, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-4 border border-gray-400">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 flex-1">{item.item}</h4>
                      {/* EDITABLE QUANTITY */}
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(index, e.target.value)}
                        className="text-blue-600 font-bold bg-white border border-gray-400 rounded px-3 py-1 text-sm w-28 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white ml-2"
                        placeholder="Edit qty"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{item.purpose}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      item.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.priority} priority
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Use Items Button */}
            <button 
              onClick={onUseItems}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors"
            >
              USE THESE ITEMS IN POST ({generatedItems.length} items)
            </button>
          </div>
        )}

        {/* Quick Test Examples */}
        {!aiAnalysis && (
          <div className="bg-white rounded-lg p-4 border border-gray-400">
            <h4 className="font-medium text-gray-900 mb-2">Quick Test Examples:</h4>
            <div className="space-y-2">
              <button 
                onClick={() => setArticleText('Earthquake in Turkey: 7.8 magnitude earthquake hits southern Turkey. At least 50,000 people affected, many buildings collapsed. Emergency shelters needed urgently for displaced families.')}
                className="text-left text-sm text-blue-600 hover:text-blue-800 block hover:bg-blue-50 p-2 rounded w-full"
              >
                • Earthquake disaster example
              </button>
              <button 
                onClick={() => setArticleText('School in rural Bangladesh needs support: 500 students lack basic supplies. No textbooks, pencils, or notebooks available. Children walking 5km to attend classes in damaged building.')}
                className="text-left text-sm text-blue-600 hover:text-blue-800 block hover:bg-blue-50 p-2 rounded w-full"
              >
                • Education need example
              </button>
              <button 
                onClick={() => setArticleText('Hospital in Yemen running out of medical supplies: 200 patients daily, critical shortage of medicines, bandages, and equipment. Staff working without proper resources.')}
                className="text-left text-sm text-blue-600 hover:text-blue-800 block hover:bg-blue-50 p-2 rounded w-full"
              >
                • Medical emergency example
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysisPage;