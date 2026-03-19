import type { ResumeData } from '@/types/resume';
import { defaultResumeData } from '@/types/resume';

type SerializedResumeLike = {
  personal_info?: string;
  education?: string;
  work_experience?: string;
  projects?: string;
  skills?: string;
  awards?: string;
  languages?: string;
};

const parseJsonField = <T,>(value: string | undefined, fallback: T): T => {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const parseResumeData = (resume: SerializedResumeLike): ResumeData => ({
  personalInfo: parseJsonField(resume.personal_info, defaultResumeData.personalInfo),
  education: parseJsonField(resume.education, defaultResumeData.education),
  workExperience: parseJsonField(resume.work_experience, defaultResumeData.workExperience),
  projects: parseJsonField(resume.projects, defaultResumeData.projects),
  skills: parseJsonField(resume.skills, defaultResumeData.skills),
  awards: parseJsonField(resume.awards, defaultResumeData.awards),
  languages: parseJsonField(resume.languages, defaultResumeData.languages),
});

export const buildResumePayload = (resumeData: ResumeData) => ({
  personal_info: JSON.stringify(resumeData.personalInfo),
  education: JSON.stringify(resumeData.education),
  work_experience: JSON.stringify(resumeData.workExperience),
  projects: JSON.stringify(resumeData.projects),
  skills: JSON.stringify(resumeData.skills),
  awards: JSON.stringify(resumeData.awards),
  languages: JSON.stringify(resumeData.languages),
});

export const sanitizeResumeFilename = (filename: string) => {
  const normalized = filename.trim().replace(/\.pdf$/i, '') || 'resume';
  return normalized.replace(/[\\/:*?"<>|]/g, '-');
};
