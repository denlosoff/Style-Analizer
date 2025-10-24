

import React from 'react';

const iconProps = {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
};

export const PlusIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);

export const TrashIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
);

export const EditIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);

export const XIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export const FileDownIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);

export const FileUpIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
);

export const ListIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className}><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
);

export const ListTree: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className}><path d="M21 12H7"/><path d="M21 6H3"/><path d="M21 18H3"/><path d="M7 6v12"/></svg>
);

export const ChevronLeftIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className}><path d="m15 18-6-6 6-6"/></svg>
);

export const ChevronRightIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className}><path d="m9 18 6-6-6-6"/></svg>
);

export const ChevronDownIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className}><path d="m6 9 6 6 6-6"/></svg>
);

export const SparklesIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);

export const StarIcon: React.FC<{className?: string; isFilled?: boolean}> = ({className, isFilled}) => (
    <svg {...iconProps} className={className} fill={isFilled ? "currentColor" : "none"}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

export const RefreshCwIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className}><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/></svg>
);

export const CheckCircleIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

export const BotMessageSquareIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className}><path d="M12 6V2H8"/><path d="m8 18-4 4V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z"/><path d="M2 12h2"/><path d="M9 11v2"/><path d="M15 11v2"/><path d="M20 12h2"/></svg>
);

export const ListChecksIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className}><path d="M10 6h11"/><path d="M10 12h11"/><path d="M10 18h11"/><path d="M4 6.5 5 7.5l2-2"/><path d="m4 12.5 1 1 2-2"/><path d="m4 18.5 1 1 2-2"/></svg>
);

export const CameraIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
);

export const BarChart2Icon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className}><line x1="18" x2="18" y1="20" y2="10" /><line x1="12" x2="12" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="14" /></svg>
);

export const SearchIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
