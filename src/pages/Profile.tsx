import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { api } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { UserCircle, Upload, FileText, Download } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

export function Profile() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  const { register, handleSubmit, reset } = useForm();

  const { data: tutorData, isLoading: tutorLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const res = await api.get('/tutors/me');
      return res.data;
    },
  });

  const { data: docsData, isLoading: docsLoading } = useQuery({
    queryKey: ['my-documents', tutorData?.id],
    queryFn: async () => {
      if (!tutorData?.id) return { documents: [] };
      // Fetch the full tutor profile which includes the documents array
      const res = await api.get(`/tutors/${tutorData.id}`);
      return { documents: res.data.tutor.documents || [] };
    },
    enabled: !!tutorData?.id
  });

  useEffect(() => {
    if (tutorData && tutorData.id) {
      reset({
        displayName: tutorData.displayName,
        qualifications: tutorData.qualifications || '',
        experiences: tutorData.experiences || '',
      });
    }
  }, [tutorData, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.patch('/tutors/me', data);
      return res.data;
    },
    onSuccess: () => {
      setUpdateSuccess('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      setTimeout(() => setUpdateSuccess(''), 3000);
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/tutors/me/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-documents'] });
      if (fileInputRef.current) fileInputRef.current.value = '';
      setUploadError('');
    },
    onError: (error: any) => {
      setUploadError(error.response?.data?.error || 'Failed to upload document');
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError('File size exceeds 5MB limit');
      return;
    }

    uploadMutation.mutate(file);
  };

  const handleDownload = async (docId: string, filename: string) => {
    try {
      // The backend download endpoint is /api/documents/[id]/download and returns a signedUrl
      const res = await api.get(`/documents/${docId}/download`);
      const signedUrl = res.data.signedUrl;
      
      const fileRes = await fetch(signedUrl);
      const blob = await fileRes.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  const onSubmit = (data: any) => {
    updateMutation.mutate(data);
  };

  if (tutorLoading) {
    return <div className="flex justify-center py-12">Loading profile...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <UserCircle className="h-8 w-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Public Information</CardTitle>
            <CardDescription>Update your display name, qualifications, and experience</CardDescription>
          </CardHeader>
          <CardContent>
            <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Display Name"
                {...register('displayName', { required: 'Display name is required' })}
              />
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Qualifications</label>
                <textarea
                  {...register('qualifications')}
                  className="w-full min-h-[100px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT"
                  placeholder="e.g. BSc Mathematics, NUS, 2022"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Experience</label>
                <textarea
                  {...register('experiences')}
                  className="w-full min-h-[100px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT"
                  placeholder="e.g. 3 years teaching Sec 4 A-Math"
                />
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-4 border-t border-slate-100 pt-6">
            {updateSuccess && (
              <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md w-full text-center">
                {updateSuccess}
              </div>
            )}
            <Button type="submit" form="profile-form" isLoading={updateMutation.isPending} className="w-full">
              Save Changes
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Supporting Documents</CardTitle>
              <CardDescription>Upload degree certs or MOE letters</CardDescription>
            </div>
            <div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".pdf,.docx,.png,.jpg,.jpeg"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fileInputRef.current?.click()}
                isLoading={uploadMutation.isPending}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {uploadError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md mb-4 border border-red-200">
                {uploadError}
              </div>
            )}

            {docsLoading ? (
              <div className="text-slate-500 text-sm">Loading documents...</div>
            ) : docsData?.documents?.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center border-dashed border-2 rounded-lg bg-slate-50 border-slate-200">
                <FileText className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">No documents uploaded yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 border border-slate-100 rounded-md">
                {docsData?.documents.map((doc: any) => (
                  <li key={doc.id} className="flex items-center justify-between p-3 hover:bg-slate-50">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-sm font-medium text-slate-900 truncate">{doc.originalName}</p>
                        <p className="text-xs text-slate-500">{(doc.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDownload(doc.id, doc.originalName)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
