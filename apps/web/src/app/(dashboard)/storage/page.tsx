'use client';

import { useState, useRef } from 'react';
import { useUploadImage } from '../../../hooks/useStorage';
import { HardDrive, Upload, Image as ImageIcon, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { GlassCard, Button } from 'ui';

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
        <h1 className="text-2xl font-bold flex items-center">
          <HardDrive className="mr-3 text-muted-foreground" />
          Storage & Uploads
        </h1>
      </div>

      <GlassCard className="p-6 sm:p-8">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold">Upload an Image</h2>
            <p className="text-sm text-muted-foreground mt-2">
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
                  ? 'border-primary bg-primary/10' 
                  : isPending 
                    ? 'border-border bg-black/5 dark:bg-white/5 opacity-70' 
                    : 'border-border hover:border-muted-foreground hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {isPending ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-full max-w-xs bg-black/10 dark:bg-white/10 rounded-full h-2.5 mb-2">
                    <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Uploading... {progress}%</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="p-4 bg-black/5 dark:bg-white/5 rounded-full">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <button 
                      type="button" 
                      onClick={() => inputRef.current?.click()}
                      className="font-semibold text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                    >
                      Click to upload
                    </button>
                    <span className="text-muted-foreground"> or drag and drop</span>
                  </div>
                </div>
              )}
            </div>
          </form>

          {error && (
            <div className="mt-6 p-4 rounded-md bg-destructive/10 border border-destructive/20 flex items-start">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {uploadedFileUrl && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  Upload Successful
                </h3>
              </div>
              <div className="border border-border rounded-lg overflow-hidden bg-black/5 dark:bg-white/5 p-2">
                <div className="relative aspect-video rounded-md overflow-hidden bg-black/10 dark:bg-white/10 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={uploadedFileUrl} 
                    alt="Uploaded file" 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="mt-3 flex items-center bg-background border border-border rounded-md p-2">
                  <div className="flex-1 truncate text-xs text-muted-foreground mr-2 select-all">
                    {uploadedFileUrl}
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(uploadedFileUrl)}
                  >
                    Copy URL
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
