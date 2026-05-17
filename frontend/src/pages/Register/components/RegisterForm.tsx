import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader2, ArrowRight, Mail, Lock, User } from 'lucide-react';

export function RegisterForm({
  onSubmit,
  loading,
  error,
}: {
  onSubmit: (username: string, email: string, password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<'username' | 'email' | 'password' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await onSubmit(username, email, password);
    } catch (err: any) {
      setLocalError(err.message || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {(localError || error) && (
        <div className="p-3.5 rounded-xl bg-orange/8 border border-orange/15 flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-orange shrink-0 mt-0.5" />
          <p className="text-xs text-orange">{localError || error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text2">Username</label>
          <div className="relative group">
            <User
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                focusedField === 'username' ? 'text-green' : 'text-gray-500'
              }`}
            />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
              className="w-full h-11 pl-10 pr-3.5 text-sm bg-bg border border-border rounded-xl text-text placeholder:text-gray-500 outline-none transition-all duration-200 focus:border-green focus:shadow-[0_0_0_3px] focus:shadow-green/10"
              placeholder="Choose a username"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text2">Email</label>
          <div className="relative group">
            <Mail
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                focusedField === 'email' ? 'text-green' : 'text-gray-500'
              }`}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              className="w-full h-11 pl-10 pr-3.5 text-sm bg-bg border border-border rounded-xl text-text placeholder:text-gray-500 outline-none transition-all duration-200 focus:border-green focus:shadow-[0_0_0_3px] focus:shadow-green/10"
              placeholder="name@example.com"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text2">Password</label>
          <div className="relative group">
            <Lock
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                focusedField === 'password' ? 'text-green' : 'text-gray-500'
              }`}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              className="w-full h-11 pl-10 pr-3.5 text-sm bg-bg border border-border rounded-xl text-text placeholder:text-gray-500 outline-none transition-all duration-200 focus:border-green focus:shadow-[0_0_0_3px] focus:shadow-green/10"
              placeholder="Create a password"
              required
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 flex items-center justify-center gap-2 text-sm font-semibold bg-linear-to-r from-accent to-accent/80 text-black rounded-xl hover:from-accent/90 hover:to-accent/70 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 shadow-lg shadow-accent/20 hover:shadow-accent/30 active:scale-[0.98]"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating account...
          </>
        ) : (
          <>
            Create account
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <div className="pt-5 border-t border-border text-center">
        <p className="text-xs text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-green hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
}
