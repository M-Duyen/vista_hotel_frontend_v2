import { useEffect, useRef } from 'react';

export default function ModalContainer({
    title,
    children,
    onClose,
}: {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';

        // Handle ESC key to close modal
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        // Handle click outside modal content to close
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.body.style.overflow = 'auto';
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 p-4">
            <div
                ref={modalRef}
                className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                style={{ animation: 'modalFadeIn 0.3s' }}
            >
                <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-cream flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-2xl leading-none hover:text-gray-700 transition-colors"
                    >
                        &times;
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
}
