import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { ArrowLeft, Paperclip, Upload, Download, FileText, CheckCircle } from 'lucide-react';
import { useState, useRef } from 'react';

export function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState('');

  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ['case', id],
    queryFn: async () => {
      const res = await api.get(`/cases/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const { data: docsData, isLoading: docsLoading } = useQuery({
    queryKey: ['case-documents', id],
    queryFn: async () => {
      const res = await api.get(`/cases/${id}/documents`);
      return res.data;
    },
    enabled: !!id,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post(`/cases/${id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-documents', id] });
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
      const res = await api.get(`/cases/${id}/documents/${docId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
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

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await api.patch(`/cases/${id}`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case', id] });
    }
  });

  if (caseLoading) {
    return <div className="flex justify-center py-12">Loading case details...</div>;
  }

  if (!caseData?.case) {
    return <div className="p-8 text-center text-slate-500">Case not found or you don't have permission to view it.</div>;
  }

  const tuitionCase = caseData.case;
  const isOwner = user?.role === 'PARENT' && tuitionCase.parentId === user?.id;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4 pl-0 text-slate-500 hover:bg-transparent hover:text-slate-900">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md">
              {tuitionCase.subject}
            </span>
            <span className={`text-xs px-2 py-1 rounded-md font-medium ${
              tuitionCase.status === 'OPEN' ? 'bg-green-50 text-green-700' :
              tuitionCase.status === 'MATCHED' ? 'bg-blue-50 text-blue-700' :
              'bg-slate-100 text-slate-700'
            }`}>
              {tuitionCase.status}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{tuitionCase.title}</h1>
        </div>
        
        {isOwner && tuitionCase.status === 'OPEN' && (
          <Button 
            onClick={() => updateStatusMutation.mutate('MATCHED')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
            Mark as Matched
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Case Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 text-sm">
                <div>
                  <dt className="text-slate-500 font-medium">Level</dt>
                  <dd className="mt-1 text-slate-900">{tuitionCase.level}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">Subject</dt>
                  <dd className="mt-1 text-slate-900">{tuitionCase.subject}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">Location</dt>
                  <dd className="mt-1 text-slate-900">{tuitionCase.location || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">Budget</dt>
                  <dd className="mt-1 text-slate-900">{tuitionCase.budgetPerHour ? `$${tuitionCase.budgetPerHour}/hr` : 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">Posted</dt>
                  <dd className="mt-1 text-slate-900">{new Date(tuitionCase.createdAt).toLocaleDateString()}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Upload past papers, worksheets or briefs</CardDescription>
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
                  <Paperclip className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">No documents attached yet.</p>
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

        {isOwner && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Invited Tutors</CardTitle>
              </CardHeader>
              <CardContent>
                {tuitionCase.caseInvitations?.length === 0 ? (
                  <div className="text-sm text-slate-500 text-center py-4">
                    No tutors invited yet.
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {tuitionCase.caseInvitations?.map((inv: any) => (
                      <li key={inv.id} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                          {inv.tutorProfile.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm font-medium text-slate-900">
                          {inv.tutorProfile.displayName}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Button variant="outline" className="w-full" onClick={() => navigate('/tutors')}>
                    Browse Tutors
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
