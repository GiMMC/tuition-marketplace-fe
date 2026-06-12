import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { UserCheck, FileText, ArrowLeft, Send } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';

export function TutorProfileDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedCase, setSelectedCase] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');

  const { data: tutorData, isLoading: tutorLoading } = useQuery({
    queryKey: ['tutor', id],
    queryFn: async () => {
      const res = await api.get(`/tutors/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const { data: casesData } = useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      const res = await api.get('/cases');
      return res.data;
    },
    enabled: user?.role === 'PARENT',
  });

  const inviteMutation = useMutation({
    mutationFn: async (caseId: string) => {
      const res = await api.post(`/cases/${caseId}/invite`, { tutorProfileId: id });
      return res.data;
    },
    onSuccess: () => {
      setInviteMessage('Tutor invited successfully!');
      setTimeout(() => setInviteMessage(''), 3000);
    },
    onError: (error: any) => {
      setInviteMessage(error.response?.data?.error || 'Failed to invite tutor.');
    }
  });

  const handleInvite = () => {
    if (!selectedCase) {
      setInviteMessage('Please select a case first.');
      return;
    }
    inviteMutation.mutate(selectedCase);
  };

  if (tutorLoading) {
    return <div className="flex justify-center py-12">Loading tutor profile...</div>;
  }

  if (!tutorData?.tutor) {
    return <div className="p-8 text-center">Tutor not found.</div>;
  }

  const tutor = tutorData.tutor;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 pl-0 hover:bg-transparent text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Directory
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-6">
              <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-4xl shadow-inner">
                {tutor.displayName?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <CardTitle className="text-3xl">{tutor.displayName}</CardTitle>
                <CardDescription className="text-base mt-2">
                  Joined {new Date(tutor.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-indigo-600" />
                  Qualifications
                </h3>
                <div className="p-4 bg-slate-50 rounded-lg text-slate-700 whitespace-pre-wrap">
                  {tutor.qualifications || 'No qualifications provided.'}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  Experience
                </h3>
                <div className="p-4 bg-slate-50 rounded-lg text-slate-700 whitespace-pre-wrap">
                  {tutor.experiences || 'No experience details provided.'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          {user?.role === 'PARENT' && (
            <Card className="sticky top-24 border-indigo-100 shadow-md">
              <CardHeader className="bg-indigo-50/50 rounded-t-xl border-b border-indigo-100">
                <CardTitle className="text-xl text-indigo-900">Invite Tutor</CardTitle>
                <CardDescription>
                  Invite this tutor to one of your cases
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {casesData?.cases?.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Select a case:</label>
                      <select 
                        className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT"
                        value={selectedCase}
                        onChange={(e) => setSelectedCase(e.target.value)}
                      >
                        <option value="">-- Choose a case --</option>
                        {casesData.cases.map((c: any) => (
                          <option key={c.id} value={c.id}>
                            {c.title} ({c.status})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {inviteMessage && (
                      <div className={`text-sm p-2 rounded ${inviteMessage.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {inviteMessage}
                      </div>
                    )}

                    <Button 
                      className="w-full" 
                      onClick={handleInvite}
                      disabled={!selectedCase || inviteMutation.isPending}
                      isLoading={inviteMutation.isPending}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Invitation
                    </Button>
                  </>
                ) : (
                  <div className="text-sm text-slate-600 text-center py-4">
                    You don't have any open cases.
                    <Link to="/cases/new" className="block mt-2 text-indigo-600 font-medium hover:underline">
                      Create a case first
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
