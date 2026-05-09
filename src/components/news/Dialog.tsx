/* eslint-disable */
import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

// ===== PORTAL WRAPPER =====
const DialogPortal = ({
    children,
    ...props
}: DialogPrimitive.DialogPortalProps) => (
    <DialogPrimitive.Portal {...props}>
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-center">
                {children}
            </div>
        </AnimatePresence>
    </DialogPrimitive.Portal>
);

// ===== BACKDROP WITH MOTION =====
const DialogOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay asChild forceMount>
        <motion.div
            ref={ref}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            {...props}
        />
    </DialogPrimitive.Overlay>
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// ===== CONTENT WITH MOTION =====
const DialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />

        <DialogPrimitive.Content asChild forceMount>
            <motion.div
                ref={ref}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="fixed z-50 grid w-full gap-4 rounded-xl border border-cream bg-white p-6 shadow-xl sm:max-w-2xl md:w-full"
                {...(props as any)}
            >
                {children}

                <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition hover:opacity-100 focus:outline-none">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                    >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </DialogPrimitive.Close>
            </motion.div>
        </DialogPrimitive.Content>
    </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

// ===== HEADER =====
const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className="flex flex-col space-y-1.5 text-center sm:text-center"
        {...props}
    />
);
DialogHeader.displayName = 'DialogHeader';

// ===== FOOTER =====
const DialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div {...props} />;
DialogFooter.displayName = 'DialogFooter';

// ===== TITLE =====
const DialogTitle = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className="text-4xl font-serif mt-4"
        {...props}
    />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

// ===== DESCRIPTION =====
const DialogDescription = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className="text-sm text-muted-foreground"
        {...props}
    />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogClose,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
};
