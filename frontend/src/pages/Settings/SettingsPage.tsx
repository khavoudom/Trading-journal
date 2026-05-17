import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Panel, PanelHeader, PanelBody } from '@/components/ui/panel';
import { useAuthStore } from '@/store/authStore';
import { useSpaceStore } from '@/store/spaceStore';
import { ProfileForm } from './components/ProfileForm';
import { SpaceManager } from './components/SpaceManager';
import { DangerZone } from './components/DangerZone';
import { DeleteDialog } from './components/DeleteDialog';
import { Switch } from '@/pages/RiskManager/components/Switch';

interface SettingsPageProps {
  showAlertsPage: boolean;
  onShowAlertsPageChange: (value: boolean) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ showAlertsPage, onShowAlertsPageChange }) => {
  const navigate = useNavigate();
  const { user, updateProfile, deleteAccount, loading } = useAuthStore();
  const { spaces, createSpace, renameSpace, deleteSpace } = useSpaceStore();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [newSpaceName, setNewSpaceName] = useState('');
  const [creatingSpace, setCreatingSpace] = useState(false);
  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null);
  const [editingSpaceName, setEditingSpaceName] = useState('');
  const [renamingSpace, setRenamingSpace] = useState(false);

  const [deleteSpaceTarget, setDeleteSpaceTarget] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [deleteSpacePassword, setDeleteSpacePassword] = useState('');
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteAccountPassword, setDeleteAccountPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccess(false);

    const data: {
      username?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    } = {};
    if (username !== user?.username) data.username = username;
    if (email !== user?.email) data.email = email;
    if (newPassword) {
      if (!currentPassword) {
        setLocalError('Current password is required to set a new password');
        return;
      }
      data.currentPassword = currentPassword;
      data.newPassword = newPassword;
    }

    if (Object.keys(data).length === 0) {
      setLocalError('No changes to save');
      return;
    }

    try {
      await updateProfile(data);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleCreateSpace = async () => {
    if (!newSpaceName.trim()) return;
    setCreatingSpace(true);
    try {
      const space = await createSpace(newSpaceName.trim());
      setNewSpaceName('');
      navigate(`/space/${space.id}/settings`);
    } catch {
      // silent
    } finally {
      setCreatingSpace(false);
    }
  };

  const handleRenameSpace = async (id: string) => {
    if (!editingSpaceName.trim()) return;
    setRenamingSpace(true);
    try {
      await renameSpace(id, editingSpaceName.trim());
      setEditingSpaceId(null);
      setEditingSpaceName('');
    } catch {
      // silent
    } finally {
      setRenamingSpace(false);
    }
  };

  const handleDeleteSpaceConfirm = async () => {
    if (!deleteSpaceTarget) return;
    await deleteSpace(deleteSpaceTarget.id, deleteSpacePassword);
    setDeleteSpaceTarget(null);
    setDeleteSpacePassword('');
  };

  const handleDeleteAccountConfirm = async () => {
    await deleteAccount(deleteAccountPassword);
  };

  const isLastSpace = spaces.length <= 1;

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Panel>
        <PanelHeader>
          <div>
            <div className="text-[13px] font-bold text-text">Profile Settings</div>
            <div className="text-[11px] text-text2">Update your account information</div>
          </div>
        </PanelHeader>
        <PanelBody>
          <ProfileForm
            username={username}
            email={email}
            currentPassword={currentPassword}
            newPassword={newPassword}
            loading={loading}
            localError={localError}
            success={success}
            onUsernameChange={setUsername}
            onEmailChange={setEmail}
            onCurrentPasswordChange={setCurrentPassword}
            onNewPasswordChange={setNewPassword}
            onSubmit={handleSubmit}
          />
        </PanelBody>
      </Panel>

      {/* Navigation Preferences */}
      <Panel>
        <PanelHeader>
          <div>
            <div className="text-[13px] font-bold text-text">Navigation</div>
            <div className="text-[11px] text-text2">Choose which workspace pages are visible</div>
          </div>
        </PanelHeader>
        <PanelBody>
          <div className="flex items-center justify-between gap-4 rounded-md bg-surface2 p-3">
            <div>
              <p className="text-sm font-medium text-text">Alerts page</p>
              <p className="text-[11px] text-text2">
                Show Alerts & Insights in the workspace navigation.
              </p>
            </div>
            <Switch checked={showAlertsPage} onCheckedChange={onShowAlertsPageChange} />
          </div>
        </PanelBody>
      </Panel>

      {/* Space Management */}
      <Panel>
        <PanelHeader>
          <div>
            <div className="text-[13px] font-bold text-text">Trading Spaces</div>
            <div className="text-[11px] text-text2">Manage your trading spaces</div>
          </div>
        </PanelHeader>
        <PanelBody>
          <SpaceManager
            spaces={spaces}
            editingSpaceId={editingSpaceId}
            editingSpaceName={editingSpaceName}
            renamingSpace={renamingSpace}
            newSpaceName={newSpaceName}
            creatingSpace={creatingSpace}
            isLastSpace={isLastSpace}
            onStartEdit={(id, name) => {
              setEditingSpaceId(id);
              setEditingSpaceName(name);
            }}
            onEditingNameChange={setEditingSpaceName}
            onSaveEdit={handleRenameSpace}
            onCancelEdit={() => {
              setEditingSpaceId(null);
              setEditingSpaceName('');
            }}
            onDelete={(space) => setDeleteSpaceTarget(space)}
            onNewSpaceNameChange={setNewSpaceName}
            onCreateSpace={handleCreateSpace}
          />
        </PanelBody>
      </Panel>

      {/* Delete Account */}
      <Panel>
        <PanelHeader>
          <div className="text-[13px] font-bold text-text">Danger Zone</div>
        </PanelHeader>
        <PanelBody>
          <DangerZone onDeleteAccount={() => setShowDeleteAccount(true)} />
        </PanelBody>
      </Panel>

      {/* Delete Space Dialog */}
      <DeleteDialog
        open={!!deleteSpaceTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteSpaceTarget(null);
            setDeleteSpacePassword('');
          }
        }}
        title={`Delete "${deleteSpaceTarget?.name || ''}"`}
        description="All trades and plan data in this space will be permanently deleted. This cannot be undone. Enter your password to confirm."
        password={deleteSpacePassword}
        onPasswordChange={setDeleteSpacePassword}
        onConfirm={handleDeleteSpaceConfirm}
        confirmLabel="Delete Space"
      />

      {/* Delete Account Dialog */}
      <DeleteDialog
        open={showDeleteAccount}
        onOpenChange={(open) => {
          if (!open) {
            setShowDeleteAccount(false);
            setDeleteAccountPassword('');
          }
        }}
        title="Delete Account"
        description="Your account, all spaces, trades, and plan data will be permanently deleted. This cannot be undone. Enter your password to confirm."
        password={deleteAccountPassword}
        onPasswordChange={setDeleteAccountPassword}
        onConfirm={handleDeleteAccountConfirm}
        confirmLabel="Delete Account"
      />
    </div>
  );
};

export default SettingsPage;
