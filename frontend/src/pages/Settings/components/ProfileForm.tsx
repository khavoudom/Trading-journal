import { AlertCircle, CheckCircle, User, Mail, Lock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/Button';

interface ProfileFormProps {
  username: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  loading: boolean;
  localError: string | null;
  success: boolean;
  onUsernameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onCurrentPasswordChange: (v: string) => void;
  onNewPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export function ProfileForm({
  username,
  email,
  currentPassword,
  newPassword,
  loading,
  localError,
  success,
  onUsernameChange,
  onEmailChange,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onSubmit,
}: ProfileFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {localError && (
        <div className="p-3 rounded-md bg-orange-subtle border border-orange/20 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-orange shrink-0" />
          <p className="text-xs text-orange">{localError}</p>
        </div>
      )}
      {success && (
        <div className="p-3 rounded-md bg-green-subtle border border-green/20 flex items-center gap-2.5">
          <CheckCircle className="w-4 h-4 text-green shrink-0" />
          <p className="text-xs text-green">Profile updated successfully</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>
            <User className="w-3 h-3 inline mr-1" />
            Username
          </Label>
          <Input value={username} onChange={(e) => onUsernameChange(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>
            <Mail className="w-3 h-3 inline mr-1" />
            Email
          </Label>
          <Input type="email" value={email} onChange={(e) => onEmailChange(e.target.value)} />
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <p className="text-sm font-medium text-text mb-3">Change Password</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>
              <Lock className="w-3 h-3 inline mr-1" />
              Current Password
            </Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => onCurrentPasswordChange(e.target.value)}
              placeholder="Leave blank to keep"
            />
          </div>
          <div className="space-y-1.5">
            <Label>
              <Lock className="w-3 h-3 inline mr-1" />
              New Password
            </Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => onNewPasswordChange(e.target.value)}
              placeholder="Leave blank to keep"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
}
