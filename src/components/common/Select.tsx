/* eslint-disable */
import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';

export const Select = SelectPrimitive.Root;

export const SelectTrigger = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
        ref={ref}
        className={
            'w-full px-4 py-3 border-2 border-[#F5F0EB] rounded-2xl bg-white text-left flex justify-between items-center focus:outline-none focus:border-black'
        }
        {...props}
    >
        <SelectPrimitive.Value placeholder="Select one option" />
        {children}
        <SelectPrimitive.Icon>
            <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export const SelectContent = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ children, ...props }, ref) => (
    <SelectPrimitive.Portal>
        <SelectPrimitive.Content
            ref={ref}
            position="popper"
            sideOffset={6}
            className="
                z-[9999] 
                min-w-[var(--radix-select-trigger-width)]
                bg-white border border-gray-200 
                rounded-xl shadow-lg 
                overflow-hidden
            "
            {...props}
        >
            <SelectPrimitive.Viewport
                className="
                    py-2 
                    max-h-50       /* 🎯 GIỚI HẠN CHIỀU CAO 240px */
                    overflow-auto  /* 🎯 TỰ ĐỘNG SCROLL */
                "
            >
                {children}
            </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
));


SelectContent.displayName = SelectPrimitive.Content.displayName;

export const SelectItem = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
        ref={ref}
        className="px-3 py-2 rounded-xl text-sm text-black cursor-pointer hover:bg-gray-100 flex items-center justify-between"
        {...props}
    >
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        <SelectPrimitive.ItemIndicator>
            <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
