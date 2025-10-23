

import React, { createContext, useContext, useState, useCallback, PropsWithChildren } from 'react';

const en = {
  "app": {
    "loadingMessage": "Loading project data...",
    "initializingMessage": "Initializing project...",
    "generatingImageMessage": "Generating image {current} of {total}: {name}",
    "apiKeyWarning": "API_KEY not found. Using data without images. Please set the API_KEY environment variable for image generation.",
    "initializationError": "An unexpected error occurred during initialization. Please check the console for details.",
    "saveError": "Could not save project data. The browser's storage might be full or corrupted.",
    "loadError": "Error loading file. See console for details.",
    "invalidProjectFile": "Invalid project file format.",
    "resetConfirmation": "Are you sure you want to reset the project? This will delete all your current styles and axes and cannot be undone.",
    "resetError": "Could not reset project. See console for details.",
    "resumeStatusStart": "Starting generation...",
    "resumeStatusAllGenerated": "All images already generated.",
    "resumeStatusGenerating": "Generating for {name} ({current}/{total})",
    "resumeStatusPaused": "Generation paused. Try again later.",
    "resumeStatusComplete": "Generation complete!",
    "resumeStatusError": "Error: {error}"
  },
  "sidebar": {
    "title": "Style Visualizer",
    "projectTitle": "Project",
    "loadButton": "Load",
    "saveButton": "Save",
    "resetButton": "Reset",
    "generationPaused": "Initial image generation is paused.",
    "resumeGenerationButton": "Resume Generation",
    "resumingGenerationButton": "Resuming...",
    "viewControlsTitle": "View Controls",
    "dimensionLabel": "Dimension",
    "projectionModeLabel": "Projection Mode",
    "manualMode": "Manual",
    "umapMode": "UMAP",
    "pcaMode": "PCA",
    "xAxisLabel": "X Axis",
    "yAxisLabel": "Y Axis",
    "zAxisLabel": "Z Axis",
    "noneOption": "-- None --",
    "sourceAxesLabel": "{mode} Source Axes ({count} / {total})",
    "calculateOnFilteredLabel": "Calculate on filtered styles",
    "calculateOnFilteredTooltip": "If enabled, UMAP/PCA is calculated only using the styles that pass the active filters.",
    "enableClusteringLabel": "Enable Clustering",
    "clusterCountLabel": "Number of Clusters",
    "calculateKButton": "Calculate k",
    "calculateKTooltip": "Calculate optimal k using Silhouette Score",
    "nameClustersButton": "Name Clusters with AI",
    "namingClustersButton": "Naming...",
    "languageLabel": "Language",
    "notEnoughStylesForK": "Not enough styles to calculate a cluster count.",
    "clusterNamingError": "Failed to name clusters. {error}",
    "kCalculationError": "Could not calculate an optimal number of clusters.",
    "projectionDataUnavailable": "{mode} data not available. Please wait for the projection to be calculated."
  },
  "rightSidebar": {
    "filterControlsTitle": "Filter Controls",
    "addFilterButton": "Add Filter",
    "axesListTitle": "Axes ({count})",
    "stylesListTitle": "Styles ({count})",
    "stylesListFilteredTitle": "Styles ({filteredCount} / {totalCount})",
    "addFilterError": "Create an axis before adding a filter.",
    "editStyleTooltip": "Edit {styleName}",
    "viewGalleryText": "View Gallery",
    "noImageAvailableText": "No image available",
    "noDescriptionText": "No description provided."
  },
  "visualization": {
    "calculatingProjectionMessage": "Calculating {mode} projection...",
    "selectAxisMessage": "Select an axis to begin visualization.",
    "selectYAxisMessage": "Select a Y axis for 2D visualization.",
    "selectZAxisMessage": "Select a Z axis for 3D visualization.",
    "selectSourceAxesMessage": "Select source axes for {mode} projection.",
    "clusterLegendTitle": "Cluster Legend",
    "clusterLabel": "Cluster {number}",
    "stackTooltip": "Stack of {count} styles. Click to expand."
  },
  "styleEditorModal": {
    "createTitle": "Create Style",
    "editTitle": "Edit Style",
    "saveButton": "Save Style",
    "cancelButton": "Cancel",
    "defineSectionTitle": "1. Define Style",
    "styleNameLabel": "Style Name",
    "descriptionLabel": "Description",
    "generateDescriptionButton": "Generate",
    "generatingDescriptionButton": "Generating...",
    "generateDescriptionTooltip": "Generate description from name and reference images",
    "descriptionPlaceholder": "Describe the style or generate one with AI...",
    "rewriteDescriptionButton": "Rewrite Description with AI (using {count} selected image)",
    "rewriteDescriptionButtonPlural": "Rewrite Description with AI (using {count} selected images)",
    "rewritingDescriptionButton": "Rewriting...",
    "generationPromptLabel": "Generation Prompt",
    "generationPromptPlaceholder": "What to generate in this style. e.g., 'A photorealistic cat wearing a tiny hat.'",
    "scoreSectionTitle": "2. Score Style",
    "recalculateScoresButton": "Recalculate Scores with AI (using {count} selected image)",
    "recalculateScoresButtonPlural": "Recalculate Scores with AI (using {count} selected images)",
    "recalculatingScoresButton": "Recalculating...",
    "noAxesWarning": "No axes created yet. Add an axis to start scoring.",
    "gallerySectionTitle": "3. Manage Gallery",
    "gallerySectionSubtitle": "Select images to use them as references for AI analysis.",
    "addImagePlaceholder": "Add reference image URL...",
    "addImageTooltip": "Add image from URL",
    "generateImageButton": "Generate New Image for Style",
    "generatingImageButton": "Generating Image...",
    "generateImageTooltip": "Generate a new image for this style using AI",
    "imageAddErrorDuplicate": "This image has already been added.",
    "imageAddErrorGeneric": "An unknown error occurred.",
    "selectForAITooltip": "Select for AI Analysis",
    "setAsCoverTooltip": "Set as cover",
    "removeImageTooltip": "Remove image",
    "generationError": "Failed to generate. {error}",
    "corruptedImageError": "Could not process a local image. It might be corrupted."
  },
  "axisEditorModal": {
    "createTitle": "Create Axis",
    "editTitle": "Edit Axis",
    "saveButton": "Save Axis",
    "cancelButton": "Cancel",
    "axisNameLabel": "Axis Name",
    "descriptionLabel": "Description",
    "colorLabel": "Color",
    "analyzeAndScoreButton": "Analyze & Score All Styles with AI",
    "analyzingButton": "Analyzing...",
    "analyzeAndScoreTooltip": "Use AI to automatically score all styles based on this axis's name and description.",
    "analysisSuccess": "Analysis complete! {count} styles scored. Scores will be applied when you save.",
    "analysisError": "Analysis failed: {error}"
  },
  "scoringWizardModal": {
    "title": "Score Styles for \"{axisName}\"",
    "description": "Set a score from {min} to {max} for each style on the new axis.",
    "applyScoresButton": "Apply Scores",
    "cancelButton": "Cancel"
  },
  "imageViewerModal": {
    "title": "Image Viewer ({current} / {total})"
  }
};

const ru = {
  "app": {
    "loadingMessage": "Загрузка данных проекта...",
    "initializingMessage": "Инициализация проекта...",
    "generatingImageMessage": "Генерация изображения {current} из {total}: {name}",
    "apiKeyWarning": "API_KEY не найден. Данные используются без изображений. Установите переменную окружения API_KEY для генерации изображений.",
    "initializationError": "Произошла непредвиденная ошибка во время инициализации. Пожалуйста, проверьте консоль для получения подробной информации.",
    "saveError": "Не удалось сохранить данные проекта. Хранилище браузера может быть заполнено или повреждено.",
    "loadError": "Ошибка загрузки файла. Подробности в консоли.",
    "invalidProjectFile": "Неверный формат файла проекта.",
    "resetConfirmation": "Вы уверены, что хотите сбросить проект? Это приведет к удалению всех ваших текущих стилей и осей и не может быть отменено.",
    "resetError": "Не удалось сбросить проект. Подробности в консоли.",
    "resumeStatusStart": "Начало генерации...",
    "resumeStatusAllGenerated": "Все изображения уже сгенерированы.",
    "resumeStatusGenerating": "Генерация для {name} ({current}/{total})",
    "resumeStatusPaused": "Генерация приостановлена. Попробуйте снова позже.",
    "resumeStatusComplete": "Генерация завершена!",
    "resumeStatusError": "Ошибка: {error}"
  },
  "sidebar": {
    "title": "Визуализатор стилей",
    "projectTitle": "Проект",
    "loadButton": "Загрузить",
    "saveButton": "Сохранить",
    "resetButton": "Сбросить",
    "generationPaused": "Начальная генерация изображений приостановлена.",
    "resumeGenerationButton": "Возобновить генерацию",
    "resumingGenerationButton": "Возобновление...",
    "viewControlsTitle": "Управление видом",
    "dimensionLabel": "Измерение",
    "projectionModeLabel": "Режим проекции",
    "manualMode": "Ручной",
    "umapMode": "UMAP",
    "pcaMode": "PCA",
    "xAxisLabel": "Ось X",
    "yAxisLabel": "Ось Y",
    "zAxisLabel": "Ось Z",
    "noneOption": "-- Нет --",
    "sourceAxesLabel": "Исходные оси {mode} ({count} / {total})",
    "calculateOnFilteredLabel": "Расчет по отфильтрованным стилям",
    "calculateOnFilteredTooltip": "Если включено, UMAP/PCA рассчитывается только с использованием стилей, прошедших активные фильтры.",
    "enableClusteringLabel": "Включить кластеризацию",
    "clusterCountLabel": "Количество кластеров",
    "calculateKButton": "Рассчитать k",
    "calculateKTooltip": "Рассчитать оптимальное k с помощью Silhouette Score",
    "nameClustersButton": "Назвать кластеры с ИИ",
    "namingClustersButton": "Присвоение имен...",
    "languageLabel": "Язык",
    "notEnoughStylesForK": "Недостаточно стилей для расчета количества кластеров.",
    "clusterNamingError": "Не удалось назвать кластеры. {error}",
    "kCalculationError": "Не удалось рассчитать оптимальное количество кластеров.",
    "projectionDataUnavailable": "Данные {mode} недоступны. Пожалуйста, подождите, пока будет рассчитана проекция."
  },
  "rightSidebar": {
    "filterControlsTitle": "Управление фильтрами",
    "addFilterButton": "Добавить фильтр",
    "axesListTitle": "Оси ({count})",
    "stylesListTitle": "Стили ({count})",
    "stylesListFilteredTitle": "Стили ({filteredCount} / {totalCount})",
    "addFilterError": "Создайте ось перед добавлением фильтра.",
    "editStyleTooltip": "Редактировать {styleName}",
    "viewGalleryText": "Смотреть галерею",
    "noImageAvailableText": "Нет изображения",
    "noDescriptionText": "Описание не предоставлено."
  },
  "visualization": {
    "calculatingProjectionMessage": "Расчет проекции {mode}...",
    "selectAxisMessage": "Выберите ось, чтобы начать визуализацию.",
    "selectYAxisMessage": "Выберите ось Y для 2D-визуализации.",
    "selectZAxisMessage": "Выберите ось Z для 3D-визуализации.",
    "selectSourceAxesMessage": "Выберите исходные оси для проекции {mode}.",
    "clusterLegendTitle": "Легенда кластеров",
    "clusterLabel": "Кластер {number}",
    "stackTooltip": "Стопка из {count} стилей. Нажмите, чтобы развернуть."
  },
  "styleEditorModal": {
    "createTitle": "Создать стиль",
    "editTitle": "Редактировать стиль",
    "saveButton": "Сохранить стиль",
    "cancelButton": "Отмена",
    "defineSectionTitle": "1. Определение стиля",
    "styleNameLabel": "Название стиля",
    "descriptionLabel": "Описание",
    "generateDescriptionButton": "Сгенерировать",
    "generatingDescriptionButton": "Генерация...",
    "generateDescriptionTooltip": "Сгенерировать описание по названию и референсным изображениям",
    "descriptionPlaceholder": "Опишите стиль или сгенерируйте описание с помощью ИИ...",
    "rewriteDescriptionButton": "Переписать описание с ИИ (исп. {count} изобр.)",
    "rewriteDescriptionButtonPlural": "Переписать описание с ИИ (исп. {count} изобр.)",
    "rewritingDescriptionButton": "Переписывание...",
    "generationPromptLabel": "Промпт для генерации",
    "generationPromptPlaceholder": "Что сгенерировать в этом стиле. Например, 'Фотореалистичный кот в маленькой шляпе.'",
    "scoreSectionTitle": "2. Оценка стиля",
    "recalculateScoresButton": "Пересчитать оценки с ИИ (исп. {count} изобр.)",
    "recalculateScoresButtonPlural": "Пересчитать оценки с ИИ (исп. {count} изобр.)",
    "recalculatingScoresButton": "Пересчет...",
    "noAxesWarning": "Оси еще не созданы. Добавьте ось, чтобы начать оценку.",
    "gallerySectionTitle": "3. Управление галереей",
    "gallerySectionSubtitle": "Выберите изображения для использования в качестве референсов для анализа ИИ.",
    "addImagePlaceholder": "Добавить URL референсного изображения...",
    "addImageTooltip": "Добавить изображение по URL",
    "generateImageButton": "Сгенерировать новое изображение для стиля",
    "generatingImageButton": "Генерация изображения...",
    "generateImageTooltip": "Сгенерировать новое изображение для этого стиля с помощью ИИ",
    "imageAddErrorDuplicate": "Это изображение уже было добавлено.",
    "imageAddErrorGeneric": "Произошла неизвестная ошибка.",
    "selectForAITooltip": "Выбрать для анализа ИИ",
    "setAsCoverTooltip": "Установить как обложку",
    "removeImageTooltip": "Удалить изображение",
    "generationError": "Ошибка генерации. {error}",
    "corruptedImageError": "Не удалось обработать локальное изображение. Возможно, оно повреждено."
  },
  "axisEditorModal": {
    "createTitle": "Создать ось",
    "editTitle": "Редактировать ось",
    "saveButton": "Сохранить ось",
    "cancelButton": "Отмена",
    "axisNameLabel": "Название оси",
    "descriptionLabel": "Описание",
    "colorLabel": "Цвет",
    "analyzeAndScoreButton": "Анализировать и оценить все стили с помощью ИИ",
    "analyzingButton": "Анализ...",
    "analyzeAndScoreTooltip": "Использовать ИИ для автоматической оценки всех стилей на основе названия и описания этой оси.",
    "analysisSuccess": "Анализ завершен! Оценено стилей: {count}. Оценки будут применены при сохранении.",
    "analysisError": "Ошибка анализа: {error}"
  },
  "scoringWizardModal": {
    "title": "Оценка стилей для \"{axisName}\"",
    "description": "Установите оценку от {min} до {max} для каждого стиля на новой оси.",
    "applyScoresButton": "Применить оценки",
    "cancelButton": "Отмена"
  },
  "imageViewerModal": {
    "title": "Просмотр изображений ({current} / {total})"
  }
};

export type Language = 'en' | 'ru';
type Translations = typeof en;
type TranslationKey = keyof Translations;

const translations: Record<Language, Translations> = { en, ru };

// A helper type to create a deeply nested key structure like 'sidebar.title'
type NestedKey<T> =
    T extends object ? { [K in keyof T]-?: `${K & string}` | `${K & string}.${NestedKey<T[K]>}` }[keyof T] : never;

export type AppTranslationKey = NestedKey<Translations>;


interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: AppTranslationKey, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('ru'); // Default to Russian

    const t = useCallback((key: AppTranslationKey, replacements?: Record<string, string | number>) => {
        const keys = key.split('.');
        
        const getNestedValue = (obj: any, path: string[]): string | undefined => {
            return path.reduce((acc, currentKey) => acc && acc[currentKey], obj);
        };

        let translation = getNestedValue(translations[language], keys) || getNestedValue(translations['en'], keys);

        if (typeof translation !== 'string') {
            console.warn(`Translation key not found: ${key}`);
            return key;
        }

        if (replacements) {
            Object.entries(replacements).forEach(([placeholder, value]) => {
                const regex = new RegExp(`{${placeholder}}`, 'g');
                translation = (translation as string).replace(regex, String(value));
            });
        }
        return translation;
    }, [language]);
    
    // FIX: Replaced JSX with React.createElement to be compatible with a .ts file extension.
    // This resolves a series of parsing errors caused by using JSX in a non-TSX file.
    return React.createElement(
        LanguageContext.Provider,
        { value: { language, setLanguage, t } },
        children
    );
};

export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};
