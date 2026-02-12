import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';
import { refreshProducts } from '../utils/productDatabase';

export default function Scanning() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const removeImage = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processImage = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      console.log('Sending image to backend for detection...');
      
      // Call the backend API
      const response = await api.detectProduct(selectedImage);
      
      console.log('Detection successful:', response);
      
      // Set the result
      setResult({
        productName: response.productName,
        category: response.category,
        confidence: response.confidence,
        currentCount: response.currentCount
      });

      // Refresh the products list so Dashboard and Database update
      await refreshProducts();
      
      console.log('Products refreshed');
      
    } catch (err) {
      console.error('Detection failed:', err);
      setError(err.message || 'Failed to detect product. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Scan Products</h1>
        <p className="text-gray-500">Upload an image to detect and track products</p>
      </header>

      {/* Upload Box */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {selectedImage ? (
            <div className="relative">
              <img
                src={selectedImage}
                alt="Selected"
                className="max-h-[500px] mx-auto rounded-lg"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                disabled={isProcessing}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Drag and drop an image here, or</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
              >
                Browse Files
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Process Button */}
      {selectedImage && !result && (
        <div className="mt-6">
          <button
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center text-lg font-semibold"
            onClick={processImage}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing Image...
              </>
            ) : (
              'Process Image'
            )}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Detection Failed</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-600 hover:text-red-800 underline mt-2"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-900 mb-2">
                Product Detected Successfully!
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-green-200">
                  <span className="text-green-700 font-medium">Product:</span>
                  <span className="text-green-900 font-semibold">{result.productName}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-green-200">
                  <span className="text-green-700 font-medium">Category:</span>
                  <span className="text-green-900">{result.category}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-green-200">
                  <span className="text-green-700 font-medium">Confidence:</span>
                  <span className="text-green-900 font-semibold">
                    {result.confidence.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-green-700 font-medium">Current Stock:</span>
                  <span className="text-green-900 font-bold text-lg">
                    {result.currentCount}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => {
                    setResult(null);
                    removeImage();
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Scan Another Product
                </button>
                <button
                  onClick={() => window.location.href = '#'}
                  className="px-4 py-2 border border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                >
                  View Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!selectedImage && !isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📸 How to Use:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Upload a clear image of the product</li>
            <li>Ensure good lighting and the product is in focus</li>
            <li>The AI will automatically detect and categorize the product</li>
            <li>Inventory count will update automatically</li>
          </ul>
        </div>
      )}
    </div>
  );
}