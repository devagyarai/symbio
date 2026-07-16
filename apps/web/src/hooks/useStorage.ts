import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useState } from 'react';

export function useUploadImage() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async ({ file, workspaceId }: { file: File, workspaceId: string }) => {
      const formData = new FormData();
      formData.append('image', file);

      const { data } = await api.post(`/upload/image?workspaceId=${workspaceId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      // Would also invalidate files list if we had a dedicated endpoint for it
      setProgress(0);
    },
    onError: () => {
      setProgress(0);
    }
  });

  return { ...mutation, progress };
}
