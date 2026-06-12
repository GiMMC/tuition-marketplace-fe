import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';

export function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      role: 'PARENT',
      email: '',
      password: '',
      displayName: ''
    }
  });
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [authError, setAuthError] = useState('');
  
  const role = watch('role');

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/auth/register', data);
      return res.data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      navigate('/dashboard');
    },
    onError: (error: any) => {
      setAuthError(error.response?.data?.error || 'Failed to register. Please try again.');
    }
  });

  const onSubmit = (data: any) => {
    setAuthError('');
    registerMutation.mutate(data);
  };

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Join TuitionMatch to find or offer tuition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">I am a...</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    value="PARENT" 
                    className="w-4 h-4 text-primary-DEFAULT"
                    {...register('role')} 
                  />
                  <span>Parent</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    value="TUTOR" 
                    className="w-4 h-4 text-primary-DEFAULT"
                    {...register('role')} 
                  />
                  <span>Tutor</span>
                </label>
              </div>
            </div>

            {role === 'TUTOR' && (
              <Input
                label="Display Name"
                {...register('displayName', { required: role === 'TUTOR' ? 'Display name is required' : false })}
                error={errors.displayName?.message as string}
                placeholder="e.g. John Doe, BSc Math"
              />
            )}

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
              {...register('password', { 
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
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
              isLoading={registerMutation.isPending}
            >
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-500">
            Already have an account? <Link to="/login" className="text-primary-DEFAULT hover:underline font-medium">Log in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
