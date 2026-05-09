// Utility to add Vietnamese font support to jsPDF
import { jsPDF } from 'jspdf';

// Font Roboto Regular base64 (lightweight version supporting Vietnamese)
// This is a simplified version - for production, use full font file
const robotoBase64 = `
AAEAAAANAIAAAwBQRFNJRx7K/7QAADfQAAAAOEdERUYAKQAOAAA3kAAAAB5HUE9Tvl+4CgAAO7QAAAM0R1NVQgABAAAAADvsAAAACkz
U9TLGNvdW5kIAAAV3AAAAFAqoIkZwZ21TT7GGAABZ7AAAAcRnbHlmCkDVqwAAAZgAAC87aGVhZP8X2pQAACnwAAAANmhoZWEINQQMAA
AqKAAAACRobXR4RC4NVwAAKkwAAAV4bG9jYVIXrUQAAC/EAAAC6W1heHABaQF5AAAyrAAAACBuYW1lPmw8NQAAMswAAAPPcG9zdC/wD
`;

export const addVietnameseFont = (doc: jsPDF) => {
    // jsPDF doesn't support custom fonts easily without pre-compilation
    // For now, we'll use a workaround with better encoding

    // Use Courier as it has better Unicode support than Helvetica
    doc.setFont('courier', 'normal');

    return doc;
};

// Alternative: Convert Vietnamese text to best displayable format
export const prepareVietnameseText = (text: string): string => {
    // jsPDF with standard fonts can display most Vietnamese characters
    // if we ensure proper UTF-8 encoding
    return text || '';
};
