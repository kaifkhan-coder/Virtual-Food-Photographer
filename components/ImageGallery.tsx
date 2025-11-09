
import React from 'react';
import { GeneratedImage } from '../types';
import { DownloadIcon, EditIcon } from './IconComponents';

interface ImageCardProps {
  image: GeneratedImage;
  onEditClick: (image: GeneratedImage) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onEditClick }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.base64;
    link.download = `${image.dishName.replace(/\s+/g, '_')}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="group relative overflow-hidden rounded-lg shadow-lg bg-gray-800 border border-gray-700 transition-all duration-300 hover:shadow-cyan-500/30 hover:border-cyan-500">
      <img src={image.base64} alt={image.dishName} className="w-full h-64 object-cover" />
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
        <h3 className="text-lg font-bold text-white truncate">{image.dishName}</h3>
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={handleDownload}
          className="p-3 bg-white/20 rounded-full text-white hover:bg-cyan-500 transition-colors"
          title="Download Image"
        >
          <DownloadIcon className="w-6 h-6" />
        </button>
        <button
          onClick={() => onEditClick(image)}
          className="p-3 bg-white/20 rounded-full text-white hover:bg-purple-500 transition-colors"
          title="Edit Image"
        >
          <EditIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};


interface ImageGalleryProps {
  images: GeneratedImage[];
  onEditClick: (image: GeneratedImage) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onEditClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image) => (
        <ImageCard key={image.id} image={image} onEditClick={onEditClick} />
      ))}
    </div>
  );
};

export default ImageGallery;
