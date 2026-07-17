'use client';

import { useState, useRef } from 'react';
import { useUploadImage } from '../../../hooks/useStorage';
import { useOrganizations } from '../../../hooks/useOrganizations';
import { useWorkspaces } from '../../../hooks/useWorkspaces';
import { HardDrive, Upload, Image as ImageIcon, X, CheckCircle2, AlertCircle, Copy, Link as LinkIcon } from 'lucide-react';
import { GlassCard, Button } from 'ui';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function StoragePage() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: uploadImage, isPending, progress } = useUploadImage();
  const { data: orgsResponse } = useOrganizations();
  const firstOrgId = orgsResponse?.data?.[0]?.id;
  const { data: wsResponse } = useWorkspaces(firstOrgId || '');
  const activeWorkspaceId = wsResponse?.data?.[0]?.id;

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
      if (!activeWorkspaceId) {
        setError('No active workspace found. Please create a workspace first.');
        return;
      }
      const response = await uploadImage({ file, workspaceId: activeWorkspaceId });
      setUploadedFileUrl(response.url);
      toast.success('Image uploaded successfully');
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

  const handleCopy = () => {
    if (uploadedFileUrl) {
      navigator.clipboard.writeText(uploadedFileUrl);
      toast.success('URL copied to clipboard');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <HardDrive className="w-6 h-6 text-blue-500" />
            </div>
            Storage & Uploads
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage assets and upload new media.</p>
        </div>
      </div>

      <GlassCard className="p-8 sm:p-12 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="max-w-xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight">Upload Media</h2>
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
            
            <motion.div 
              whileHover={!isPending ? { scale: 1.01 } : {}}
              whileTap={!isPending ? { scale: 0.99 } : {}}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer overflow-hidden ${
                dragActive 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : isPending 
                    ? 'border-border/50 bg-black/5 dark:bg-white/5 cursor-wait' 
                    : 'border-border/50 hover:border-blue-500/50 hover:bg-blue-500/5'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !isPending && inputRef.current?.click()}
            >
              <AnimatePresence mode="wait">
                {isPending ? (
                  <motion.div 
                    key="uploading"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center justify-center space-y-6 py-4"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-blue-500 animate-bounce" />
                      </div>
                      <svg className="absolute -inset-2 w-20 h-20 rotate-[-90deg]">
                        <circle
                          cx="40"
                          cy="40"
                          r="38"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="text-blue-500/20"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="38"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeDasharray="238.76"
                          strokeDashoffset={238.76 - (progress / 100) * 238.76}
                          className="text-blue-500 transition-all duration-300"
                        />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">Uploading file...</p>
                      <p className="text-xs text-muted-foreground">{progress}% complete</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center justify-center space-y-4"
                  >
                    <div className={`p-5 rounded-2xl transition-colors ${dragActive ? 'bg-blue-500/20 text-blue-500' : 'bg-black/5 dark:bg-white/5 text-muted-foreground'}`}>
                      <Upload className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="font-semibold text-base mb-1">
                        Click to upload <span className="font-normal text-muted-foreground">or drag and drop</span>
                      </p>
                      <p className="text-xs text-muted-foreground">High resolution images recommended</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </form>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm font-medium text-destructive mt-0.5">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {uploadedFileUrl && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8"
              >
                <div className="border border-border/50 rounded-2xl overflow-hidden bg-background/50 backdrop-blur-xl shadow-xl shadow-black/5">
                  <div className="flex items-center justify-between p-4 border-b border-border/50 bg-black/[0.02] dark:bg-white/[0.02]">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      Upload Successful
                    </h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 flex items-center justify-center group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={uploadedFileUrl} 
                        alt="Uploaded file" 
                        className="max-w-full max-h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" onClick={() => window.open(uploadedFileUrl, '_blank')} className="rounded-xl shadow-lg">
                          <ImageIcon className="w-4 h-4 mr-2" />
                          View Full Size
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 border border-border/50 rounded-xl p-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-background shadow-sm">
                        <LinkIcon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 truncate text-sm text-muted-foreground font-mono px-2 select-all">
                        {uploadedFileUrl}
                      </div>
                      <Button 
                        variant="secondary"
                        size="sm"
                        onClick={handleCopy}
                        className="rounded-lg shadow-sm"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy URL
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>
    </motion.div>
  );
}
