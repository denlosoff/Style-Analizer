import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { SpaceData, ProjectionMode, Style } from '../types';
import { findOptimalK } from '../utils/clustering';
import { PlusIcon, TrashIcon, EditIcon, FileDownIcon, FileUpIcon, ListIcon, ListTree, RefreshCwIcon, ChevronDownIcon, SparklesIcon } from './icons';

interface SidebarProps {
    spaceData: SpaceData;
    dimension: 1 | 2 | 3;
    setDimension: (dim: 1 | 2 | 3) => void;
    projectionMode: ProjectionMode;
    setProjectionMode: (mode: ProjectionMode) => void;
    activeAxisIds: (string | null)[];
    setActiveAxisIds: (ids: (string | null)[]) => void;
    umapAxisIds: string[];
    setUmapAxisIds: (ids: string[]) => void;
    isUmapClusteringEnabled: boolean;
    setIsUmapClusteringEnabled: (enabled: boolean) => void;
    umapClusterCount: number;
    setUmapClusterCount: (count: number) => void;
    clusterAssignments: number[] | null;
    umapClusterNames: Record<number, string>;
    setUmapClusterNames: (names: Record<number, string>) => void;
    umapData: number[][] | null;
    selectedStyleId: string | null;
    setSelectedStyleId: (id: string | null) => void;
    onOpenStyleModal: (styleId: string | null) => void;
    onOpenAxisModal: (axisId: string | null) => void;
    onDeleteStyle: (styleId: string) => void;
    onDeleteAxis: (axisId: string) => void;
    onSaveProject: () => void;
    onLoadProject: () => void;
    onResetProject: () => void;
    isGenerationPaused: boolean;
    isResuming: boolean;
    resumeStatus: string | null;
    onResumeGeneration: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    spaceData,
    dimension,
    setDimension,
    projectionMode,
    setProjectionMode,
    activeAxisIds,
    setActiveAxisIds,
    umapAxisIds,
    setUmapAxisIds,
    isUmapClusteringEnabled,
    setIsUmapClusteringEnabled,
    umapClusterCount,
    setUmapClusterCount,
    clusterAssignments,
    umapClusterNames,
    setUmapClusterNames,
    umapData,
    selectedStyleId,
    setSelectedStyleId,
    onOpenStyleModal,
    onOpenAxisModal,
    onDeleteStyle,
    onDeleteAxis,
    onSaveProject,
    onLoadProject,
    onResetProject,
    isGenerationPaused,
    isResuming,
    resumeStatus,
    onResumeGeneration,
}) => {
    const [isNamingClusters, setIsNamingClusters] = useState(false);
    const [isCalculatingK, setIsCalculatingK] = useState(false);

    const handleAxisChange = (index: number, value: string) => {
        const newAxisIds = [...activeAxisIds];
        newAxisIds[index] = value === 'none' ? null : value;
        setActiveAxisIds(newAxisIds);
    };

    const handleUmapAxisToggle = (axisId: string) => {
        setUmapAxisIds(prev =>
            prev.includes(axisId) ? prev.filter(id => id !== axisId) : [...prev, axisId]
        );
    };

    const handleCalculateK = async () => {
        if (!umapData) {
            alert("UMAP data not available. Please wait for the projection to be calculated.");
            return;
        }
        setIsCalculatingK(true);
        try {
            // Use a timeout to allow the loading state to render before blocking the main thread
            await new Promise(resolve => setTimeout(resolve, 50));
            const maxK = Math.min(15, spaceData.styles.length - 1);
            if (maxK < 2) {
                 alert("Not enough styles to calculate a cluster count.");
                 return;
            }
            const suggestedK = await findOptimalK(umapData, 2, maxK);
            setUmapClusterCount(suggestedK);
        } catch (error) {
            console.error("Failed to calculate K:", error);
            alert("Could not calculate an optimal number of clusters.");
        } finally {
            setIsCalculatingK(false);
        }
    };

    const handleNameClusters = async () => {
        if (!clusterAssignments || !spaceData) return;
        setIsNamingClusters(true);
        setUmapClusterNames({}); // Clear previous names
    
        try {
            if (!process.env.API_KEY) throw new Error("API_KEY not found.");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const clusterGroups: Record<number, Style[]> = {};
            spaceData.styles.forEach((style, index) => {
                const clusterId = clusterAssignments[index];
                if (clusterGroups[clusterId]) {
                    clusterGroups[clusterId].push(style);
                } else {
                    clusterGroups[clusterId] = [style];
                }
            });
    
            const axesInfo = spaceData.axes.map(a => `- ${a.name}: ${a.description}`).join('\n');
    
            const namePromises = Object.entries(clusterGroups).map(async ([clusterId, stylesInCluster]) => {
                const stylesInfo = stylesInCluster.slice(0, 10).map(s => { // Limit to 10 styles per cluster to keep prompt short
                    const scoresInfo = umapAxisIds.map(axisId => {
                        const axis = spaceData.axes.find(a => a.id === axisId);
                        return `${axis?.name || 'Unknown Axis'}: ${s.scores[axisId] ?? 'N/A'}`;
                    }).join(', ');
                    return `- Style: ${s.name}\n  Description: ${s.description}\n  Scores: ${scoresInfo}`;
                }).join('\n');
    
                const prompt = `You are an expert in art and design styles. Based on the following list of styles belonging to the same cluster, generate a short, descriptive, and insightful name for the cluster (3-5 words max).

**Analysis Axes:**
${axesInfo}

**Cluster Styles:**
${stylesInfo}

Based on the common themes, aesthetics, and scores, what is a fitting name for this cluster? Only return the name, with no preamble.`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
    
                return {
                    clusterId: parseInt(clusterId),
                    name: response.text.trim().replace(/"/g, '') // Clean up quotes
                };
            });
    
            const results = await Promise.all(namePromises);
            const newNames: Record<number, string> = {};
            results.forEach(result => {
                newNames[result.clusterId] = result.name;
            });
            setUmapClusterNames(newNames);
    
        } catch (error) {
            console.error("Failed to name clusters:", error);
            alert(`Failed to name clusters. ${error instanceof Error ? error.message : 'See console for details.'}`);
        } finally {
            setIsNamingClusters(false);
        }
    };

    const renderAxisSelector = (index: number, label: string) => {
        const otherSelectedAxes = activeAxisIds.filter((_, i) => i !== index);
        const availableAxes = spaceData.axes.filter(ax => !otherSelectedAxes.includes(ax.id));
        return (
            <div key={index} className="flex flex-col">
                <label className="text-sm font-medium text-gray-400 mb-1">{label} Axis</label>
                <select
                    value={activeAxisIds[index] || 'none'}
                    onChange={(e) => handleAxisChange(index, e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="none">-- None --</option>
                    {availableAxes.map(axis => (
                        <option key={axis.id} value={axis.id}>{axis.name}</option>
                    ))}
                </select>
            </div>
        );
    };

    return (
        <aside className="w-80 bg-gray-800 p-4 flex flex-col space-y-4 overflow-y-auto">
            <h1 className="text-2xl font-bold text-center">Style Visualizer</h1>
            
            {/* Project Controls */}
            <div className="bg-gray-700 p-3 rounded-lg">
                <h2 className="text-lg font-semibold mb-2 flex items-center"><ListIcon className="mr-2" /> Project</h2>
                <div className="grid grid-cols-3 gap-2">
                    <button onClick={onLoadProject} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-md text-sm flex items-center justify-center">
                        <FileUpIcon className="mr-1" /> Load
                    </button>
                    <button onClick={onSaveProject} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-md text-sm flex items-center justify-center">
                        <FileDownIcon className="mr-1" /> Save
                    </button>
                    <button onClick={onResetProject} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-md text-sm flex items-center justify-center">
                        <RefreshCwIcon className="mr-1" /> Reset
                    </button>
                </div>
                {isGenerationPaused && (
                    <div className="mt-2 text-center">
                        <p className="text-sm text-yellow-400 mb-2">Initial image generation is paused.</p>
                        <button 
                            onClick={onResumeGeneration}
                            disabled={isResuming}
                            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-3 rounded-md text-sm flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            <RefreshCwIcon className={`mr-2 h-4 w-4 ${isResuming ? 'animate-spin' : ''}`} />
                            {isResuming ? 'Resuming...' : 'Resume Generation'}
                        </button>
                    </div>
                )}
                {resumeStatus && (
                    <p className="text-xs text-center mt-2 text-gray-300">{resumeStatus}</p>
                )}
            </div>

            {/* Visualization Controls */}
            <div className="bg-gray-700 p-3 rounded-lg space-y-3">
                <h2 className="text-lg font-semibold flex items-center"><ListTree className="mr-2" /> View Controls</h2>
                <div>
                    <label className="text-sm font-medium text-gray-400 mb-1 block">Dimension</label>
                    <div className="flex space-x-2">
                        <button onClick={() => setDimension(1)} className={`flex-1 py-2 rounded-md ${dimension === 1 ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}>1D</button>
                        <button onClick={() => setDimension(2)} className={`flex-1 py-2 rounded-md ${dimension === 2 ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}>2D</button>
                        <button onClick={() => setDimension(3)} className={`flex-1 py-2 rounded-md ${dimension === 3 ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}>3D</button>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-400 mb-1 block">Projection Mode</label>
                    <div className="flex space-x-2">
                        <button onClick={() => setProjectionMode('manual')} className={`flex-1 py-2 rounded-md ${projectionMode === 'manual' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}>Manual Axes</button>
                        <button onClick={() => setProjectionMode('umap')} className={`flex-1 py-2 rounded-md ${projectionMode === 'umap' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}>UMAP</button>
                    </div>
                </div>

                {projectionMode === 'manual' ? (
                    <>
                        {renderAxisSelector(0, 'X')}
                        {dimension >= 2 && renderAxisSelector(1, 'Y')}
                        {dimension === 3 && renderAxisSelector(2, 'Z')}
                    </>
                ) : (
                    <>
                        <details className="space-y-2" open>
                            <summary className="text-sm font-medium text-gray-400 cursor-pointer flex items-center">
                                UMAP Source Axes ({umapAxisIds.length} / {spaceData.axes.length})
                                <ChevronDownIcon className="ml-1" />
                            </summary>
                            <div className="max-h-32 overflow-y-auto bg-gray-900/50 p-2 rounded-md space-y-1 text-sm">
                                {spaceData.axes.map(axis => (
                                    <div key={axis.id} className="flex items-center space-x-2 hover:bg-gray-700 p-1 rounded">
                                        <input
                                            type="checkbox"
                                            id={`umap-axis-${axis.id}`}
                                            checked={umapAxisIds.includes(axis.id)}
                                            onChange={() => handleUmapAxisToggle(axis.id)}
                                            className="form-checkbox bg-gray-700 border-gray-600 rounded text-blue-500 focus:ring-blue-600"
                                        />
                                        <label htmlFor={`umap-axis-${axis.id}`} className="flex-1 cursor-pointer">{axis.name}</label>
                                    </div>
                                ))}
                            </div>
                        </details>
                        <div className="mt-3 pt-3 border-t border-gray-600 space-y-3">
                            <div className="flex items-center justify-between">
                                <label htmlFor="enable-clustering" className="text-sm font-medium text-gray-400 cursor-pointer">Enable Clustering</label>
                                <button
                                    id="enable-clustering"
                                    onClick={() => setIsUmapClusteringEnabled(!isUmapClusteringEnabled)}
                                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isUmapClusteringEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
                                    aria-pressed={isUmapClusteringEnabled}
                                >
                                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isUmapClusteringEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            {isUmapClusteringEnabled && (
                                <>
                                    <div>
                                        <label htmlFor="cluster-count" className="text-sm font-medium text-gray-400 block mb-1">Number of Clusters</label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                id="cluster-count"
                                                min="2"
                                                max={Math.min(20, spaceData.styles.length - 1)}
                                                value={umapClusterCount}
                                                onChange={(e) => setUmapClusterCount(parseInt(e.target.value, 10) || 2)}
                                                className="flex-1 bg-gray-900/50 border border-gray-600 rounded-md p-2 text-sm"
                                            />
                                            <button 
                                                onClick={handleCalculateK} 
                                                disabled={isCalculatingK || !umapData}
                                                title="Calculate optimal k using Silhouette Score"
                                                className="px-3 py-2 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700 flex items-center disabled:bg-gray-500 disabled:cursor-not-allowed"
                                            >
                                                <SparklesIcon className={`h-4 w-4 ${isCalculatingK ? 'animate-spin' : ''}`} />
                                                <span className="ml-1">Calculate k</span>
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleNameClusters}
                                        disabled={isNamingClusters || !clusterAssignments}
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-md text-sm flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed"
                                    >
                                        <SparklesIcon className={`mr-2 h-4 w-4 ${isNamingClusters ? 'animate-spin' : ''}`} />
                                        {isNamingClusters ? 'Naming...' : 'Name Clusters with AI'}
                                    </button>
                                </>
                            )}
                        </div>
                    </>
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
                    <h2 className="text-lg font-semibold">Styles ({spaceData.styles.length})</h2>
                    <button onClick={() => onOpenStyleModal(null)} className="p-1 rounded-md bg-blue-600 hover:bg-blue-700"><PlusIcon /></button>
                </div>
                <ul className="space-y-1 overflow-y-auto flex-1">
                    {spaceData.styles.map(style => (
                        <li 
                            key={style.id}
                            onClick={() => setSelectedStyleId(style.id)}
                            onDoubleClick={() => onOpenStyleModal(style.id)}
                            className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${selectedStyleId === style.id ? 'bg-blue-800' : 'bg-gray-600 hover:bg-gray-600'}`}
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

export default Sidebar;