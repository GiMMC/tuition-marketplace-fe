import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Link } from 'react-router-dom';
import { Search, UserCheck } from 'lucide-react';
import { useState } from 'react';

// Reusable hook for debounce
// We will create this below or assume it exists. Let's just use local state for simplicity in this file

export function TutorDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['tutors', searchTerm],
    queryFn: async () => {
      const res = await api.get('/tutors', { params: { search: searchTerm } });
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Find a Tutor</h1>
          <p className="text-slate-500 mt-1">Browse our directory of qualified tutors</p>
        </div>
        <div className="w-full md:w-72 relative">
          <Input 
            placeholder="Search tutors by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        </div>
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
          Failed to load tutors. Please try again later.
        </div>
      ) : data?.tutors?.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 bg-slate-50">
          <UserCheck className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No tutors found</h3>
          <p className="text-slate-500">
            {searchTerm ? "No tutors match your search criteria." : "There are currently no tutors registered."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.tutors.map((tutor: any) => (
            <Card key={tutor.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl">
                    {tutor.displayName?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tutor.displayName}</CardTitle>
                    <CardDescription className="line-clamp-1 mt-1">
                      {tutor.qualifications || 'No qualifications listed'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-4 flex-1 border-t border-slate-100">
                <div className="text-sm text-slate-600 line-clamp-3">
                  {tutor.experiences || 'No experience details provided.'}
                </div>
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                <Link to={`/tutors/${tutor.id}`} className="block w-full">
                  <Button variant="outline" className="w-full">
                    View Profile
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
