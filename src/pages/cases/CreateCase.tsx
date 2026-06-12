import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';
import { useState } from 'react';

export function CreateCase() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState('');

  const createCaseMutation = useMutation({
    mutationFn: async (data: any) => {
      // Convert budget to number
      if (data.budgetPerHour) {
        data.budgetPerHour = Number(data.budgetPerHour);
      }
      const res = await api.post('/cases', data);
      return res.data;
    },
    onSuccess: (data) => {
      navigate(`/cases/${data.case.id}`);
    },
    onError: (error: any) => {
      setSubmitError(error.response?.data?.error || 'Failed to create case');
    }
  });

  const onSubmit = (data: any) => {
    setSubmitError('');
    createCaseMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Post a New Tuition Case</CardTitle>
          <CardDescription>
            Fill in the details below to request a tutor. Once created, you can invite tutors to view it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Title"
              {...register('title', { required: 'Title is required' })}
              error={errors.title?.message as string}
              placeholder="e.g. Need Math Tutor for P5"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Subject"
                {...register('subject', { required: 'Subject is required' })}
                error={errors.subject?.message as string}
                placeholder="e.g. Mathematics"
              />
              <Input
                label="Level"
                {...register('level', { required: 'Level is required' })}
                error={errors.level?.message as string}
                placeholder="e.g. Primary 5"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Location (Optional)"
                {...register('location')}
                placeholder="e.g. Bishan, or Online"
              />
              <Input
                label="Budget Per Hour (Optional)"
                type="number"
                {...register('budgetPerHour')}
                placeholder="e.g. 50"
              />
            </div>
            
            {submitError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
                {submitError}
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={createCaseMutation.isPending}>
                Create Case
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
