'use client';

import { useState } from 'react';
import { useUpdateWorkspace, useDeleteWorkspace } from '../../../../../hooks/useWorkspaces';
import { Card, Button, Input } from 'ui';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from 'ui';

interface WorkspaceSettingsProps {
  workspace: { id: string; name: string; slug: string };
}

export function WorkspaceSettings({ workspace }: WorkspaceSettingsProps) {
  const router = useRouter();
  const [editName, setEditName] = useState(workspace.name);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { mutate: updateWorkspace, isPending: isUpdating } = useUpdateWorkspace();
  const { mutate: deleteWorkspace, isPending: isDeleting } = useDeleteWorkspace();

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || editName === workspace.name) return;
    updateWorkspace(
      { id: workspace.id, payload: { name: editName } },
      { onSuccess: () => toast.success('Workspace settings updated') }
    );
  };

  const handleDelete = () => {
    deleteWorkspace(workspace.id, {
      onSuccess: () => {
        setShowDeleteModal(false);
        router.push('/workspaces');
      }
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Workspace Details</h3>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Workspace Name</label>
            <Input
              placeholder={workspace.name}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Workspace URL Slug</label>
            <Input value={workspace.slug} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">The slug cannot be changed after creation.</p>
          </div>
          <Button type="submit" disabled={isUpdating || !editName.trim() || editName === workspace.name}>
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Card>

      <Card className="p-6 border-destructive/20 bg-destructive/5">
        <h3 className="text-lg font-bold text-destructive mb-2">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Deleting a workspace is irreversible and will permanently delete all associated files, data, and members.
        </p>
        <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
          Delete Workspace
        </Button>
      </Card>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Delete Workspace</h2>
            <p className="text-sm text-muted-foreground py-2">
              Are you sure you want to delete the workspace <strong>{workspace.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
