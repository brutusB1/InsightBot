// src/components/tabs/ImageGallery.js

import React from 'react';

const ImageGallery = ({ images }) => {
  if (images.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">No images to display.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {images.map((img, index) => (
        <div key={index} className="border rounded-lg overflow-hidden shadow-md bg-gray-100 dark:bg-gray-700">
          <img
            src={img.url}
            alt={img.description || `Image ${index + 1}`}
            className="w-full h-48 object-cover"
          />
          {img.description && <p className="p-3 text-sm text-gray-700 dark:text-gray-300">{img.description}</p>}
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;
