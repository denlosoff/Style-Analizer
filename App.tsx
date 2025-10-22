import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI } from '@google/genai';
import type { SpaceData, Style, Axis } from './types';
import { INITIAL_DATA } from './constants';
import Sidebar from './components/Sidebar';
import Visualization from './components/Visualization';
import StyleEditorModal from './components/StyleEditorModal';
import AxisEditorModal from './components/AxisEditorModal';
import ScoringWizardModal from './components/ScoringWizardModal';
import ImageViewerModal from './components/ImageViewerModal';
import { downloadJson, uploadJson } from './utils/fileUtils';
import { getSpaceDataFromDB, setSpaceDataInDB } from './utils/dbUtils';
import { SparklesIcon } from './components/icons';


const App: React.FC = () => {
    const [spaceData, setSpaceData] = useState<SpaceData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [loadingMessage, setLoadingMessage] = useState<string>('Loading project data...');
    const [dimension, setDimension] = useState<1 | 2 | 3>(2);
    const [activeAxisIds, setActiveAxisIds] = useState<(string | null)[]>([null, null, null]);
    
    const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);

    // Modal States
    const [editingStyle, setEditingStyle] = useState<Style | null>(null);
    const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
    
    const [editingAxis, setEditingAxis] = useState<Axis | null>(null);
    const [isAxisModalOpen, setIsAxisModalOpen] = useState(false);

    const [scoringWizardAxis, setScoringWizardAxis] = useState<Axis | null>(null);

    const [viewingImages, setViewingImages] = useState<string[] | null>(null);
    
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
                    setIsLoading(false);
                    return;
                }
                
                setLoadingMessage('Generating initial style images... (this may take a moment)');
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
                
                const imagePromises = INITIAL_DATA.styles.map(style => {
                    const prompt = `A high-quality, artistic photograph of a single cup in the style of '${style.name}'. Style description: ${style.description}`;
                    return ai.models.generateImages({
                        model: 'imagen-4.0-generate-001',
                        prompt: prompt,
                        config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: '1:1' }
                    });
                });

                const imageResponses = await Promise.all(imagePromises);

                const newStyles = INITIAL_DATA.styles.map((style, index) => {
                    const response = imageResponses[index];
                    if (response.generatedImages && response.generatedImages.length > 0) {
                        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
                        const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                        return { ...style, images: [imageUrl], coverImageIndex: 0 };
                    }
                    return { ...style, images: [] };
                });

                const newSpaceData = { ...INITIAL_DATA, axes: INITIAL_DATA.axes, styles: newStyles };
                await updateSpaceData(newSpaceData);

            } catch (error) {
                console.error("Failed to initialize app with generated images, using default data.", error);
                if (error instanceof Error && error.message.includes('quota')) {
                    alert("Failed to save generated images because storage quota was exceeded. Please try clearing some browser storage.");
                }
                const dataWithEmptyImages = {
                    ...INITIAL_DATA,
                    styles: INITIAL_DATA.styles.map(s => ({ ...s, images: [] }))
                };
                await updateSpaceData(dataWithEmptyImages);
            } finally {
                setIsLoading(false);
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
    };

    const handleScoringWizardComplete = (updatedStyles: Style[]) => {
        if (!spaceData) return;
        const newSpaceData = { ...spaceData, styles: updatedStyles };
        updateSpaceData(newSpaceData);
        setScoringWizardAxis(null);
    };

    const openStyleModal = (styleId: string | null) => {
        if (!spaceData) return;
        if (styleId) {
            const style = spaceData.styles.find(s => s.id === styleId);
            if (style) setEditingStyle(style);
        } else {
            setEditingStyle({ id: uuidv4(), name: 'New Style', scores: {}, images: [], description: '', coverImageIndex: 0 });
        }
        setIsStyleModalOpen(true);
    };
    
    const openAxisModal = (axisId: string | null) => {
        if (!spaceData) return;
        if(axisId) {
            const axis = spaceData.axes.find(a => a.id === axisId);
            if (axis) setEditingAxis(axis);
        } else {
            setEditingAxis({ id: uuidv4(), name: 'New Axis', description: '', color: '#FFFFFF' });
        }
        setIsAxisModalOpen(true);
    };
    
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

    const handlePointClick = useCallback((styleId: string) => {
        setSelectedStyleId(styleId);
    }, []);

    const handlePointDoubleClick = useCallback((styleId: string) => {
        if (!spaceData) return;
        const style = spaceData.styles.find(s => s.id === styleId);
        if(style && style.images.length > 0) {
            setViewingImages(style.images);
        }
    }, [spaceData]);
    
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
                activeAxisIds={activeAxisIds}
                setActiveAxisIds={setActiveAxisIds}
                selectedStyleId={selectedStyleId}
                onOpenStyleModal={openStyleModal}
                onOpenAxisModal={openAxisModal}
                onDeleteStyle={handleDeleteStyle}
                onDeleteAxis={handleDeleteAxis}
                onSaveProject={handleSaveProject}
                onLoadProject={handleLoadProject}
                setSelectedStyleId={setSelectedStyleId}
            />
            <main className="flex-1 flex flex-col p-4 bg-black">
                <Visualization
                    spaceData={spaceData}
                    dimension={dimension}
                    activeAxisIds={activeAxisIds.slice(0, dimension).filter((id): id is string => id !== null)}
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
                    images={viewingImages}
                    onClose={() => setViewingImages(null)}
                />
            )}
        </div>
    );
};

export default App;