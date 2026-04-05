import type { ResumeData } from '@/types/resume';
import { defaultResumeData } from '@/types/resume';

type SerializedResumeLike = {
  personal_info?: string | Record<string, unknown>;
  education?: string | unknown[];
  work_experience?: string | unknown[];
  projects?: string | unknown[];
  skills?: string | unknown[];
  awards?: string | unknown[];
  languages?: string | unknown[];
};

const parseJsonField = <T,>(value: string | unknown | undefined, fallback: T): T => {
  if (!value) return fallback;

  // 如果已经是对象（不是字符串），直接返回
  if (typeof value === 'object') {
    if (Array.isArray(value)) return value as unknown as T;
    if (value !== null) return value as T;
    return fallback;
  }

  // 如果是字符串，尝试解析
  if (typeof value === 'string') {
    if (value.trim() === '') return fallback;
    try {
      const parsed = JSON.parse(value);
      if (parsed === null) return fallback;
      return parsed as T;
    } catch {
      return fallback;
    }
  }

  return fallback;
};

export const parseResumeData = (resume: SerializedResumeLike | null | undefined): ResumeData => {
  // 处理null或undefined
  if (!resume) {
    return defaultResumeData;
  }

  // 防御性处理：如果resume是数组或函数等无效类型，返回默认数据
  if (typeof resume !== 'object') {
    console.warn('parseResumeData: resume is not an object, returning default');
    return defaultResumeData;
  }

  const data = {
    personalInfo: parseJsonField(resume.personal_info, defaultResumeData.personalInfo),
    education: parseJsonField(resume.education, defaultResumeData.education),
    workExperience: parseJsonField(resume.work_experience, defaultResumeData.workExperience),
    projects: parseJsonField(resume.projects, defaultResumeData.projects),
    skills: parseJsonField(resume.skills, defaultResumeData.skills),
    awards: parseJsonField(resume.awards, defaultResumeData.awards),
    languages: parseJsonField(resume.languages, defaultResumeData.languages),
  };

  // 确保所有数组字段都是数组，不是null
  if (!Array.isArray(data.education)) data.education = [];
  if (!Array.isArray(data.workExperience)) data.workExperience = [];
  if (!Array.isArray(data.projects)) data.projects = [];
  if (!Array.isArray(data.skills)) data.skills = [];
  if (!Array.isArray(data.awards)) data.awards = [];
  if (!Array.isArray(data.languages)) data.languages = [];

  // 确保personalInfo是对象
  if (!data.personalInfo || typeof data.personalInfo !== 'object') {
    data.personalInfo = defaultResumeData.personalInfo;
  }

  return data as ResumeData;
};

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
