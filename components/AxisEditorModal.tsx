import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import type { Axis, Style } from '../types';
import Modal from './common/Modal';
import { generateRandomColor } from '../utils/colorUtils';
import { useTranslation } from '../i18n/i18n';
import { AXIS_SCORE_MIN, AXIS_SCORE_MAX } from '../constants';
import { BotMessageSquareIcon, CheckCircleIcon } from './icons';


interface AxisEditorModalProps {
    axis: Axis;
    styles: Style[];
    onSave: (axis: Axis, generatedScores: Record<string, number> | null) => void;
    onClose: () => void;
}

const AxisEditorModal: React.FC<AxisEditorModalProps> = ({ axis, styles, onSave, onClose }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Axis>(axis);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
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

    const handleAnalyzeStyles = async () => {
        setIsAnalyzing(true);
        setAnalysisStatus(null);
        setGeneratedScores(null);
        try {
            if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const stylesToScore = styles.map(s => `- ${s.name}: ${s.description || 'No description provided.'}`).join('\n');
            
            const prompt = `You are an expert art and design critic. Your task is to analyze a list of artistic styles and score them based on a specific creative axis.

**Axis for Scoring:**
- Name: "${formData.name}"
- Description: "${formData.description}"

**Scoring Scale:**
Score each style on a scale from ${AXIS_SCORE_MIN} to ${AXIS_SCORE_MAX}. You can use decimal points. A higher score means the style more strongly embodies the characteristics of the axis.

**List of Styles to Score:**
${stylesToScore}

Please provide your scores in a JSON array format. Each object in the array should contain the style's exact name and its score.`;
            
            const schema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        styleName: { type: Type.STRING },
                        score: { type: Type.NUMBER }
                    },
                    required: ['styleName', 'score'],
                }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                },
            });

            const results = JSON.parse(response.text) as { styleName: string; score: number }[];
            const styleNameToIdMap = new Map(styles.map(s => [s.name, s.id]));
            const newScores: Record<string, number> = {};
            let scoredCount = 0;

            for (const result of results) {
                const styleId = styleNameToIdMap.get(result.styleName);
                if (styleId && typeof result.score === 'number') {
                    newScores[styleId] = Math.max(AXIS_SCORE_MIN, Math.min(AXIS_SCORE_MAX, result.score));
                    scoredCount++;
                }
            }
            
            setGeneratedScores(newScores);
            setAnalysisStatus({ message: t('axisEditorModal.analysisSuccess', { count: scoredCount }), type: 'success' });

        } catch (error) {
            console.error("AI style analysis failed:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setAnalysisStatus({ message: t('axisEditorModal.analysisError', { error: errorMessage }), type: 'error' });
        } finally {
            setIsAnalyzing(false);
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, generatedScores);
    };

    const footer = (
        <div className="space-x-2">
            <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500">{t('axisEditorModal.cancelButton')}</button>
            <button onClick={handleSubmit} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700">{t('axisEditorModal.saveButton')}</button>
        </div>
    );
    
    return (
        <Modal title={axis.id ? t('axisEditorModal.editTitle') : t('axisEditorModal.createTitle')} onClose={onClose} footer={footer}>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-400">{t('axisEditorModal.axisNameLabel')}</label>
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
                    <label className="block text-sm font-medium text-gray-400">{t('axisEditorModal.descriptionLabel')}</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">{t('axisEditorModal.colorLabel')}</label>
                     <div className="flex items-center space-x-2 mt-1">
                        <input
                            type="color"
                            name="color"
                            value={formData.color}
                            onChange={handleInputChange}
                            className="p-1 h-10 w-10 block bg-gray-700 border-gray-600 cursor-pointer rounded-md"
                        />
                         <input
                            type="text"
                            name="color"
                            value={formData.color}
                            onChange={handleInputChange}
                            className="block w-full bg-gray-700 border border-gray-600 rounded-md p-2"
                        />
                    </div>
                </div>
                 <div className="pt-4 border-t border-gray-700">
                    <button
                        type="button"
                        onClick={handleAnalyzeStyles}
                        disabled={isAnalyzing || !formData.name || !formData.description}
                        title={t('axisEditorModal.analyzeAndScoreTooltip')}
                        className="w-full px-3 py-2 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        <BotMessageSquareIcon className="mr-2 h-4 w-4" />
                        {isAnalyzing ? t('axisEditorModal.analyzingButton') : t('axisEditorModal.analyzeAndScoreButton')}
                    </button>
                    {analysisStatus && (
                         <div className={`mt-2 text-sm text-center p-2 rounded-md flex items-center justify-center ${analysisStatus.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                            {analysisStatus.type === 'success' && <CheckCircleIcon className="mr-2 h-5 w-5" />}
                            {analysisStatus.message}
                        </div>
                    )}
                </div>
            </form>
        </Modal>
    );
};

export default AxisEditorModal;