import { useNavigate } from 'react-router-dom';
// import { TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { LoginForm } from './components/LoginForm';
import { AuthLayout, AuthFormCard, MobileAuthHeader } from './components/AuthLayout';

const LoginPage: React.FC = () => {
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    navigate('/');
  };

  return (
    <AuthLayout>
      <MobileAuthHeader
        icon={<div></div>}
        title="Welcome back"
        subtitle="Sign in to your account"
      />
      <AuthFormCard title="Welcome back" subtitle="Sign in to your account to continue">
        <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
      </AuthFormCard>
    </AuthLayout>
  );
};

export default LoginPage;
