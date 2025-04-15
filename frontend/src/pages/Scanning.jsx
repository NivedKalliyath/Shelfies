import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

export default function Scanning() {
  // State to store the selected image
  const [selectedImage, setSelectedImage] = useState(null);
  // State to track processing status
  const [isProcessing, setIsProcessing] = useState(false);
  // Ref for the file input element to reset it when needed
  const fileInputRef = useRef(null);

  // Handle file selection from input
  const handleImageSelect = (event) => {
    const file = event.target.files?.[0]; // Get the first file
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result); // Convert file to data URL for preview
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file drop event
  const handleDrop = (event) => {
    event.preventDefault(); // Prevent default browser behavior
    const file = event.dataTransfer.files?.[0]; // Get the first dropped file
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result); // Convert file to data URL
      };
      reader.readAsDataURL(file);
    }
  };

  // Prevent default drag-over behavior
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Remove the selected image
  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input field
    }
  };

  // Simulate image processing with a loading state
  const processImage = () => {
    if (!selectedImage) return;
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 2000); // Simulate 2-second processing time
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Scan Products</h1>
        <p className="text-gray-500">Upload an image to preview</p>
      </header>

      {/* Upload box */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {/* Show image preview if selected */}
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
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            // Drag & Drop area or file upload button
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

      {/* Process Image Button (only visible when an image is selected) */}
      {selectedImage && (
        <div className="mt-6">
          <button
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
            onClick={processImage}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Process Image'
            )}
          </button>
        </div>
      )}
    </div>
  );
}