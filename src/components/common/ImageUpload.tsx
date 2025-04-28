import React, { useState, useRef, ChangeEvent } from 'react';
import { FaUpload, FaImage, FaTrash, FaSpinner } from 'react-icons/fa';
import { uploadFile } from '../../utils/api';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  initialImage?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageUploaded, 
  initialImage = '',
  className = ''
}) => {
  const [image, setImage] = useState<string>(initialImage);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/i)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Create a local preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      // Upload the file
      const result = await uploadFile(file);
      
      // Set the image URL from the server response
      if (result.success && result.file.url) {
        setImage(result.file.url);
        onImageUploaded(result.file.url);
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setImage('');
    onImageUploaded('');
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
      />

      {error && (
        <div className="mb-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {image ? (
        <div className="relative">
          <img
            src={image}
            alt="Uploaded"
            className="w-full h-auto rounded-lg object-cover"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            disabled={isUploading}
          >
            <FaTrash className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors"
        >
          {isUploading ? (
            <>
              <FaSpinner className="h-8 w-8 text-primary-500 animate-spin mb-2" />
              <span className="text-sm text-gray-500">Uploading...</span>
            </>
          ) : (
            <>
              <FaImage className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500 mb-1">Click to upload an image</span>
              <span className="text-xs text-gray-400">JPEG, PNG, GIF, WEBP (max 5MB)</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
