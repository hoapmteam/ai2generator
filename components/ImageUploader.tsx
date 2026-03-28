
import React, { useRef } from 'react';
import ImageIcon from './icons/ImageIcon';

interface ImageUploaderProps {
    id: string;
    onImageChange: (file: File | null) => void;
    previewUrl: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, onImageChange, previewUrl }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        onImageChange(file);
    };

    const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const file = event.dataTransfer.files?.[0] || null;
        onImageChange(file);
    };

    const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    return (
        <div className="aspect-square w-full">
            <input
                type="file"
                id={id}
                ref={inputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
            />
            <label
                htmlFor={id}
                className="w-full h-full flex justify-center items-center border-2 border-dashed border-gray-500 rounded-lg cursor-pointer bg-base-300 hover:bg-base-100 hover:border-brand-light transition-colors duration-200"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-md" />
                ) : (
                    <div className="text-center text-gray-400">
                        <ImageIcon className="w-10 h-10 mx-auto mb-2" />
                        <span className="text-sm">Nhấn hoặc kéo ảnh vào đây</span>
                    </div>
                )}
            </label>
        </div>
    );
};

export default ImageUploader;
