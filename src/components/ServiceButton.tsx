import React from 'react';

interface ServiceButtonProps {
    text?: string;
    href?: string;
}

const ServiceButton: React.FC<ServiceButtonProps> = ({
    text = 'Reserve',
    href = '#',
}) => {
    return (
        <a
            href={href}
            className="inline-block px-8 py-3 rounded-md text-lg font-serif
                       bg-white text-black border border-gray-300
                       hover:bg-[#CCBDA3] hover:text-black hover:border-transparent
                       transition-all duration-300 text-center"
        >
            {text}
        </a>
    );
};

export default ServiceButton;
