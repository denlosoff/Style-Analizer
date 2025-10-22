import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { Style, Axis } from '../types';
import Modal from './common/Modal';
import { AXIS_SCORE_MIN, AXIS_SCORE_MAX } from '../constants';
import { PlusIcon, TrashIcon, SparklesIcon, StarIcon } from './icons';

interface StyleEditorModalProps {
    style: Style;
    axes: Axis[];
    onSave: (style: Style) => void;
    onClose: () => void;
    onViewImages: (images: string[], startIndex: number) => void;
}

// Helper function to fetch an image URL and convert it to a base64 string
async function imageUrlToBase64(url: string): Promise<{ data: string; mimeType: string }> {
    // Handle data URLs directly
    if (url.startsWith('data:image')) {
        try {
            const parts = url.split(',');
            const mimeTypePart = parts[0].split(':')[1].split(';')[0];
            const data = parts[1];
            if (!mimeTypePart || !data) {
                throw new Error('Invalid data URL format.');
            }
            return { data, mimeType: mimeTypePart };
        } catch (error) {
            console.error('Error parsing data URL:', url, error);
            throw new Error(`Failed to parse data URL: ${url.substring(0, 50)}...`);
        }
    }

    const blobToBase64 = (blob: Blob): Promise<{ data: string, mimeType: string }> => {
        const mimeType = blob.type;
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result as string;
                const base64String = base64data.split(',')[1];
                if (!base64String) {
                    reject(new Error('Failed to extract base64 data from data URL.'));
                    return;
                }
                resolve({ data: base64String, mimeType });
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(blob);
        });
    };

    // Use a proxy to bypass potential CORS issues
    const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`Proxy fetch failed with status: ${response.status}`);
        }
        const blob = await response.blob();
        return await blobToBase64(blob);
    } catch (error) {
         console.error(`CORS or fetch error for ${url} via proxy. Trying direct fetch.`, error);
         // Fallback to direct fetch if proxy fails
         try {
            const directResponse = await fetch(url);
            if (!directResponse.ok) {
                throw new Error(`Direct fetch failed with status: ${directResponse.status}`);
            }
            const blob = await directResponse.blob();
            return await blobToBase64(blob);
        } catch (directFetchError) {
             console.error(`Direct fetch for ${url} also failed.`, directFetchError);
             throw new Error(`Could not fetch image from URL: ${url}`);
        }
    }
}


const StyleEditorModal: React.FC<StyleEditorModalProps> = ({ style, axes, onSave, onClose, onViewImages }) => {
    const [formData, setFormData] = useState<Style>(style);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof style.coverImageIndex !== 'number' || style.coverImageIndex < 0) {
            setFormData({...style, coverImageIndex: 0});
        } else {
            setFormData(style);
        }
    }, [style]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleScoreChange = (axisId: string, score: number) => {
        const newScores = { ...formData.scores, [axisId]: score };
        setFormData(prev => ({ ...prev, scores: newScores }));
    };
    
    const handleAddImage = () => {
        if (newImageUrl && !formData.images.includes(newImageUrl)) {
            setFormData(prev => ({...prev, images: [...prev.images, newImageUrl]}));
            setNewImageUrl('');
        }
    }
    
    const handleRemoveImage = (url: string) => {
        setFormData(prev => {
            const deletedIndex = prev.images.findIndex(img => img === url);
            const newImages = prev.images.filter(img => img !== url);
            let newCoverIndex = prev.coverImageIndex;

            if (deletedIndex === newCoverIndex) {
                newCoverIndex = 0;
            } else if (deletedIndex < newCoverIndex) {
                newCoverIndex -= 1;
            }
            
            return {
                ...prev,
                images: newImages,
                coverImageIndex: Math.max(0, newCoverIndex)
            };
        });
    }

    const handleSetCoverImage = (index: number) => {
        setFormData(prev => ({...prev, coverImageIndex: index}));
    }

    const handleGenerateDescription = async () => {
        setIsGeneratingDescription(true);
        setGenerationError(null);
        try {
            if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const textPrompt = `Analyze the provided style name and any reference images to generate a concise, artistic description for the style. Style name: '${formData.name}'.`;
            const imageParts: { inlineData: { data: string; mimeType: string; } }[] = [];

            if (formData.images.length > 0) {
                const imagePromises = formData.images.slice(0, 5).map(async (url) => { // Limit to 5 images
                    try {
                        const { data, mimeType } = await imageUrlToBase64(url);
                        return { inlineData: { data, mimeType } };
                    } catch (e) {
                        console.warn(`Could not process image URL ${url}:`, e);
                        setGenerationError(`Could not fetch reference image from ${url}. It might be protected by CORS policy.`);
                        return null;
                    }
                });
                const resolvedImageParts = await Promise.all(imagePromises);
                const successfulParts = resolvedImageParts.filter((p): p is { inlineData: { data: string; mimeType: string; } } => p !== null);
                imageParts.push(...successfulParts);
            }
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash', // This model handles both text and vision
                contents: { parts: [{ text: textPrompt }, ...imageParts] },
            });
            
            setFormData(prev => ({ ...prev, description: response.text.trim() }));

        } catch (error) {
            console.error("Description generation failed:", error);
            setGenerationError(`Failed to generate description. ${error instanceof Error ? error.message : 'Please check console for details.'}`);
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    const handleGenerateImage = async () => {
        setIsGeneratingImage(true);
        setGenerationError(null);
        try {
            if (!process.env.API_KEY) {
                throw new Error("API_KEY environment variable not set. This is a configuration requirement.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `A high-quality, artistic image representing the style of '${formData.name}'. ${formData.description}`;
            
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/png',
                    aspectRatio: '1:1',
                },
            });

            if (!response.generatedImages || response.generatedImages.length === 0) {
                throw new Error("Image generation failed: The API did not return an image. Your prompt might have been blocked by safety filters.");
            }
            
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            
            const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
            
            setFormData(prev => {
                const newImages = [...prev.images, imageUrl];
                return {
                    ...prev,
                    images: newImages,
                    coverImageIndex: newImages.length === 1 ? 0 : prev.coverImageIndex
                };
            });

        } catch (error) {
            console.error("Image generation failed:", error);
            setGenerationError(`Failed to generate image. ${error instanceof Error ? error.message : 'Please check console for details.'}`);
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const footer = (
        <div className="space-x-2">
            <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700">Save Style</button>
        </div>
    );

    return (
        <Modal title={style.id ? 'Edit Style' : 'Create Style'} onClose={onClose} footer={footer}>
            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* --- DEFINE SECTION --- */}
                <fieldset className="space-y-4">
                    <legend className="text-xl font-semibold mb-2">1. Define Style</legend>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Style Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2"
                            required
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center">
                             <label className="block text-sm font-medium text-gray-400">Description</label>
                             <button 
                                type="button" 
                                onClick={handleGenerateDescription}
                                disabled={isGeneratingDescription || !formData.name}
                                title="Generate description from name and reference images"
                                className="px-3 py-1 text-sm rounded-md bg-purple-600 hover:bg-purple-700 flex items-center disabled:bg-gray-500 disabled:cursor-not-allowed"
                            >
                                <SparklesIcon className="mr-1 h-4 w-4"/>
                                {isGeneratingDescription ? 'Generating...' : 'Generate'}
                            </button>
                        </div>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2"
                            placeholder="Describe the style or generate one with AI..."
                        />
                    </div>
                </fieldset>
                
                 {/* --- SCORE SECTION --- */}
                <fieldset className="space-y-3">
                    <legend className="text-xl font-semibold">2. Score Style</legend>
                    {axes.map(axis => (
                        <div key={axis.id}>
                            <label className="block text-sm font-medium text-gray-400">{axis.name}</label>
                            <div className="flex items-center space-x-3 mt-1">
                                <span>{AXIS_SCORE_MIN}</span>
                                <input
                                    type="range"
                                    min={AXIS_SCORE_MIN}
                                    max={AXIS_SCORE_MAX}
                                    step="0.1"
                                    value={formData.scores[axis.id] || 5}
                                    onChange={(e) => handleScoreChange(axis.id, parseFloat(e.target.value))}
                                    className="w-full"
                                />
                                <span>{AXIS_SCORE_MAX}</span>
                                <input 
                                    type="number"
                                    min={AXIS_SCORE_MIN}
                                    max={AXIS_SCORE_MAX}
                                    step="0.1"
                                    value={formData.scores[axis.id] || 5}
                                    onChange={(e) => handleScoreChange(axis.id, parseFloat(e.target.value))}
                                    className="w-20 bg-gray-700 border border-gray-600 rounded-md p-1 text-center"
                                />
                            </div>
                        </div>
                    ))}
                     {axes.length === 0 && <p className="text-gray-400">No axes created yet. Add an axis to start scoring.</p>}
                </fieldset>

                {/* --- GALLERY SECTION --- */}
                <fieldset className="space-y-4">
                     <legend className="text-xl font-semibold">3. Manage Gallery</legend>
                     <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="Add reference image URL..."
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            className="flex-1 bg-gray-700 border border-gray-600 rounded-md p-2"
                        />
                        <button type="button" onClick={handleAddImage} title="Add image from URL" className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700"><PlusIcon /></button>
                    </div>
                    <div>
                        <button 
                            type="button" 
                            onClick={handleGenerateImage} 
                            disabled={isGeneratingImage}
                            title="Generate a new image for this style using AI"
                            className="w-full px-3 py-2 rounded-md bg-green-600 hover:bg-green-700 flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            <SparklesIcon className="mr-2"/>
                            {isGeneratingImage ? 'Generating Image...' : 'Generate New Image for Style'}
                        </button>
                    </div>
                     {generationError && <p className="text-red-400 text-sm mt-1">{generationError}</p>}
                     <div className="grid grid-cols-3 gap-2 mt-2">
                        {formData.images.map((url, index) => (
                            <div key={url.substring(0, 50) + index} className="relative group aspect-square">
                                <img src={url} alt={`Style image ${index + 1}`} className="rounded-md w-full h-full object-cover cursor-pointer" onClick={() => onViewImages(formData.images, index)} />
                                <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                                    <button type="button" title="Set as cover" onClick={(e) => { e.stopPropagation(); handleSetCoverImage(index); }} className="p-2 text-yellow-400 hover:text-yellow-300 rounded-full hover:bg-black/50">
                                        <StarIcon isFilled={formData.coverImageIndex === index} />
                                    </button>
                                    <button type="button" title="Remove image" onClick={(e) => { e.stopPropagation(); handleRemoveImage(url); }} className="p-2 text-red-500 hover:text-red-400 rounded-full hover:bg-black/50">
                                        <TrashIcon />
                                    </button>
                                </div>
                                {formData.coverImageIndex === index && (
                                    <div className="absolute top-1 left-1 p-1 bg-yellow-400 rounded-full text-black pointer-events-none">
                                        <StarIcon className="w-4 h-4" isFilled={true} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </fieldset>
            </form>
        </Modal>
    );
};

export default StyleEditorModal;