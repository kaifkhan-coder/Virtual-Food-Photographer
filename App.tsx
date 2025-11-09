
import React, { useState, useCallback } from 'react';
import { PhotoStyle, Dish, GeneratedImage } from './types';
import { parseMenu, generateImage, editImage } from './services/geminiService';
import ImageGallery from './components/ImageGallery';
import EditModal from './components/EditModal';
import Loader from './components/Loader';
import { CameraIcon } from './components/IconComponents';

const App: React.FC = () => {
    const [menuText, setMenuText] = useState('');
    const [photoStyle, setPhotoStyle] = useState<PhotoStyle>(PhotoStyle.BRIGHT_MODERN);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    const [editingImage, setEditingImage] = useState<GeneratedImage | null>(null);
    const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
    const [isEditingLoading, setIsEditingLoading] = useState(false);

    const handleGenerate = async () => {
        if (!menuText.trim()) {
            setError("Please enter your menu text.");
            return;
        }
        setError(null);
        setIsLoading(true);
        setGeneratedImages([]);

        try {
            setLoadingMessage('Parsing your menu...');
            const dishes = await parseMenu(menuText);
            if (dishes.length === 0) {
                throw new Error("No dishes could be identified from your menu.");
            }

            setLoadingMessage(`Generating photos for ${dishes.length} dishes...`);
            const imagePromises = dishes.map(dish => 
                generateImage(dish, photoStyle).then(base64 => ({
                    id: `${dish.name}-${Date.now()}`,
                    dishName: dish.name,
                    base64
                }))
            );

            const images = await Promise.all(imagePromises);
            setGeneratedImages(images);

        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleEditClick = (image: GeneratedImage) => {
        setEditingImage(image);
        setIsEditingModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditingModalOpen(false);
        setEditingImage(null);
    };

    const handleApplyEdit = useCallback(async (image: GeneratedImage, prompt: string) => {
        setIsEditingLoading(true);
        setError(null);
        try {
            const newBase64 = await editImage(image.base64, prompt);
            const updatedImage = { ...image, base64: newBase64 };
            
            setGeneratedImages(prevImages =>
                prevImages.map(img => (img.id === image.id ? updatedImage : img))
            );
            setEditingImage(updatedImage); // Update image in modal
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to apply edit.');
        } finally {
            setIsEditingLoading(false);
        }
    }, []);

    const exampleMenu = `APPETIZERS\nClassic Bruschetta - $9\nToasted baguette topped with fresh tomatoes, garlic, basil, and balsamic glaze.\n\nMAINS\nSpaghetti Carbonara - $18\nCreamy egg-based sauce with pancetta and Pecorino Romano cheese.\n\nMargherita Pizza - $15\nClassic pizza with San Marzano tomatoes, fresh mozzarella, basil, and a drizzle of olive oil.`;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-center">
                    <CameraIcon className="w-8 h-8 mr-3 text-cyan-400" />
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Virtual Food Photographer</h1>
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Panel: Controls */}
                    <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 text-cyan-400">1. Enter Your Menu</h2>
                        <textarea
                            className="w-full h-48 p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                            placeholder="Paste your menu here..."
                            value={menuText}
                            onChange={(e) => setMenuText(e.target.value)}
                        />
                         <button onClick={() => setMenuText(exampleMenu)} className="text-sm text-cyan-400 hover:text-cyan-300 mt-2">
                           Use an example menu
                         </button>

                        <h2 className="text-xl font-semibold mt-6 mb-4 text-cyan-400">2. Choose a Style</h2>
                        <div className="grid grid-cols-1 gap-2">
                            {(Object.values(PhotoStyle)).map(style => (
                                <button
                                    key={style}
                                    onClick={() => setPhotoStyle(style)}
                                    className={`w-full p-3 text-left rounded-md transition-colors text-white ${photoStyle === style ? 'bg-cyan-600 ring-2 ring-cyan-400' : 'bg-gray-700 hover:bg-gray-600'}`}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>

                        <h2 className="text-xl font-semibold mt-6 mb-4 text-cyan-400">3. Generate Photos</h2>
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-md hover:bg-cyan-700 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 transform hover:scale-105"
                        >
                            {isLoading ? 'Generating...' : 'Create My Food Photos'}
                        </button>
                    </div>

                    {/* Right Panel: Results */}
                    <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg border border-gray-700 min-h-[60vh]">
                        {error && (
                            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6">
                                <p className="font-bold">Error</p>
                                <p>{error}</p>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader message={loadingMessage} />
                            </div>
                        ) : generatedImages.length > 0 ? (
                            <ImageGallery images={generatedImages} onEditClick={handleEditClick} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                                <CameraIcon className="w-24 h-24 mb-4" />
                                <h3 className="text-2xl font-semibold">Your photo gallery is empty</h3>
                                <p className="mt-2 max-w-sm">Enter your menu, select a style, and click 'Generate' to see the magic happen!</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {isEditingModalOpen && (
                <EditModal
                    image={editingImage}
                    onClose={handleCloseModal}
                    onApplyEdit={handleApplyEdit}
                    isLoading={isEditingLoading}
                />
            )}
        </div>
    );
};

export default App;
