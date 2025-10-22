import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI } from '@google/genai';
import type { SpaceData, Style, Axis, ProjectionMode } from './types';
import { INITIAL_DATA } from './constants';
import Sidebar from './components/Sidebar';
import Visualization from './components/Visualization';
import StyleEditorModal from './components/StyleEditorModal';
import AxisEditorModal from './components/AxisEditorModal';
import ScoringWizardModal from './components/ScoringWizardModal';
import ImageViewerModal from './components/ImageViewerModal';
import { downloadJson, uploadJson } from './utils/fileUtils';
import { getSpaceDataFromDB, setSpaceDataInDB, clearSpaceDataFromDB } from './utils/dbUtils';
import { SparklesIcon } from './components/icons';


const App: React.FC = () => {
    const [spaceData, setSpaceData] = useState<SpaceData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [loadingMessage, setLoadingMessage] = useState<string>('Loading project data...');
    const [dimension, setDimension] = useState<1 | 2 | 3>(2);
    const [activeAxisIds, setActiveAxisIds] = useState<(string | null)[]>([null, null, null]);
    
    // Visualization modes
    const [projectionMode, setProjectionMode] = useState<ProjectionMode>('manual');
    const [umapAxisIds, setUmapAxisIds] = useState<string[]>([]);

    const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);

    // Modal States
    const [editingStyle, setEditingStyle] = useState<Style | null>(null);
    const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
    
    const [editingAxis, setEditingAxis] = useState<Axis | null>(null);
    const [isAxisModalOpen, setIsAxisModalOpen] = useState(false);

    const [scoringWizardAxis, setScoringWizardAxis] = useState<Axis | null>(null);

    const [viewingImages, setViewingImages] = useState<{ images: string[], initialIndex: number } | null>(null);
    
    // Generation states
    const [isGenerationPaused, setIsGenerationPaused] = useState<boolean>(false);
    const [isResuming, setIsResuming] = useState<boolean>(false);
    const [resumeStatus, setResumeStatus] = useState<string | null>(null);

    const updateSpaceData = useCallback(async (data: SpaceData | null) => {
        setSpaceData(data);
        if (data) {
            try {
                await setSpaceDataInDB(data);
            } catch (error) {
                console.error("Failed to save data to IndexedDB", error);
                alert("Could not save project data. The browser's storage might be full or corrupted.");
            }
        }
    }, []);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                const savedData = await getSpaceDataFromDB();
                if (savedData) {
                    setSpaceData(savedData);
                    const hasMissingImages = savedData.styles.some(s => s.images.length === 0);
                    if (hasMissingImages) {
                        setIsGenerationPaused(true);
                    }
                    setIsLoading(false);
                    return;
                }
        
                setLoadingMessage('Initializing project...');
                if (!process.env.API_KEY) {
                    console.warn("API_KEY not found. Using data without images. Please set the API_KEY environment variable for image generation.");
                    const dataWithEmptyImages = {
                        ...INITIAL_DATA,
                        styles: INITIAL_DATA.styles.map(s => ({ ...s, images: [] }))
                    };
                    await updateSpaceData(dataWithEmptyImages);
                    setIsLoading(false);
                    return;
                }

                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const initialStyles = [...INITIAL_DATA.styles];
                const processedStyles: Style[] = [];
                let generationFailed = false;

                for (let i = 0; i < initialStyles.length; i++) {
                    const style = initialStyles[i];
                    setLoadingMessage(`Generating image ${i + 1} of ${initialStyles.length}: ${style.name}`);
                    try {
                        const prompt = `A high-quality, artistic photograph of a single cup in the style of '${style.name}'. Style description: ${style.description}`;
                        const response = await ai.models.generateImages({
                            model: 'imagen-4.0-generate-001',
                            prompt: prompt,
                            config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: '1:1' }
                        });

                        if (response.generatedImages && response.generatedImages.length > 0) {
                            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
                            const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                            processedStyles.push({ ...style, images: [imageUrl], coverImageIndex: 0 });
                        } else {
                             console.warn(`Image generation skipped for ${style.name}: No image returned.`);
                            processedStyles.push({ ...style, images: [] });
                        }
                    } catch (error) {
                        console.error(`Failed to generate image for ${style.name}, pausing generation:`, error);
                        processedStyles.push({ ...style, images: [] }); // Add the failed one without image
                        setIsGenerationPaused(true);
                        generationFailed = true;
                        break; // Exit the loop
                    }
                    // Add a delay to avoid hitting API rate limits
                    await new Promise(resolve => setTimeout(resolve, 1100));
                }

                let finalStyles = processedStyles;
                if (generationFailed) {
                    // If we broke out, add the remaining unprocessed styles
                    const remainingStyles = INITIAL_DATA.styles.slice(processedStyles.length).map(s => ({ ...s, images: [] }));
                    finalStyles = [...processedStyles, ...remainingStyles];
                }

                const newSpaceData = { ...INITIAL_DATA, axes: INITIAL_DATA.axes, styles: finalStyles };
                await updateSpaceData(newSpaceData);

            } catch (error) {
                console.error("Failed to initialize app with generated images, using default data.", error);
                alert("An unexpected error occurred during initialization. Please check the console for details.");
                const dataWithEmptyImages = {
                    ...INITIAL_DATA,
                    styles: INITIAL_DATA.styles.map(s => ({ ...s, images: [] }))
                };
                await updateSpaceData(dataWithEmptyImages);
            } finally {
                setIsLoading(false);
                setLoadingMessage('Loading project data...'); // Reset message
            }
        };

        initializeApp();
    }, [updateSpaceData]);

     useEffect(() => {
        if (spaceData) {
            setActiveAxisIds([
                spaceData.axes[0]?.id || null, 
                spaceData.axes[1]?.id || null,
                spaceData.axes[2]?.id || null,
            ]);
            // When data loads, initialize UMAP axes to all available axes
            setUmapAxisIds(spaceData.axes.map(a => a.id));
        }
    }, [spaceData]);


    const handleSaveStyle = (styleToSave: Style) => {
        if (!spaceData) return;
        const existing = spaceData.styles.find(s => s.id === styleToSave.id);
        const newSpaceData = existing
            ? { ...spaceData, styles: spaceData.styles.map(s => s.id === styleToSave.id ? styleToSave : s) }
            : { ...spaceData, styles: [...spaceData.styles, styleToSave] };
        updateSpaceData(newSpaceData);
        setIsStyleModalOpen(false);
        setEditingStyle(null);
    };

    const handleDeleteStyle = (styleId: string) => {
        if (!spaceData) return;
        const newSpaceData = {...spaceData, styles: spaceData.styles.filter(s => s.id !== styleId)};
        updateSpaceData(newSpaceData);
        if(selectedStyleId === styleId) setSelectedStyleId(null);
    };

    const handleSaveAxis = (axisToSave: Axis) => {
        if (!spaceData) return;
        let isNew = false;
        
        const existing = spaceData.axes.find(a => a.id === axisToSave.id);
        let newSpaceData;
        if (existing) {
            newSpaceData = { ...spaceData, axes: spaceData.axes.map(a => a.id === axisToSave.id ? axisToSave : a) };
        } else {
            isNew = true;
            newSpaceData = { ...spaceData, axes: [...spaceData.axes, axisToSave] };
            setUmapAxisIds(prev => [...prev, axisToSave.id]); // Also add to UMAP selection
        }
        updateSpaceData(newSpaceData);
        
        setIsAxisModalOpen(false);
        setEditingAxis(null);
        if(isNew) {
            setScoringWizardAxis(axisToSave);
        }
    };

    const handleDeleteAxis = (axisId: string) => {
        if (!spaceData) return;
        const newAxes = spaceData.axes.filter(a => a.id !== axisId);
        const newStyles = spaceData.styles.map(style => {
            const newScores = { ...style.scores };
            delete newScores[axisId];
            return { ...style, scores: newScores };
        });
        const newSpaceData = { axes: newAxes, styles: newStyles };
        updateSpaceData(newSpaceData);
        setActiveAxisIds(prev => prev.map(id => id === axisId ? null : id));
        setUmapAxisIds(prev => prev.filter(id => id !== axisId));
    };

    const handleScoringWizardComplete = (updatedStyles: Style[]) => {
        if (!spaceData) return;
        const newSpaceData = { ...spaceData, styles: updatedStyles };
        updateSpaceData(newSpaceData);
        setScoringWizardAxis(null);
    };

    const openStyleModal = useCallback((styleId: string | null) => {
        if (!spaceData) return;
        if (styleId) {
            const style = spaceData.styles.find(s => s.id === styleId);
            if (style) setEditingStyle(style);
        } else {
            setEditingStyle({ id: uuidv4(), name: 'New Style', scores: {}, images: [], description: '', coverImageIndex: 0 });
        }
        setIsStyleModalOpen(true);
    }, [spaceData]);
    
    const openAxisModal = useCallback((axisId: string | null) => {
        if (!spaceData) return;
        if(axisId) {
            const axis = spaceData.axes.find(a => a.id === axisId);
            if (axis) setEditingAxis(axis);
        } else {
            setEditingAxis({ id: uuidv4(), name: 'New Axis', description: '', color: '#FFFFFF' });
        }
        setIsAxisModalOpen(true);
    }, [spaceData]);
    
    const handleSaveProject = useCallback(() => {
        if(spaceData) {
            downloadJson(spaceData, 'styles-project.json');
        }
    }, [spaceData]);

    const handleLoadProject = useCallback(async () => {
        try {
            const data = await uploadJson<SpaceData>();
            if (data && Array.isArray(data.axes) && Array.isArray(data.styles)) {
                await updateSpaceData(data);
                setDimension(2);
                setSelectedStyleId(null);
            } else {
                alert('Invalid project file format.');
            }
        } catch (error) {
            console.error('Failed to load project:', error);
            alert('Error loading file. See console for details.');
        }
    }, [updateSpaceData]);

    const handleResetProject = useCallback(async () => {
        if (window.confirm("Are you sure you want to reset the project? This will delete all your current styles and axes and cannot be undone.")) {
            try {
                await clearSpaceDataFromDB();
                window.location.reload(); 
            } catch (error) {
                console.error("Failed to reset project:", error);
                alert("Could not reset project. See console for details.");
            }
        }
    }, []);

    const handlePointClick = useCallback((styleId: string) => {
        setSelectedStyleId(styleId);
    }, []);

    const handlePointDoubleClick = useCallback((styleId: string) => {
        openStyleModal(styleId);
    }, [openStyleModal]);

    const handleResumeGeneration = useCallback(async () => {
        if (!spaceData || isResuming) return;
    
        setIsResuming(true);
        setResumeStatus('Starting generation...');
        
        const stylesToUpdate = spaceData.styles.filter(s => s.images.length === 0);
        if (stylesToUpdate.length === 0) {
            setIsResuming(false);
            setIsGenerationPaused(false);
            setResumeStatus('All images already generated.');
            setTimeout(() => setResumeStatus(null), 3000);
            return;
        }
    
        try {
            if (!process.env.API_KEY) {
                throw new Error("API_KEY not found.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            let failedAgain = false;
    
            for (let i = 0; i < stylesToUpdate.length; i++) {
                const styleToUpdate = stylesToUpdate[i];
                setResumeStatus(`Generating for ${styleToUpdate.name} (${i + 1}/${stylesToUpdate.length})`);
                
                try {
                    const prompt = `A high-quality, artistic photograph of a single cup in the style of '${styleToUpdate.name}'. Style description: ${styleToUpdate.description}`;
                    const response = await ai.models.generateImages({
                        model: 'imagen-4.0-generate-001',
                        prompt: prompt,
                        config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: '1:1' }
                    });
    
                    if (response.generatedImages && response.generatedImages.length > 0) {
                        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
                        const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                        
                        setSpaceData(prevData => {
                            if (!prevData) return null;
                            const updatedStyles = prevData.styles.map(s => 
                                s.id === styleToUpdate.id 
                                    ? { ...s, images: [imageUrl], coverImageIndex: 0 } 
                                    : s
                            );
                            const newData = { ...prevData, styles: updatedStyles };
                            setSpaceDataInDB(newData).catch(e => console.error("DB update failed during resume:", e));
                            return newData;
                        });
                    } else {
                         console.warn(`Image generation skipped for ${styleToUpdate.name}: No image returned.`);
                    }
                } catch (error) {
                    console.error(`Failed to generate image for ${styleToUpdate.name}, pausing again:`, error);
                    failedAgain = true;
                    break; 
                }
                await new Promise(resolve => setTimeout(resolve, 1100)); // Rate limit
            }
            
            if (failedAgain) {
                setIsGenerationPaused(true);
                setResumeStatus(`Generation paused. Try again later.`);
            } else {
                setIsGenerationPaused(false);
                setResumeStatus(`Generation complete!`);
                setTimeout(() => setResumeStatus(null), 5000);
            }
    
        } catch (error) {
            console.error("An unexpected error occurred during resume:", error);
            setIsGenerationPaused(true);
            setResumeStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsResuming(false);
        }
    }, [spaceData, isResuming]);
    
    if (isLoading || !spaceData) {
        return (
            <div className="flex items-center justify-center h-screen w-screen bg-gray-900 text-white">
                <div className="text-center">
                    <SparklesIcon className="w-16 h-16 mx-auto animate-pulse text-blue-400" />
                    <p className="mt-4 text-xl">{loadingMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen bg-gray-900 font-sans">
            <Sidebar
                spaceData={spaceData}
                dimension={dimension}
                setDimension={setDimension}
                projectionMode={projectionMode}
                setProjectionMode={setProjectionMode}
                activeAxisIds={activeAxisIds}
                setActiveAxisIds={setActiveAxisIds}
                umapAxisIds={umapAxisIds}
                setUmapAxisIds={setUmapAxisIds}
                selectedStyleId={selectedStyleId}
                onOpenStyleModal={openStyleModal}
                onOpenAxisModal={openAxisModal}
                onDeleteStyle={handleDeleteStyle}
                onDeleteAxis={handleDeleteAxis}
                onSaveProject={handleSaveProject}
                onLoadProject={handleLoadProject}
                onResetProject={handleResetProject}
                setSelectedStyleId={setSelectedStyleId}
                isGenerationPaused={isGenerationPaused}
                isResuming={isResuming}
                resumeStatus={resumeStatus}
                onResumeGeneration={handleResumeGeneration}
            />
            <main className="flex-1 flex flex-col p-4 bg-black">
                <Visualization
                    spaceData={spaceData}
                    dimension={dimension}
                    projectionMode={projectionMode}
                    activeAxisIds={activeAxisIds.slice(0, dimension).filter((id): id is string => id !== null)}
                    umapAxisIds={umapAxisIds}
                    selectedStyleId={selectedStyleId}
                    onPointClick={handlePointClick}
                    onPointDoubleClick={handlePointDoubleClick}
                />
            </main>
            
            {isStyleModalOpen && editingStyle && (
                <StyleEditorModal
                    style={editingStyle}
                    axes={spaceData.axes}
                    onSave={handleSaveStyle}
                    onClose={() => { setIsStyleModalOpen(false); setEditingStyle(null); }}
                    onViewImages={(images, initialIndex) => setViewingImages({images, initialIndex})}
                />
            )}

            {isAxisModalOpen && editingAxis && (
                <AxisEditorModal
                    axis={editingAxis}
                    onSave={handleSaveAxis}
                    onClose={() => { setIsAxisModalOpen(false); setEditingAxis(null); }}
                />
            )}

            {scoringWizardAxis && (
                <ScoringWizardModal
                    axis={scoringWizardAxis}
                    styles={spaceData.styles}
                    onComplete={handleScoringWizardComplete}
                    onClose={() => setScoringWizardAxis(null)}
                />
            )}

            {viewingImages && (
                <ImageViewerModal
                    images={viewingImages.images}
                    initialIndex={viewingImages.initialIndex}
                    onClose={() => setViewingImages(null)}
                />
            )}
        </div>
    );
};

export default App;