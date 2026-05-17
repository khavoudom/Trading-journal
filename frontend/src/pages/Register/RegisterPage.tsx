import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { RegisterForm } from './components/RegisterForm';
import { AuthLayout, AuthFormCard, MobileAuthHeader } from '@/pages/Login/components/AuthLayout';

const RegisterPage: React.FC = () => {
  const { register, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleRegister = async (username: string, email: string, password: string) => {
    await register(username, email, password);
    navigate('/');
  };

  return (
    <AuthLayout>
      <MobileAuthHeader
        icon={<div></div>}
        title="Create your account"
        subtitle="Start tracking your trading journey"
      />
      <AuthFormCard title="Create your account" subtitle="Start tracking your trading journey">
        <RegisterForm onSubmit={handleRegister} loading={loading} error={error} />
      </AuthFormCard>
    </AuthLayout>
  );
};

export default RegisterPage;
