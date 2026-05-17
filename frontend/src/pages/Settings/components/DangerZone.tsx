import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function DangerZone({ onDeleteAccount }: { onDeleteAccount: () => void }) {
  return (
    <div className="p-4 rounded-lg border border-orange/20 bg-orange-subtle/50">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-orange/10 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 text-orange" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text">Delete Account</p>
          <p className="text-xs text-text2 mt-1">
            Permanently delete your account and all associated data. This includes all spaces,
            trades, and plan data. This action cannot be undone.
          </p>
          <Button onClick={onDeleteAccount} variant="destructive" className="mt-3">
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
