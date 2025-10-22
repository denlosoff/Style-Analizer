import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI } from '@google/genai';
import { UMAP } from 'umap-js';
import type { SpaceData, Style, Axis, ProjectionMode, Filter } from './types';
import { INITIAL_DATA, AXIS_SCORE_MIN, AXIS_SCORE_MAX } from './constants';
import Sidebar from './components/Sidebar';
import Visualization from './components/Visualization';
import StyleEditorModal from './components/StyleEditorModal';
import AxisEditorModal from './components/AxisEditorModal';
import ScoringWizardModal from './components/ScoringWizardModal';
import ImageViewerModal from './components/ImageViewerModal';
import { downloadJson, uploadJson } from './utils/fileUtils';
import { getSpaceDataFromDB, setSpaceDataInDB, clearSpaceDataFromDB } from './utils/dbUtils';
import { SparklesIcon, PlusIcon, TrashIcon, EditIcon } from './components/icons';
import { kmeans } from './utils/clustering';
import { pca } from './utils/pca';

const MIDPOINT_SCORE = (AXIS_SCORE_MAX + AXIS_SCORE_MIN) / 2;

interface RightSidebarProps {
    spaceData: SpaceData;
    selectedStyleId: string | null;
    setSelectedStyleId: (id: string | null) => void;
    onOpenStyleModal: (styleId: string | null) => void;
    onOpenAxisModal: (axisId: string | null) => void;
    onDeleteStyle: (styleId: string) => void;
    onDeleteAxis: (axisId: string) => void;
    isFilteringEnabled: boolean;
    setIsFilteringEnabled: (enabled: boolean) => void;
    filters: Filter[];
    setFilters: (filters: Filter[]) => void;
    filteredStyleIds: string[];
}

const RightSidebar: React.FC<RightSidebarProps> = ({
    spaceData,
    selectedStyleId,
    setSelectedStyleId,
    onOpenStyleModal,
    onOpenAxisModal,
    onDeleteStyle,
    onDeleteAxis,
    isFilteringEnabled,
    setIsFilteringEnabled,
    filters,
    setFilters,
    filteredStyleIds,
}) => {
    const handleAddFilter = () => {
        const firstAxisId = spaceData.axes[0]?.id;
        if (!firstAxisId) {
            alert("Create an axis before adding a filter.");
            return;
        }
        setFilters([
            ...filters,
            {
                id: uuidv4(),
                axisId: firstAxisId,
                min: AXIS_SCORE_MIN,
                max: AXIS_SCORE_MAX
            }
        ]);
    };

    const handleUpdateFilter = (id: string, newValues: Partial<Filter>) => {
        setFilters(filters.map(f => f.id === id ? { ...f, ...newValues } : f));
    };
    
    const handleRemoveFilter = (id: string) => {
        setFilters(filters.filter(f => f.id !== id));
    };

    return (
        <aside className="w-96 bg-gray-800 p-4 flex flex-col space-y-4 overflow-y-auto">
             {/* Filter Controls */}
             <div className="bg-gray-700 p-3 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center">
                        Filter Controls
                    </h2>
                    <button
                        onClick={() => setIsFilteringEnabled(!isFilteringEnabled)}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isFilteringEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
                        aria-pressed={isFilteringEnabled}
                    >
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isFilteringEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
                {isFilteringEnabled && (
                    <div className="space-y-2">
                        {filters.map(filter => (
                            <div key={filter.id} className="bg-gray-900/50 p-2 rounded space-y-2">
                                <div className="flex items-center justify-between">
                                    <select
                                        value={filter.axisId}
                                        onChange={(e) => handleUpdateFilter(filter.id, { axisId: e.target.value })}
                                        className="bg-gray-700 border border-gray-600 rounded-md p-1 text-sm w-full mr-2"
                                    >
                                        {spaceData.axes.map(axis => <option key={axis.id} value={axis.id}>{axis.name}</option>)}
                                    </select>
                                    <button onClick={() => handleRemoveFilter(filter.id)} className="p-1 text-gray-400 hover:text-red-400">
                                       <TrashIcon />
                                    </button>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-400">
                                    <input
                                        type="number"
                                        value={filter.min}
                                        min={AXIS_SCORE_MIN} max={AXIS_SCORE_MAX} step="0.1"
                                        onChange={(e) => handleUpdateFilter(filter.id, { min: parseFloat(e.target.value) || AXIS_SCORE_MIN })}
                                        className="bg-gray-700 border border-gray-600 rounded-md p-1 text-sm w-full text-center text-white"
                                    />
                                    <span>to</span>
                                    <input
                                        type="number"
                                        value={filter.max}
                                        min={AXIS_SCORE_MIN} max={AXIS_SCORE_MAX} step="0.1"
                                        onChange={(e) => handleUpdateFilter(filter.id, { max: parseFloat(e.target.value) || AXIS_SCORE_MAX })}
                                        className="bg-gray-700 border border-gray-600 rounded-md p-1 text-sm w-full text-center text-white"
                                    />
                                </div>
                            </div>
                        ))}
                        <button onClick={handleAddFilter} className="w-full text-sm py-2 rounded-md bg-blue-600 hover:bg-blue-700 flex items-center justify-center">
                            <PlusIcon className="mr-1 h-4 w-4" /> Add Filter
                        </button>
                    </div>
                )}
            </div>

            {/* Axes List */}
            <div className="bg-gray-700 p-3 rounded-lg flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold">Axes ({spaceData.axes.length})</h2>
                    <button onClick={() => onOpenAxisModal(null)} className="p-1 rounded-md bg-blue-600 hover:bg-blue-700"><PlusIcon /></button>
                </div>
                <ul className="space-y-1 overflow-y-auto flex-1">
                    {spaceData.axes.map(axis => (
                        <li key={axis.id} className="flex items-center justify-between p-2 rounded-md bg-gray-800 hover:bg-gray-600">
                            <span className="flex items-center">
                                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: axis.color }}></span>
                                {axis.name}
                            </span>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => onOpenAxisModal(axis.id)} className="p-1 text-gray-400 hover:text-white"><EditIcon /></button>
                                <button onClick={() => onDeleteAxis(axis.id)} className="p-1 text-gray-400 hover:text-red-400"><TrashIcon /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Styles List */}
            <div className="bg-gray-700 p-3 rounded-lg flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold">Styles ({isFilteringEnabled ? `${filteredStyleIds.length} / ` : ''}{spaceData.styles.length})</h2>
                    <button onClick={() => onOpenStyleModal(null)} className="p-1 rounded-md bg-blue-600 hover:bg-blue-700"><PlusIcon /></button>
                </div>
                <ul className="space-y-1 overflow-y-auto flex-1">
                    {spaceData.styles.map(style => (
                        <li 
                            key={style.id}
                            onClick={() => setSelectedStyleId(style.id)}
                            onDoubleClick={() => onOpenStyleModal(style.id)}
                             className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-all ${selectedStyleId === style.id ? 'bg-blue-800' : 'bg-gray-800 hover:bg-gray-600'} ${!filteredStyleIds.includes(style.id) ? 'opacity-40' : ''}`}
                        >
                            <span>{style.name}</span>
                            <div className="flex items-center space-x-2">
                                <button onClick={(e) => { e.stopPropagation(); onOpenStyleModal(style.id); }} className="p-1 text-gray-400 hover:text-white"><EditIcon /></button>
                                <button onClick={(e) => { e.stopPropagation(); onDeleteStyle(style.id); }} className="p-1 text-gray-400 hover:text-red-400"><TrashIcon /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
};


const App: React.FC = () => {
    const [spaceData, setSpaceData] = useState<SpaceData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [loadingMessage, setLoadingMessage] = useState<string>('Loading project data...');
    const [dimension, setDimension] = useState<1 | 2 | 3>(2);
    const [activeAxisIds, setActiveAxisIds] = useState<(string | null)[]>([null, null, null]);
    
    // Projection modes & state
    const [projectionMode, setProjectionMode] = useState<ProjectionMode>('manual');

    // UMAP State
    const [umapAxisIds, setUmapAxisIds] = useState<string[]>([]);
    const [isUmapClusteringEnabled, setIsUmapClusteringEnabled] = useState<boolean>(false);
    const [umapClusterCount, setUmapClusterCount] = useState<number>(5);
    const [umapClusterAssignments, setUmapClusterAssignments] = useState<number[] | null>(null);
    const [umapClusterNames, setUmapClusterNames] = useState<Record<number, string>>({});
    const [umapData, setUmapData] = useState<number[][] | null>(null);
    const [isCalculatingUmap, setIsCalculatingUmap] = useState(false);
    const [umapError, setUmapError] = useState<string | null>(null);

    // PCA State
    const [pcaAxisIds, setPcaAxisIds] = useState<string[]>([]);
    const [isPcaClusteringEnabled, setIsPcaClusteringEnabled] = useState<boolean>(false);
    const [pcaClusterCount, setPcaClusterCount] = useState<number>(5);
    const [pcaClusterAssignments, setPcaClusterAssignments] = useState<number[] | null>(null);
    const [pcaClusterNames, setPcaClusterNames] = useState<Record<number, string>>({});
    const [pcaData, setPcaData] = useState<number[][] | null>(null);
    const [isCalculatingPca, setIsCalculatingPca] = useState(false);
    const [pcaError, setPcaError] = useState<string | null>(null);


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

    // Filtering State
    const [isFilteringEnabled, setIsFilteringEnabled] = useState<boolean>(false);
    const [filters, setFilters] = useState<Filter[]>([]);

    const filteredStyleIds = useMemo(() => {
        if (!isFilteringEnabled || filters.length === 0 || !spaceData) {
            return spaceData?.styles.map(s => s.id) || [];
        }

        const activeFilters = filters.filter(f => f.axisId);
        if (activeFilters.length === 0) {
            return spaceData.styles.map(s => s.id);
        }

        return spaceData.styles
            .filter(style => {
                return activeFilters.every(filter => {
                    const score = style.scores[filter.axisId] ?? MIDPOINT_SCORE;
                    return score >= filter.min && score <= filter.max;
                });
            })
            .map(style => style.id);
    }, [spaceData, isFilteringEnabled, filters]);

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
            // When data loads, initialize projection axes to all available axes
            const allAxisIds = spaceData.axes.map(a => a.id);
            setUmapAxisIds(allAxisIds);
            setPcaAxisIds(allAxisIds);
        }
    }, [spaceData]);

    // Cleanup projection state when mode changes
    useEffect(() => {
        if (projectionMode !== 'umap') {
            setIsUmapClusteringEnabled(false);
            setUmapData(null);
            setUmapError(null);
        }
        if (projectionMode !== 'pca') {
            setIsPcaClusteringEnabled(false);
            setPcaData(null);
            setPcaError(null);
        }
    }, [projectionMode]);
    
    // Recalculate UMAP embedding when dependencies change
    useEffect(() => {
        if (projectionMode !== 'umap' || umapAxisIds.length === 0 || !spaceData) {
            setUmapData(null);
            setUmapError(null);
            return;
        }

        const calculateUmap = async () => {
            setIsCalculatingUmap(true);
            setUmapData(null);
            setUmapError(null);

            const dataMatrix = spaceData.styles.map(style =>
                umapAxisIds.map(axisId => style.scores[axisId] ?? MIDPOINT_SCORE)
            );

            if (dataMatrix.length < 3 || umapAxisIds.length < 2) {
                setUmapError(`UMAP requires at least 3 styles and 2 source axes.`);
                setIsCalculatingUmap(false);
                return;
            }
            
            try {
                await new Promise(resolve => setTimeout(resolve, 50));

                const umap = new UMAP({
                    nComponents: dimension,
                    nNeighbors: Math.min(15, dataMatrix.length - 1),
                    minDist: 0.1,
                    spread: 1.0,
                });
                
                const embedding = await umap.fitAsync(dataMatrix);
                setUmapData(embedding);

            } catch (error) {
                console.error("UMAP calculation failed", error);
                setUmapError(`UMAP calculation failed. See console for details.`);
            } finally {
                setIsCalculatingUmap(false);
            }
        };

        calculateUmap();
    }, [projectionMode, umapAxisIds, spaceData, dimension]);

    // Recalculate PCA embedding when dependencies change
    useEffect(() => {
        if (projectionMode !== 'pca' || pcaAxisIds.length === 0 || !spaceData) {
            setPcaData(null);
            setPcaError(null);
            return;
        }

        const calculatePca = async () => {
            setIsCalculatingPca(true);
            setPcaData(null);
            setPcaError(null);

            const dataMatrix = spaceData.styles.map(style =>
                pcaAxisIds.map(axisId => style.scores[axisId] ?? MIDPOINT_SCORE)
            );

            if (dataMatrix.length < 2 || pcaAxisIds.length < dimension) {
                setPcaError(`PCA requires at least 2 styles and ${dimension} source axes for ${dimension}D projection.`);
                setIsCalculatingPca(false);
                return;
            }
            
            try {
                await new Promise(resolve => setTimeout(resolve, 50));
                
                const embedding = pca(dataMatrix, dimension);
                if (!embedding) {
                    throw new Error("PCA calculation returned null.");
                }
                setPcaData(embedding);

            } catch (error) {
                console.error("PCA calculation failed", error);
                setPcaError(`PCA calculation failed. See console for details.`);
            } finally {
                setIsCalculatingPca(false);
            }
        };

        calculatePca();
    }, [projectionMode, pcaAxisIds, spaceData, dimension]);

    // Recalculate UMAP clusters when dependencies change
    useEffect(() => {
        if (projectionMode === 'umap' && isUmapClusteringEnabled && umapData) {
            if (umapData.length > umapClusterCount && umapClusterCount > 1) {
                const { clusters } = kmeans(umapData, umapClusterCount);
                setUmapClusterAssignments(clusters);
            } else {
                setUmapClusterAssignments(null);
            }
        } else {
            setUmapClusterAssignments(null);
        }
    }, [isUmapClusteringEnabled, umapClusterCount, umapData, projectionMode]);

    // Recalculate PCA clusters when dependencies change
    useEffect(() => {
        if (projectionMode === 'pca' && isPcaClusteringEnabled && pcaData) {
            if (pcaData.length > pcaClusterCount && pcaClusterCount > 1) {
                const { clusters } = kmeans(pcaData, pcaClusterCount);
                setPcaClusterAssignments(clusters);
            } else {
                setPcaClusterAssignments(null);
            }
        } else {
            setPcaClusterAssignments(null);
        }
    }, [isPcaClusteringEnabled, pcaClusterCount, pcaData, projectionMode]);

    const handleSetUmapClusterCount = (count: number) => {
        setUmapClusterCount(count);
        setUmapClusterNames({});
    };

     const handleSetPcaClusterCount = (count: number) => {
        setPcaClusterCount(count);
        setPcaClusterNames({});
    };

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
            // Also add to projection selections
            setUmapAxisIds(prev => [...prev, axisToSave.id]);
            setPcaAxisIds(prev => [...prev, axisToSave.id]);
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
        const newSpaceData = { ...spaceData, axes: newAxes, styles: newStyles };
        updateSpaceData(newSpaceData);
        setActiveAxisIds(prev => prev.map(id => id === axisId ? null : id));
        setUmapAxisIds(prev => prev.filter(id => id !== axisId));
        setPcaAxisIds(prev => prev.filter(id => id !== axisId));
        setFilters(prev => prev.filter(f => f.axisId !== axisId));
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
    
    const isUmapMode = projectionMode === 'umap';
    const isPcaMode = projectionMode === 'pca';
    
    // Generic props for projection-based components
    const projectionData = isUmapMode ? umapData : (isPcaMode ? pcaData : null);
    const isClusteringEnabled = isUmapMode ? isUmapClusteringEnabled : (isPcaMode ? isPcaClusteringEnabled : false);
    const clusterAssignments = isUmapMode ? umapClusterAssignments : (isPcaMode ? pcaClusterAssignments : null);
    const clusterNames = isUmapMode ? umapClusterNames : (isPcaMode ? pcaClusterNames : {});
    
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
                
                projectionAxisIds={isUmapMode ? umapAxisIds : pcaAxisIds}
                setProjectionAxisIds={isUmapMode ? setUmapAxisIds : setPcaAxisIds}
                isClusteringEnabled={isClusteringEnabled}
                setIsClusteringEnabled={isUmapMode ? setIsUmapClusteringEnabled : setIsPcaClusteringEnabled}
                clusterCount={isUmapMode ? umapClusterCount : pcaClusterCount}
                setClusterCount={isUmapMode ? handleSetUmapClusterCount : handleSetPcaClusterCount}
                clusterAssignments={clusterAssignments}
                clusterNames={clusterNames}
                setClusterNames={isUmapMode ? setUmapClusterNames : setPcaClusterNames}
                projectionData={projectionData}

                onSaveProject={handleSaveProject}
                onLoadProject={handleLoadProject}
                onResetProject={handleResetProject}
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
                    
                    isClusteringEnabled={isClusteringEnabled}
                    clusterAssignments={clusterAssignments}
                    clusterNames={clusterNames}
                    projectionData={projectionData}
                    isCalculatingProjection={isUmapMode ? isCalculatingUmap : (isPcaMode ? isCalculatingPca : false)}
                    projectionError={isUmapMode ? umapError : (isPcaMode ? pcaError : null)}
                    filteredStyleIds={filteredStyleIds}

                    selectedStyleId={selectedStyleId}
                    onPointClick={handlePointClick}
                    onPointDoubleClick={handlePointDoubleClick}
                />
            </main>

            <RightSidebar
                spaceData={spaceData}
                selectedStyleId={selectedStyleId}
                setSelectedStyleId={setSelectedStyleId}
                onOpenStyleModal={openStyleModal}
                onOpenAxisModal={openAxisModal}
                onDeleteStyle={handleDeleteStyle}
                onDeleteAxis={handleDeleteAxis}
                isFilteringEnabled={isFilteringEnabled}
                setIsFilteringEnabled={setIsFilteringEnabled}
                filters={filters}
                setFilters={setFilters}
                filteredStyleIds={filteredStyleIds}
            />
            
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