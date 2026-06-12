import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { PlusCircle, FileText } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuthStore();
  const isParent = user?.role === 'PARENT';

  const { data, isLoading, error } = useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      const res = await api.get('/cases');
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isParent ? 'My Cases' : 'Invited Cases'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isParent 
              ? 'Manage your tuition requests and view invited tutors.' 
              : 'View and respond to tuition cases you have been invited to.'}
          </p>
        </div>
        {isParent && (
          <Link to="/cases/new">
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Post a Case
            </Button>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse flex space-x-2">
            <div className="h-3 w-3 bg-primary-DEFAULT rounded-full"></div>
            <div className="h-3 w-3 bg-primary-DEFAULT rounded-full animation-delay-200"></div>
            <div className="h-3 w-3 bg-primary-DEFAULT rounded-full animation-delay-400"></div>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          Failed to load cases. Please try again later.
        </div>
      ) : data?.cases?.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 bg-slate-50">
          <FileText className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No cases found</h3>
          <p className="text-slate-500 max-w-sm">
            {isParent 
              ? "You haven't posted any tuition cases yet. Create one to start finding tutors."
              : "You haven't been invited to any cases yet. Make sure your profile is up to date so parents can find you."}
          </p>
          {isParent && (
            <Link to="/cases/new" className="mt-6">
              <Button variant="outline">Create your first case</Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.cases.map((tuitionCase: any) => (
            <Card key={tuitionCase.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader className="pb-4 border-b border-slate-100">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div className="inline-flex px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md">
                    {tuitionCase.subject}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-md font-medium ${
                    tuitionCase.status === 'OPEN' ? 'bg-green-50 text-green-700' :
                    tuitionCase.status === 'MATCHED' ? 'bg-blue-50 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {tuitionCase.status}
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2">{tuitionCase.title}</CardTitle>
                <CardDescription>
                  Level: {tuitionCase.level}
                </CardDescription>
              </CardHeader>
              <CardContent className="py-4 flex-1">
                <div className="space-y-2 text-sm text-slate-600">
                  {tuitionCase.location && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">Location:</span> {tuitionCase.location}
                    </div>
                  )}
                  {tuitionCase.budgetPerHour && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">Budget:</span> ${tuitionCase.budgetPerHour}/hr
                    </div>
                  )}
                </div>
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                <Link to={`/cases/${tuitionCase.id}`} className="block w-full">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
