'use client';

import { useState, useRef } from 'react';
import { useUploadImage } from '../../../hooks/useStorage';
import { HardDrive, Upload, Image as ImageIcon, X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function StoragePage() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: uploadImage, isPending, progress } = useUploadImage();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndUpload = async (file: File) => {
    setError(null);
    setUploadedFileUrl(null);
    
    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Only JPG, PNG and WebP files are allowed');
      return;
    }

    try {
      const response = await uploadImage({ file, workspaceId: 'default' });
      setUploadedFileUrl(response.url);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload image. Please try again.');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await validateAndUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <HardDrive className="mr-3 text-gray-400" />
          Storage & Uploads
        </h1>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-6 sm:p-8">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload an Image</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
              JPG, PNG or WebP up to 10MB
            </p>
          </div>

          <form onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
            <input 
              ref={inputRef} 
              type="file" 
              className="hidden" 
              accept="image/jpeg, image/jpg, image/png, image/webp"
              onChange={handleChange}
              disabled={isPending}
            />
            
            <div 
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' 
                  : isPending 
                    ? 'border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 opacity-70' 
                    : 'border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {isPending ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-full max-w-xs bg-gray-200 dark:bg-zinc-700 rounded-full h-2.5 mb-2">
                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-zinc-300">Uploading... {progress}%</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="p-4 bg-gray-100 dark:bg-zinc-800 rounded-full">
                    <Upload className="w-8 h-8 text-gray-500 dark:text-zinc-400" />
                  </div>
                  <div>
                    <button 
                      type="button" 
                      onClick={() => inputRef.current?.click()}
                      className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      Click to upload
                    </button>
                    <span className="text-gray-500 dark:text-zinc-400"> or drag and drop</span>
                  </div>
                </div>
              )}
            </div>
          </form>

          {error && (
            <div className="mt-6 p-4 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {uploadedFileUrl && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  Upload Successful
                </h3>
              </div>
              <div className="border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-zinc-950 p-2">
                <div className="relative aspect-video rounded-md overflow-hidden bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={uploadedFileUrl} 
                    alt="Uploaded file" 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="mt-3 flex items-center bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-md p-2">
                  <div className="flex-1 truncate text-xs text-gray-500 dark:text-zinc-400 mr-2 select-all">
                    {uploadedFileUrl}
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(uploadedFileUrl)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 text-xs font-medium rounded transition-colors"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
