import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';

export function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [authError, setAuthError] = useState('');

  const loginMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/auth/login', data);
      return res.data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      navigate('/dashboard');
    },
    onError: (error: any) => {
      setAuthError(error.response?.data?.error || 'Failed to login. Please try again.');
    }
  });

  const onSubmit = (data: any) => {
    setAuthError('');
    loginMutation.mutate(data);
  };

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Log in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              {...register('email', { required: 'Email is required' })}
              error={errors.email?.message as string}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              {...register('password', { required: 'Password is required' })}
              error={errors.password?.message as string}
              placeholder="••••••••"
            />
            
            {authError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
                {authError}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full mt-6" 
              isLoading={loginMutation.isPending}
            >
              Log In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-500">
            Don't have an account? <Link to="/register" className="text-primary-DEFAULT hover:underline font-medium">Sign up</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
