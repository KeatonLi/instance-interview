import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { resumeApi } from '@/lib/resumes';
import { parseResumeData } from '@/lib/resumeData';
import type { ResumeData } from '@/types/resume';
import ResumePreview from '@/components/ResumePreview';
import { Loader2, FileText } from 'lucide-react';

export default function SharedResumePage() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [title, setTitle] = useState('');
  const [themeId, setThemeId] = useState(0);

  useEffect(() => {
    const loadSharedResume = async () => {
      if (!token) {
        setError('Invalid link');
        setLoading(false);
        return;
      }

      try {
        const res = await resumeApi.getSharedResume(token);
        const data = parseResumeData(res.data);
        setResumeData(data);
        setTitle(res.data.title);
        setThemeId(res.data.theme_id);
      } catch {
        setError('Resume not found or sharing has been disabled');
      } finally {
        setLoading(false);
      }
    };

    loadSharedResume();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (error || !resumeData) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">{error || 'Resume not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">分享的简历</p>
        </div>
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
          <ResumePreview data={resumeData} themeId={themeId} />
        </div>
      </div>
    </div>
  );
}