import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import type { Style, Axis } from '../types';
import Modal from './common/Modal';
import { AXIS_SCORE_MIN, AXIS_SCORE_MAX } from '../constants';
import { PlusIcon, TrashIcon, SparklesIcon, StarIcon, RefreshCwIcon, BotMessageSquareIcon, CheckCircleIcon } from './icons';
import { fetchImageAsBase64 } from '../utils/imageUtils';

interface StyleEditorModalProps {
    style: Style;
    axes: Axis[];
    onSave: (style: Style) => void;
    onClose: () => void;
    onViewImages: (images: string[], startIndex: number) => void;
}

/**
 * Parses a data URL string into its constituent parts.
 * @param dataUrl The full data URL (e.g., "data:image/png;base64,aabbcc...").
 * @returns An object containing the base64 data and the MIME type.
 */
function parseDataUrl(dataUrl: string): { data: string; mimeType: string } {
    const parts = dataUrl.split(',');
    const mimeTypePart = parts[0]?.split(':')[1]?.split(';')[0];
    const data = parts[1];
    if (!mimeTypePart || !data) {
        console.error('Invalid data URL:', dataUrl.substring(0, 50) + '...');
        throw new Error('Invalid data URL format.');
    }
    return { data, mimeType: mimeTypePart };
}


const StyleEditorModal: React.FC<StyleEditorModalProps> = ({ style, axes, onSave, onClose, onViewImages }) => {
    const [formData, setFormData] = useState<Style>(style);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [imageAddStatus, setImageAddStatus] = useState({ loading: false, error: null as string | null });
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

    // State for AI analysis based on selected images
    const [selectedImageUrls, setSelectedImageUrls] = useState<string[]>([]);
    const [isRewritingDescription, setIsRewritingDescription] = useState(false);
    const [isRecalculatingScores, setIsRecalculatingScores] = useState(false);

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
    
    const handleAddImage = async () => {
        if (!newImageUrl) return;
        
        setImageAddStatus({ loading: true, error: null });
        try {
            const base64Url = await fetchImageAsBase64(newImageUrl);
            if (formData.images.includes(base64Url)) {
                 throw new Error("This image has already been added.");
            }
            setFormData(prev => ({...prev, images: [...prev.images, base64Url]}));
            setNewImageUrl('');
        } catch (error) {
            setImageAddStatus({ loading: false, error: error instanceof Error ? error.message : 'An unknown error occurred.' });
        } finally {
            setImageAddStatus(prev => ({ ...prev, loading: false }));
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
        // Also remove from selection
        setSelectedImageUrls(prev => prev.filter(selectedUrl => selectedUrl !== url));
    }

    const handleSetCoverImage = (index: number) => {
        setFormData(prev => ({...prev, coverImageIndex: index}));
    }
    
    const handleToggleImageSelection = (url: string) => {
        setSelectedImageUrls(prev => 
            prev.includes(url) 
                ? prev.filter(u => u !== url) 
                : [...prev, url]
        );
    };

    const handleGenerateDescription = async () => {
        setIsGeneratingDescription(true);
        setGenerationError(null);
        try {
            if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const textPrompt = `Analyze the provided style name and any reference images to generate a concise, artistic description for the style. Style name: '${formData.name}'.`;
            const imageParts: { inlineData: { data: string; mimeType: string; } }[] = [];

            if (formData.images.length > 0) {
                const successfulParts = formData.images.slice(0, 5).map(url => { // Limit to 5 images
                    try {
                        return { inlineData: parseDataUrl(url) };
                    } catch (e) {
                        console.warn(`Could not process data URL for AI:`, e);
                        setGenerationError(`Could not process a local image. It might be corrupted.`);
                        return null;
                    }
                }).filter((p): p is { inlineData: { data: string; mimeType: string; } } => p !== null);
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

     const handleRewriteDescriptionWithAI = async () => {
        if (selectedImageUrls.length === 0) return;
        setIsRewritingDescription(true);
        setGenerationError(null);
        try {
            if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const textPrompt = `You are an expert art critic. Based on the style name '${formData.name}' and the following reference image(s), write a new, concise, and insightful description for this style. Focus on capturing the key visual characteristics.`;
            
            const imageParts = selectedImageUrls.map(url => ({ inlineData: parseDataUrl(url) }));
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [{ text: textPrompt }, ...imageParts] },
            });
            
            setFormData(prev => ({ ...prev, description: response.text.trim() }));
        } catch (error) {
            console.error("Description rewrite failed:", error);
            setGenerationError(`Failed to rewrite description. ${error instanceof Error ? error.message : 'Please check console for details.'}`);
        } finally {
            setIsRewritingDescription(false);
        }
    };

    const handleRecalculateScoresWithAI = async () => {
        if (selectedImageUrls.length === 0 || axes.length === 0) return;
        setIsRecalculatingScores(true);
        setGenerationError(null);
        try {
            if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const axesDescriptions = axes.map(a => `- ${a.name}: ${a.description}`).join('\n');
            const textPrompt = `You are an expert art critic. Analyze the style named '${formData.name}' with the description "${formData.description}", based on the provided reference image(s).

Your task is to provide a score from ${AXIS_SCORE_MIN} to ${AXIS_SCORE_MAX} (can be a decimal) for each of the following axes:
${axesDescriptions}

Return your scores in a JSON object format, where the keys are the exact axis names provided and the values are the numeric scores.`;

            const imageParts = selectedImageUrls.map(url => ({ inlineData: parseDataUrl(url) }));

            const properties: Record<string, { type: Type.NUMBER, description: string }> = {};
            axes.forEach(axis => {
                properties[axis.name] = {
                    type: Type.NUMBER,
                    description: `A score from ${AXIS_SCORE_MIN} to ${AXIS_SCORE_MAX} for the '${axis.name}' axis.`
                };
            });
            const schema = {
                type: Type.OBJECT,
                properties: properties,
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [{ text: textPrompt }, ...imageParts] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                },
            });

            const parsedScores = JSON.parse(response.text);
            const nameToIdMap = new Map(axes.map(a => [a.name, a.id]));
            const newScores = { ...formData.scores };

            // FIX: Replaced Object.entries with a for...in loop to safely iterate over the parsed JSON object.
            // This avoids type errors when `Object.entries` is used on an object of a general type.
            if (parsedScores && typeof parsedScores === 'object' && !Array.isArray(parsedScores)) {
                for (const axisName in parsedScores) {
                    if (Object.prototype.hasOwnProperty.call(parsedScores, axisName)) {
                        const score = (parsedScores as Record<string, unknown>)[axisName];
                        const axisId = nameToIdMap.get(axisName);
                        if (axisId && typeof score === 'number') {
                            // Clamp the score to the valid range just in case
                            newScores[axisId] = Math.max(AXIS_SCORE_MIN, Math.min(AXIS_SCORE_MAX, score));
                        }
                    }
                }
            }
            setFormData(prev => ({ ...prev, scores: newScores }));

        } catch (error) {
            console.error("Score recalculation failed:", error);
            setGenerationError(`Failed to recalculate scores. ${error instanceof Error ? error.message : 'Please check console for details.'}`);
        } finally {
            setIsRecalculatingScores(false);
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
            
            const prompt = `${formData.generationPrompt}, in the style of '${formData.name}'. Style description: ${formData.description}`;
            
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
                         {selectedImageUrls.length > 0 && (
                            <button
                                type="button"
                                onClick={handleRewriteDescriptionWithAI}
                                disabled={isRewritingDescription}
                                className="w-full mt-2 px-3 py-2 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed"
                            >
                                <BotMessageSquareIcon className="mr-2 h-4 w-4" />
                                {isRewritingDescription ? 'Rewriting...' : `Rewrite Description with AI (using ${selectedImageUrls.length} selected image${selectedImageUrls.length > 1 ? 's' : ''})`}
                            </button>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Generation Prompt</label>
                        <textarea
                            name="generationPrompt"
                            value={formData.generationPrompt}
                            onChange={handleInputChange}
                            rows={3}
                            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2"
                            placeholder="What to generate in this style. e.g., 'A photorealistic cat wearing a tiny hat.'"
                        />
                    </div>
                </fieldset>
                
                 {/* --- SCORE SECTION --- */}
                <fieldset className="space-y-3">
                    <legend className="text-xl font-semibold">2. Score Style</legend>
                     {selectedImageUrls.length > 0 && (
                        <button
                            type="button"
                            onClick={handleRecalculateScoresWithAI}
                            disabled={isRecalculatingScores}
                            className="w-full mb-3 px-3 py-2 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            <BotMessageSquareIcon className="mr-2 h-4 w-4" />
                            {isRecalculatingScores ? 'Recalculating...' : `Recalculate Scores with AI (using ${selectedImageUrls.length} selected image${selectedImageUrls.length > 1 ? 's' : ''})`}
                        </button>
                    )}
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
                     <p className="text-sm text-gray-400 -mt-2">Select images to use them as references for AI analysis.</p>
                     <div>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="Add reference image URL..."
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
                                className="flex-1 bg-gray-700 border border-gray-600 rounded-md p-2"
                            />
                            <button 
                                type="button" 
                                onClick={handleAddImage} 
                                disabled={imageAddStatus.loading}
                                title="Add image from URL" 
                                className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 flex items-center justify-center disabled:bg-gray-500"
                            >
                                {imageAddStatus.loading ? <RefreshCwIcon className="animate-spin" /> : <PlusIcon />}
                            </button>
                        </div>
                        {imageAddStatus.error && <p className="text-red-400 text-sm mt-1">{imageAddStatus.error}</p>}
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
                        {formData.images.map((url, index) => {
                            const isSelected = selectedImageUrls.includes(url);
                            return (
                                <div key={url.substring(0, 50) + index} className="relative group aspect-square">
                                    <img 
                                        src={url} 
                                        alt={`Style image ${index + 1}`} 
                                        className={`rounded-md w-full h-full object-cover transition-all ${isSelected ? 'ring-4 ring-blue-500' : ''}`} 
                                        onClick={() => onViewImages(formData.images, index)} 
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                                        <button type="button" title="Select for AI Analysis" onClick={(e) => { e.stopPropagation(); handleToggleImageSelection(url); }} className={`p-2 rounded-full hover:bg-black/50 ${isSelected ? 'text-blue-400' : 'text-white'}`}>
                                            <CheckCircleIcon />
                                        </button>
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
                            )
                        })}
                    </div>
                </fieldset>
            </form>
        </Modal>
    );
};

export default StyleEditorModal;