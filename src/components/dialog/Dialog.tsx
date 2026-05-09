import React from "react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  children,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Dialog Container */}
      <div className="relative z-50 w-4xl ml-60" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogContent: React.FC<DialogContentProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-2xl w-full ${className}`}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  );
};

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`px-6 pt-6 pb-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogTitle: React.FC<DialogTitleProps> = ({
  children,
  className = "",
}) => {
  return (
    <h2 className={`text-xl font-bold text-gray-900 ${className}`}>
      {children}
    </h2>
  );
};
