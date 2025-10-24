import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import type { Axis, Style } from '../types';
import Modal from './common/Modal';
import { generateRandomColor } from '../utils/colorUtils';
import { useTranslation } from '../i18n/i18n';
import { AXIS_SCORE_MIN, AXIS_SCORE_MAX } from '../constants';
import { BotMessageSquareIcon, ListChecksIcon, SparklesIcon } from './icons';

interface AxisEditorModalProps {
    axis: Axis;
    styles: Style[];
    onSave: (axis: Axis, generatedScores: Record<string, number> | null, openScoringWizard?: boolean) => void;
    onClose: () => void;
}

const AxisEditorModal: React.FC<AxisEditorModalProps> = ({ axis, styles, onSave, onClose }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Axis>(axis);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
    const [analysisStatus, setAnalysisStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [generatedScores, setGeneratedScores] = useState<Record<string, number> | null>(null);

    useEffect(() => {
        if (!axis.color) {
            setFormData(prev => ({...prev, color: generateRandomColor()}))
        }
    }, [axis]);
    
    useEffect(() => {
        setFormData(axis);
    }, [axis]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerateDescription = async () => {
        if (!formData.name) return;
        setIsGeneratingDescription(true);
        setAnalysisStatus(null);
        try {
            if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `Based on the axis name "${formData.name}", generate a concise and clear description for what this axis represents in a style space. The description should explain what low scores (e.g., ${AXIS_SCORE_MIN}) and high scores (e.g., ${AXIS_SCORE_MAX}) mean.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setFormData(prev => ({ ...prev, description: response.text.trim() }));
        } catch (error) {
            console.error("Axis description generation failed:", error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setAnalysisStatus({ message: t('axisEditorModal.analysisError', { error: errorMessage }), type: 'error' });
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    const handleAnalyzeAndScore = async () => {
        setIsAnalyzing(true);
        setAnalysisStatus(null);
        setGeneratedScores(null);
        try {
            if (!process.env.API_KEY) throw new Error("API_KEY not set.");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const stylesData = styles.map(s => ({
                id: s.id,
                name: s.name,
                description: s.description,
            }));

            const prompt = `You are an expert art critic. Your task is to score a list of art styles based on a specific axis.
Axis Name: ${formData.name}
Axis Description: ${formData.description} (A score of ${AXIS_SCORE_MIN} means low on this axis, ${AXIS_SCORE_MAX} means high).

Score the following styles based on this axis. Provide a score from ${AXIS_SCORE_MIN} to ${AXIS_SCORE_MAX} (can be a decimal).
Styles to score:
${JSON.stringify(stylesData.slice(0, 50), null, 2)}

Return your scores in a single JSON object where keys are the style IDs and values are the numeric scores.`;

            const properties = styles.reduce((acc, style) => {
                acc[style.id] = {
                    type: Type.NUMBER,
                    description: `Score for ${style.name}`,
                };
                return acc;
            }, {} as Record<string, { type: Type.NUMBER, description: string }>);

            const schema = {
                type: Type.OBJECT,
                properties: properties,
            };

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                },
            });

            const parsedScores = JSON.parse(response.text);
            const validatedScores: Record<string, number> = {};
            let scoredCount = 0;
            if (parsedScores && typeof parsedScores === 'object') {
                for (const styleId in parsedScores) {
                    const score = (parsedScores as any)[styleId];
                    if (styles.some(s => s.id === styleId) && typeof score === 'number') {
                        validatedScores[styleId] = Math.max(AXIS_SCORE_MIN, Math.min(AXIS_SCORE_MAX, score));
                        scoredCount++;
                    }
                }
            }
            setGeneratedScores(validatedScores);
            setAnalysisStatus({ message: t('axisEditorModal.analysisSuccess', { count: scoredCount }), type: 'success' });
        } catch (error) {
            console.error("Style analysis failed:", error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setAnalysisStatus({ message: t('axisEditorModal.analysisError', { error: errorMessage }), type: 'error' });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSaveAndClose = (openScoringWizard = false) => {
        onSave(formData, generatedScores, openScoringWizard);
    };

    const footer = (
        <div className="space-x-2">
            <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500">{t('axisEditorModal.cancelButton')}</button>
            <button onClick={() => handleSaveAndClose(false)} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700">{t('axisEditorModal.saveButton')}</button>
        </div>
    );

    return (
        <Modal title={axis.id ? t('axisEditorModal.editTitle') : t('axisEditorModal.createTitle')} onClose={onClose} footer={footer}>
            <form className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400">{t('axisEditorModal.axisNameLabel')}</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2" />
                </div>
                <div>
                    <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-400">{t('axisEditorModal.descriptionLabel')}</label>
                        <button type="button" onClick={handleGenerateDescription} disabled={isGeneratingDescription || !formData.name} className="px-3 py-1 text-sm rounded-md bg-purple-600 hover:bg-purple-700 flex items-center disabled:bg-gray-500 disabled:cursor-not-allowed">
                            <SparklesIcon className="mr-1 h-4 w-4" />
                             {isGeneratingDescription ? t('styleEditorModal.generatingDescriptionButton') : t('styleEditorModal.generateDescriptionButton')}
                        </button>
                    </div>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">{t('axisEditorModal.colorLabel')}</label>
                    <input type="color" name="color" value={formData.color} onChange={handleInputChange} className="mt-1 block w-full h-10 bg-gray-700 border border-gray-600 rounded-md p-1" />
                </div>
                <div className="pt-4 border-t border-gray-700 space-y-3">
                    <button type="button" onClick={handleAnalyzeAndScore} disabled={isAnalyzing || !formData.name || !formData.description} title={t('axisEditorModal.analyzeAndScoreTooltip')} className="w-full px-3 py-2 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed">
                        <BotMessageSquareIcon className="mr-2 h-4 w-4" />
                        {isAnalyzing ? t('axisEditorModal.analyzingButton') : t('axisEditorModal.analyzeAndScoreButton')}
                    </button>
                    <button type="button" onClick={() => handleSaveAndClose(true)} title={t('axisEditorModal.manuallyScoreTooltip')} className="w-full px-3 py-2 text-sm rounded-md bg-gray-600 hover:bg-gray-500 flex items-center justify-center">
                        <ListChecksIcon className="mr-2 h-4 w-4" />
                        {t('axisEditorModal.manuallyScoreButton')}
                    </button>
                    {analysisStatus && (
                        <div className={`p-2 rounded-md text-sm text-center ${analysisStatus.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                            {analysisStatus.message}
                        </div>
                    )}
                </div>
            </form>
        </Modal>
    );
};

export default AxisEditorModal;
