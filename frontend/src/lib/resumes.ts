import type { ResumeData } from '@/types/resume';
import { API_BASE_URL } from '@/config';

export interface Resume {
  id: number;
  user_id: number;
  title: string;
  theme_id: number;
  resume_type: string;
  status: string;
  personal_info: string;
  education: string;
  work_experience: string;
  projects: string;
  skills: string;
  awards: string;
  languages: string;
  created_at: string;
  updated_at: string;
}

export interface ResumeListResponse {
  code: number;
  data: {
    list: Resume[];
    total: number;
    page: number;
    page_size: number;
  };
}

export interface ResumeDetail extends Resume {
  personal_info: string;
  education: string;
  work_experience: string;
  projects: string;
  skills: string;
  awards: string;
  languages: string;
}

export interface ResumeResponse {
  code: number;
  data: ResumeDetail;
}

export interface ResumeCreateRequest {
  title: string;
  user_id: number;
  resume_data?: ResumeData;
}

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(API_BASE_URL + endpoint, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};

export const resumeApi = {
  getResumes: () =>
    api.get<ResumeListResponse>('/resumes'),

  getResume: (id: number) =>
    api.get<ResumeResponse>(`/resumes/${id}`),

  createResume: (data: ResumeCreateRequest) => {
    const body: Record<string, unknown> = {
      title: data.title,
      user_id: data.user_id,
    };
    // 将 resume_data 转换为后端需要的 JSON 字符串字段
    if (data.resume_data) {
      body.personal_info = JSON.stringify(data.resume_data.personalInfo);
      body.education = JSON.stringify(data.resume_data.education);
      body.work_experience = JSON.stringify(data.resume_data.workExperience);
      body.projects = JSON.stringify(data.resume_data.projects);
      body.skills = JSON.stringify(data.resume_data.skills);
      body.awards = JSON.stringify(data.resume_data.awards);
      body.languages = JSON.stringify(data.resume_data.languages);
    }
    return api.post<ResumeResponse>('/resumes', body);
  },

  updateResume: (id: number, data: { title?: string; theme_id?: number; resume_data?: ResumeData }) => {
    const body: Record<string, unknown> = {};
    if (data.title) body.title = data.title;
    if (data.theme_id !== undefined) body.theme_id = data.theme_id;
    // 将 resume_data 转换为后端需要的 JSON 字符串字段
    if (data.resume_data) {
      body.personal_info = JSON.stringify(data.resume_data.personalInfo);
      body.education = JSON.stringify(data.resume_data.education);
      body.work_experience = JSON.stringify(data.resume_data.workExperience);
      body.projects = JSON.stringify(data.resume_data.projects);
      body.skills = JSON.stringify(data.resume_data.skills);
      body.awards = JSON.stringify(data.resume_data.awards);
      body.languages = JSON.stringify(data.resume_data.languages);
    }
    return api.put<ResumeResponse>(`/resumes/${id}`, body);
  },

  deleteResume: (id: number) =>
    api.delete<{ code: number; message: string }>(`/resumes/${id}`),
};
