
import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import Loader from './Loader';
import { CloseIcon } from './IconComponents';

interface EditModalProps {
  image: GeneratedImage | null;
  onClose: () => void;
  onApplyEdit: (image: GeneratedImage, prompt: string) => Promise<void>;
  isLoading: boolean;
}

const EditModal: React.FC<EditModalProps> = ({ image, onClose, onApplyEdit, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  if (!image) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onApplyEdit(image, prompt);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row border border-gray-700">
        <div className="relative w-full md:w-1/2 flex-shrink-0">
          <img src={image.base64} alt={`Editing ${image.dishName}`} className="w-full h-full object-contain rounded-t-lg md:rounded-l-lg md:rounded-tr-none" />
        </div>
        <div className="w-full md:w-1/2 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Edit Photograph</h2>
                    <p className="text-gray-400">{image.dishName}</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
          
          <div className="flex-grow flex items-center justify-center">
            {isLoading ? (
              <Loader message="Applying edit..." />
            ) : (
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div>
                  <label htmlFor="edit-prompt" className="block text-sm font-medium text-gray-300 mb-2">
                    Describe your edit (e.g., "add steam", "make it black and white")
                  </label>
                  <input
                    id="edit-prompt"
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Add a retro filter"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!prompt.trim() || isLoading}
                  className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                  Apply Edit
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
