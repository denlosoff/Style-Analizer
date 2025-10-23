
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { SpaceData, ProjectionMode } from '../types';
import { findOptimalK } from '../utils/clustering';
import { FileDownIcon, FileUpIcon, ListIcon, ListTree, RefreshCwIcon, ChevronDownIcon, SparklesIcon } from './icons';
import { useTranslation } from '../i18n/i18n';

interface SidebarProps {
    spaceData: SpaceData;
    dimension: 1 | 2 | 3;
    setDimension: (dim: 1 | 2 | 3) => void;
    projectionMode: ProjectionMode;
    setProjectionMode: (mode: ProjectionMode) => void;
    activeAxisIds: (string | null)[];
    setActiveAxisIds: (ids: (string | null)[]) => void;
    
    // Generic Projection Props
    projectionAxisIds: string[];
    // FIX: Changed type to allow function updater for state
    setProjectionAxisIds: React.Dispatch<React.SetStateAction<string[]>>;
    isClusteringEnabled: boolean;
    setIsClusteringEnabled: (enabled: boolean) => void;
    clusterCount: number;
    setClusterCount: (count: number) => void;
    clusterAssignments: number[] | null;
    clusterNames: Record<number, string>;
    setClusterNames: (names: Record<number, string>) => void;
    projectionData: Record<string, number[]> | null;
    isProjectionCalculationFiltered: boolean;
    setIsProjectionCalculationFiltered: (filtered: boolean) => void;
    
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
    projectionAxisIds,
    setProjectionAxisIds,
    isClusteringEnabled,
    setIsClusteringEnabled,
    clusterCount,
    setClusterCount,
    clusterAssignments,
    clusterNames,
    setClusterNames,
    projectionData,
    isProjectionCalculationFiltered,
    setIsProjectionCalculationFiltered,
    onSaveProject,
    onLoadProject,
    onResetProject,
    isGenerationPaused,
    isResuming,
    resumeStatus,
    onResumeGeneration,
}) => {
    const { t, language, setLanguage } = useTranslation();
    const [isNamingClusters, setIsNamingClusters] = useState(false);
    const [isCalculatingK, setIsCalculatingK] = useState(false);

    const handleAxisChange = (index: number, value: string) => {
        const newAxisId = value === 'none' ? null : value;
        const newAxisIds = [...activeAxisIds];

        // Find if the selected axis is already in use in another dropdown
        const conflictingIndex = activeAxisIds.findIndex(id => id === newAxisId);
        
        // If it is in use (and not in the current dropdown), swap them
        if (newAxisId !== null && conflictingIndex > -1 && conflictingIndex !== index) {
            // The value that was in the current dropdown is swapped to the conflicting one
            newAxisIds[conflictingIndex] = newAxisIds[index]; 
        }

        // Set the new value for the current dropdown
        newAxisIds[index] = newAxisId;

        setActiveAxisIds(newAxisIds);
    };

    const handleProjectionAxisToggle = (axisId: string) => {
        setProjectionAxisIds(prev =>
            prev.includes(axisId) ? prev.filter(id => id !== axisId) : [...prev, axisId]
        );
    };

    const handleCalculateK = async () => {
        if (!projectionData || Object.keys(projectionData).length === 0) {
            alert(t('sidebar.projectionDataUnavailable', { mode: projectionMode.toUpperCase() }));
            return;
        }
        setIsCalculatingK(true);
        try {
            // Use a timeout to allow the loading state to render before blocking the main thread
            await new Promise(resolve => setTimeout(resolve, 50));
            // FIX: Explicitly type `pointsForClustering` as `number[][]` to satisfy the type requirements of `findOptimalK`.
            const pointsForClustering: number[][] = Object.values(projectionData);
            const maxK = Math.min(15, pointsForClustering.length - 1);
            if (maxK < 2) {
                 alert(t('sidebar.notEnoughStylesForK'));
                 return;
            }
            const suggestedK = await findOptimalK(pointsForClustering, 2, maxK);
            setClusterCount(suggestedK);
        } catch (error) {
            console.error("Failed to calculate K:", error);
            alert(t('sidebar.kCalculationError'));
        } finally {
            setIsCalculatingK(false);
        }
    };

    const handleNameClusters = async () => {
        if (!clusterAssignments || !spaceData) return;
        setIsNamingClusters(true);
        setClusterNames({}); // Clear previous names
    
        try {
            if (!process.env.API_KEY) throw new Error("API_KEY not found.");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const clusterGroups: Record<number, { name: string, description: string, scores: Record<string, number | undefined> }[]> = {};
            spaceData.styles.forEach((style, index) => {
                const clusterId = clusterAssignments[index];
                if (clusterId === -1) return; // Ignore styles not in a cluster
                 const styleInfo = {
                    name: style.name,
                    description: style.description,
                    scores: Object.fromEntries(projectionAxisIds.map(axisId => [
                        spaceData.axes.find(a => a.id === axisId)?.name || 'Unknown Axis',
                        style.scores[axisId]
                    ]))
                };
                if (clusterGroups[clusterId]) {
                    clusterGroups[clusterId].push(styleInfo);
                } else {
                    clusterGroups[clusterId] = [styleInfo];
                }
            });
    
            const axesInfo = spaceData.axes
                .filter(a => projectionAxisIds.includes(a.id))
                .map(a => `- ${a.name}: ${a.description}`)
                .join('\n');
    
            const namePromises = Object.entries(clusterGroups).map(async ([clusterId, stylesInCluster]) => {
                 const stylesInfo = stylesInCluster.slice(0, 10).map(s => { // Limit to 10 styles per cluster to keep prompt short
                    const scoresInfo = Object.entries(s.scores).map(([axisName, score]) => `${axisName}: ${score ?? 'N/A'}`).join(', ');
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
            setClusterNames(newNames);
    
        } catch (error) {
            console.error("Failed to name clusters:", error);
            alert(t('sidebar.clusterNamingError', { error: error instanceof Error ? error.message : 'See console for details.' }));
        } finally {
            setIsNamingClusters(false);
        }
    };

    const renderAxisSelector = (index: number, label: string) => {
        return (
            <div key={index} className="flex flex-col">
                <label className="text-sm font-medium text-gray-400 mb-1">{label}</label>
                <select
                    value={activeAxisIds[index] || 'none'}
                    onChange={(e) => handleAxisChange(index, e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="none">{t('sidebar.noneOption')}</option>
                    {spaceData.axes.map(axis => (
                        <option key={axis.id} value={axis.id}>{axis.name}</option>
                    ))}
                </select>
            </div>
        );
    };
    
    const projectionModeName = projectionMode.toUpperCase();

    return (
        <aside className="w-80 bg-gray-800 p-4 flex flex-col space-y-4 overflow-y-auto">
            <h1 className="text-2xl font-bold text-center">{t('sidebar.title')}</h1>
            
             {/* Language Control */}
            <div className="bg-gray-700 p-3 rounded-lg">
                <label className="text-sm font-medium text-gray-400 mb-1 block">{t('sidebar.languageLabel')}</label>
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'en' | 'ru')}
                    className="w-full bg-gray-600 border border-gray-500 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="en">English</option>
                    <option value="ru">Русский</option>
                </select>
            </div>

            {/* Project Controls */}
            <div className="bg-gray-700 p-3 rounded-lg">
                <h2 className="text-lg font-semibold mb-2 flex items-center"><ListIcon className="mr-2" /> {t('sidebar.projectTitle')}</h2>
                <div className="grid grid-cols-3 gap-2">
                    <button onClick={onLoadProject} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-md text-sm flex items-center justify-center">
                        <FileUpIcon className="mr-1" /> {t('sidebar.loadButton')}
                    </button>
                    <button onClick={onSaveProject} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-md text-sm flex items-center justify-center">
                        <FileDownIcon className="mr-1" /> {t('sidebar.saveButton')}
                    </button>
                    <button onClick={onResetProject} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-md text-sm flex items-center justify-center">
                        <RefreshCwIcon className="mr-1" /> {t('sidebar.resetButton')}
                    </button>
                </div>
                {isGenerationPaused && (
                    <div className="mt-2 text-center">
                        <p className="text-sm text-yellow-400 mb-2">{t('sidebar.generationPaused')}</p>
                        <button 
                            onClick={onResumeGeneration}
                            disabled={isResuming}
                            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-3 rounded-md text-sm flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            <RefreshCwIcon className={`mr-2 h-4 w-4 ${isResuming ? 'animate-spin' : ''}`} />
                            {isResuming ? t('sidebar.resumingGenerationButton') : t('sidebar.resumeGenerationButton')}
                        </button>
                    </div>
                )}
                {resumeStatus && (
                    <p className="text-xs text-center mt-2 text-gray-300">{resumeStatus}</p>
                )}
            </div>

            {/* Visualization Controls */}
            <div className="bg-gray-700 p-3 rounded-lg space-y-3">
                <h2 className="text-lg font-semibold flex items-center"><ListTree className="mr-2" /> {t('sidebar.viewControlsTitle')}</h2>
                <div>
                    <label className="text-sm font-medium text-gray-400 mb-1 block">{t('sidebar.dimensionLabel')}</label>
                    <div className="flex space-x-2">
                        <button onClick={() => setDimension(1)} className={`flex-1 py-2 rounded-md ${dimension === 1 ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}>1D</button>
                        <button onClick={() => setDimension(2)} className={`flex-1 py-2 rounded-md ${dimension === 2 ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}>2D</button>
                        <button onClick={() => setDimension(3)} className={`flex-1 py-2 rounded-md ${dimension === 3 ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}>3D</button>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-400 mb-1 block">{t('sidebar.projectionModeLabel')}</label>
                    <div className="grid grid-cols-3 space-x-2">
                        <button onClick={() => setProjectionMode('manual')} className={`py-2 rounded-md ${projectionMode === 'manual' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}>{t('sidebar.manualMode')}</button>
                        <button onClick={() => setProjectionMode('umap')} className={`py-2 rounded-md ${projectionMode === 'umap' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}>{t('sidebar.umapMode')}</button>
                        <button onClick={() => setProjectionMode('pca')} className={`py-2 rounded-md ${projectionMode === 'pca' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}>{t('sidebar.pcaMode')}</button>
                    </div>
                </div>

                {projectionMode === 'manual' ? (
                    <>
                        {renderAxisSelector(0, t('sidebar.xAxisLabel'))}
                        {dimension >= 2 && renderAxisSelector(1, t('sidebar.yAxisLabel'))}
                        {dimension === 3 && renderAxisSelector(2, t('sidebar.zAxisLabel'))}
                    </>
                ) : (
                    <>
                        <details className="space-y-2" open>
                            <summary className="text-sm font-medium text-gray-400 cursor-pointer flex items-center">
                                {t('sidebar.sourceAxesLabel', { mode: projectionModeName, count: projectionAxisIds.length, total: spaceData.axes.length })}
                                <ChevronDownIcon className="ml-1" />
                            </summary>
                            <div className="max-h-32 overflow-y-auto bg-gray-900/50 p-2 rounded-md space-y-1 text-sm">
                                {spaceData.axes.map(axis => (
                                    <div key={axis.id} className="flex items-center space-x-2 hover:bg-gray-700 p-1 rounded">
                                        <input
                                            type="checkbox"
                                            id={`proj-axis-${axis.id}`}
                                            checked={projectionAxisIds.includes(axis.id)}
                                            onChange={() => handleProjectionAxisToggle(axis.id)}
                                            className="form-checkbox bg-gray-700 border-gray-600 rounded text-blue-500 focus:ring-blue-600"
                                        />
                                        <label htmlFor={`proj-axis-${axis.id}`} className="flex-1 cursor-pointer">{axis.name}</label>
                                    </div>
                                ))}
                            </div>
                        </details>
                        <div className="mt-3 pt-3 border-t border-gray-600 space-y-3">
                            <div className="flex items-center justify-between">
                                <label htmlFor="filter-projection-calc" className="text-sm font-medium text-gray-400 cursor-pointer">{t('sidebar.calculateOnFilteredLabel')}</label>
                                <button
                                    id="filter-projection-calc"
                                    onClick={() => setIsProjectionCalculationFiltered(!isProjectionCalculationFiltered)}
                                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isProjectionCalculationFiltered ? 'bg-blue-600' : 'bg-gray-600'}`}
                                    aria-pressed={isProjectionCalculationFiltered}
                                    title={t('sidebar.calculateOnFilteredTooltip')}
                                >
                                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isProjectionCalculationFiltered ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="enable-clustering" className="text-sm font-medium text-gray-400 cursor-pointer">{t('sidebar.enableClusteringLabel')}</label>
                                <button
                                    id="enable-clustering"
                                    onClick={() => setIsClusteringEnabled(!isClusteringEnabled)}
                                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isClusteringEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
                                    aria-pressed={isClusteringEnabled}
                                >
                                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isClusteringEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            {isClusteringEnabled && (
                                <>
                                    <div>
                                        <label htmlFor="cluster-count" className="text-sm font-medium text-gray-400 block mb-1">{t('sidebar.clusterCountLabel')}</label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                id="cluster-count"
                                                min="2"
                                                max={Math.min(20, spaceData.styles.length - 1)}
                                                value={clusterCount}
                                                onChange={(e) => setClusterCount(parseInt(e.target.value, 10) || 2)}
                                                className="flex-1 bg-gray-900/50 border border-gray-600 rounded-md p-2 text-sm"
                                            />
                                            <button 
                                                onClick={handleCalculateK} 
                                                disabled={isCalculatingK || !projectionData}
                                                title={t('sidebar.calculateKTooltip')}
                                                className="px-3 py-2 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700 flex items-center disabled:bg-gray-500 disabled:cursor-not-allowed"
                                            >
                                                <SparklesIcon className={`h-4 w-4 ${isCalculatingK ? 'animate-spin' : ''}`} />
                                                <span className="ml-1">{t('sidebar.calculateKButton')}</span>
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleNameClusters}
                                        disabled={isNamingClusters || !clusterAssignments}
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-md text-sm flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed"
                                    >
                                        <SparklesIcon className={`mr-2 h-4 w-4 ${isNamingClusters ? 'animate-spin' : ''}`} />
                                        {isNamingClusters ? t('sidebar.namingClustersButton') : t('sidebar.nameClustersButton')}
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
