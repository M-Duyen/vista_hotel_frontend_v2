import React, { type ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    buttonText: string;
    buttonIcon: ReactNode;
    onButtonClick: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    buttonText,
    buttonIcon,
    onButtonClick,
}) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-playfair font-bold">{title}</h1>
            <button
                onClick={onButtonClick}
                className="bg-gold hover:bg-gold/90 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
            >
                <span>{buttonIcon}</span>
                <span>{buttonText}</span>
            </button>
        </div>
    );
};

export default PageHeader;
