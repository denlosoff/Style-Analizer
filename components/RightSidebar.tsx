

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidvv4 } from 'uuid';
import { GoogleGenAI } from '@google/genai';
import { UMAP } from 'umap-js';
import type { SpaceData, Style, Axis, ProjectionMode, Filter } from '../types';
import { INITIAL_DATA, AXIS_SCORE_MIN, AXIS_SCORE_MAX } from '../constants';
import Sidebar from './components/Sidebar';
import Visualization from './components/Visualization';
import StyleEditorModal from './components/StyleEditorModal';
import AxisEditorModal from './components/AxisEditorModal';
import ScoringWizardModal from './components/ScoringWizardModal';
import ImageViewerModal from './components/ImageViewerModal';
import { downloadJson, uploadJson } from './utils/fileUtils';
import { getSpaceDataFromDB, setSpaceDataInDB, clearSpaceDataFromDB } from './utils/dbUtils';
import { SparklesIcon, PlusIcon, TrashIcon, EditIcon, BarChart2Icon, SearchIcon } from './components/icons';
import { kmeans } from './utils/clustering';
import { pca } from './utils/pca';
import { LanguageProvider, useTranslation } from './i18n/i18n';
import CorrelationModal from './components/CorrelationModal';

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
    onViewImages: (images: string[], index: number, generatedImageUrls?: string[]) => void;
    onOpenCorrelationModal: () => void;
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
    onViewImages,
    onOpenCorrelationModal,
}) => {
    const { t } = useTranslation();
    const selectedStyle = spaceData.styles.find(s => s.id === selectedStyleId);

    // State for search and sort
    const [axesSearchTerm, setAxesSearchTerm] = useState('');
    const [stylesSearchTerm, setStylesSearchTerm] = useState('');
    const [stylesSortOrder, setStylesSortOrder] = useState('alphabetical-asc');

    const handleAddFilter = () => {
        const firstAxisId = spaceData.axes[0]?.id;
        if (!firstAxisId) {
            alert(t('rightSidebar.addFilterError'));
            return;
        }
        setFilters([
            ...filters,
            {
                id: uuidvv4(),
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

    const displayedAxes = useMemo(() => {
        if (!axesSearchTerm) {
            return spaceData.axes;
        }
        return spaceData.axes.filter(axis => 
            axis.name.toLowerCase().includes(axesSearchTerm.toLowerCase())
        );
    }, [spaceData.axes, axesSearchTerm]);

    const displayedStyles = useMemo(() => {
        const searched = stylesSearchTerm
            ? spaceData.styles.filter(style => style.name.toLowerCase().includes(stylesSearchTerm.toLowerCase()))
            : [...spaceData.styles];

        return searched.sort((a, b) => {
            if (stylesSortOrder === 'alphabetical-asc') {
                return a.name.localeCompare(b.name);
            }
            if (stylesSortOrder === 'alphabetical-desc') {
                return b.name.localeCompare(a.name);
            }
            if (stylesSortOrder.startsWith('score-')) {
                const [_, direction, axisId] = stylesSortOrder.split('-');
                const scoreA = a.scores[axisId] ?? MIDPOINT_SCORE;
                const scoreB = b.scores[axisId] ?? MIDPOINT_SCORE;
                return direction === 'desc' ? scoreB - scoreA : scoreA - scoreB;
            }
            return 0;
        });
    }, [spaceData.styles, stylesSearchTerm, stylesSortOrder]);


    return (
        <aside className="w-96 bg-gray-800 p-4 flex flex-col space-y-4 overflow-y-auto">
             {/* Filter Controls */}
             <div className="bg-gray-700 p-3 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center">
                        {t('rightSidebar.filterControlsTitle')}
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
                            <PlusIcon className="mr-1 h-4 w-4" /> {t('rightSidebar.addFilterButton')}
                        </button>
                    </div>
                )}
            </div>

            {/* Axes List */}
            <div className="bg-gray-700 p-3 rounded-lg flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold">{t('rightSidebar.axesListTitle', { count: displayedAxes.length })}</h2>
                    <div className="flex items-center space-x-1">
                        <button onClick={onOpenCorrelationModal} className="p-1 rounded-md bg-indigo-600 hover:bg-indigo-700" title={t('rightSidebar.correlationButtonTooltip')}><BarChart2Icon /></button>
                        <button onClick={() => onOpenAxisModal(null)} className="p-1 rounded-md bg-blue-600 hover:bg-blue-700"><PlusIcon /></button>
                    </div>
                </div>
                 <div className="relative mb-2">
                    <input
                        type="text"
                        placeholder="Search axes..."
                        value={axesSearchTerm}
                        onChange={(e) => setAxesSearchTerm(e.target.value)}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-md py-1 pl-8 pr-2 text-sm"
                    />
                    <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
                <ul className="space-y-1 overflow-y-auto flex-1">
                    {displayedAxes.map(axis => (
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

            {/* NEW: Style Details Section */}
            {selectedStyle && (
                <div className="bg-gray-700 p-3 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold truncate pr-2" title={selectedStyle.name}>{selectedStyle.name}</h3>
                        <button 
                            onClick={() => onOpenStyleModal(selectedStyle.id)} 
                            className="p-1 text-gray-400 hover:text-white flex-shrink-0"
                            title={t('rightSidebar.editStyleTooltip', { styleName: selectedStyle.name })}
                        >
                            <EditIcon />
                        </button>
                    </div>
                    {selectedStyle.images.length > 0 ? (
                        <div className="relative group">
                             <img
                                src={selectedStyle.images[selectedStyle.coverImageIndex ?? 0]}
                                alt={selectedStyle.name}
                                className="w-full h-48 object-cover rounded-md cursor-pointer"
                                onClick={() => onViewImages(selectedStyle.images, selectedStyle.coverImageIndex ?? 0, selectedStyle.generatedImageUrls)}
                            />
                            {selectedStyle.generatedImageUrls?.includes(selectedStyle.images[selectedStyle.coverImageIndex ?? 0]) && (
                                <div className="absolute bottom-1 right-1 bg-purple-600 text-white text-xs font-bold px-1.5 py-0.5 rounded pointer-events-none">
                                    AI
                                </div>
                            )}
                            <div 
                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-md"
                                onClick={() => onViewImages(selectedStyle.images, selectedStyle.coverImageIndex ?? 0, selectedStyle.generatedImageUrls)}
                            >
                                <span className="text-white font-semibold">{t('rightSidebar.viewGalleryText')}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-48 bg-gray-800 rounded-md flex items-center justify-center text-gray-500">
                            <span>{t('rightSidebar.noImageAvailableText')}</span>
                        </div>
                    )}
                    <p className="text-sm text-gray-300 max-h-24 overflow-y-auto pr-1">{selectedStyle.description || t('rightSidebar.noDescriptionText')}</p>
                </div>
            )}

            {/* Styles List */}
            <div className="bg-gray-700 p-3 rounded-lg flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold">
                         {isFilteringEnabled 
                            ? t('rightSidebar.stylesListFilteredTitle', { filteredCount: filteredStyleIds.length, totalCount: spaceData.styles.length }) 
                            : t('rightSidebar.stylesListTitle', { count: spaceData.styles.length })}
                    </h2>
                    <button onClick={() => onOpenStyleModal(null)} className="p-1 rounded-md bg-blue-600 hover:bg-blue-700"><PlusIcon /></button>
                </div>
                 <div className="flex items-center space-x-2 mb-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search styles..."
                            value={stylesSearchTerm}
                            onChange={(e) => setStylesSearchTerm(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-600 rounded-md py-1 pl-8 pr-2 text-sm"
                        />
                        <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                    <select
                        value={stylesSortOrder}
                        onChange={(e) => setStylesSortOrder(e.target.value)}
                        className="bg-gray-900/50 border border-gray-600 rounded-md p-1 text-sm"
                    >
                        <option value="alphabetical-asc">A-Z</option>
                        <option value="alphabetical-desc">Z-A</option>
                        {spaceData.axes.map(axis => (
                            <optgroup key={axis.id} label={axis.name}>
                                <option value={`score-desc-${axis.id}`}>Score (High-Low)</option>
                                <option value={`score-asc-${axis.id}`}>Score (Low-High)</option>
                            </optgroup>
                        ))}
                    </select>
                </div>
                <ul className="space-y-1 overflow-y-auto flex-1">
                    {displayedStyles.map(style => (
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