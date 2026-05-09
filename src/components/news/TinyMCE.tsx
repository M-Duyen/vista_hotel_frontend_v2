/*eslint-disable*/
import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface TinyMCEProps {
    initialValue: string;
    onChange: (content: string) => void;
}

const TinyMCE: React.FC<TinyMCEProps> = ({ initialValue, onChange }) => {
    const editorRef = useRef<any>(null);
    return (
        <Editor
            // Recommended way: let the React wrapper load Tiny via apiKey
            apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
            onInit={(_, editor) => (editorRef.current = editor)}
            initialValue={initialValue}
            init={{
                height: 400,
                menubar: 'file edit view insert format tools table help',
                toolbar_mode: 'wrap',
                plugins: [
                    'advlist',
                    'autolink',
                    'lists',
                    'link',
                    'image',
                    'charmap',
                    'preview',
                    'anchor',
                    'searchreplace',
                    'visualblocks',
                    'code',
                    'fullscreen',
                    'insertdatetime',
                    'media',
                    'table',
                    'help',
                    'wordcount',
                ],
                toolbar:
                    'undo redo | blocks | bold italic underline | ' +
                    'forecolor backcolor | alignleft aligncenter alignright alignjustify | ' +
                    'bullist numlist outdent indent | removeformat | link image table | code help',
                // Optional: custom color palette
                color_map: [
                    '000000',
                    'Black',
                    '7f8c8d',
                    'Gray',
                    'ffffff',
                    'White',
                    'e74c3c',
                    'Red',
                    'f1c40f',
                    'Yellow',
                    '2ecc71',
                    'Green',
                    '3498db',
                    'Blue',
                    '9b59b6',
                    'Purple',
                    'f39c12',
                    'Orange',
                ],
                content_style:
                    'body { font-family: Poppins, sans-serif; font-size: 14px }',
                images_upload_handler: (blobInfo) => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = () => reject('Could not read file');
                        reader.readAsDataURL(blobInfo.blob());
                    });
                },
            }}
            onEditorChange={(content) => onChange(content)}
        />
    );
};

export default TinyMCE;
