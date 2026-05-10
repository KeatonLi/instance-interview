import type { ResumeData } from '@/types/resume';
import { API_BASE_URL } from '@/config';
import { buildResumePayload } from '@/lib/resumeData';

export interface Resume {
  id: number;
  user_id: number;
  title: string;
  theme_id: number;
  resume_type: string;
  status: string;
  share_token?: string;
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
  theme_id?: number;
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

// PDF 导入简历响应
export interface ImportResumeResponse {
  code: number;
  message: string;
  data: {
    resume: Resume;
    raw_text: string;
    parsed: {
      personal_info: Record<string, unknown>;
      education: unknown[];
      work_experience: unknown[];
      projects: unknown[];
      skills: unknown[];
    };
  };
}

// 上传文件的辅助函数
async function uploadFile<T>(endpoint: string, file: File): Promise<T> {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(API_BASE_URL + endpoint, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Upload failed');
  }

  return data;
}

export interface ResumeListParams {
  search?: string;
  theme_id?: number;
  sort?: 'updated_at_desc' | 'updated_at_asc' | 'created_at_desc' | 'created_at_asc';
}

export const resumeApi = {
  getResumes: (params?: ResumeListParams) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.set('search', params.search);
    if (params?.theme_id !== undefined) queryParams.set('theme_id', String(params.theme_id));
    if (params?.sort) queryParams.set('sort', params.sort);
    const query = queryParams.toString();
    return api.get<ResumeListResponse>(`/resumes${query ? '?' + query : ''}`);
  },

  getResume: (id: number) =>
    api.get<ResumeResponse>(`/resumes/${id}`),

  createResume: (data: ResumeCreateRequest) => {
    const body: Record<string, unknown> = {
      title: data.title,
      user_id: data.user_id,
    };
    if (data.theme_id !== undefined) body.theme_id = data.theme_id;
    if (data.resume_data) {
      Object.assign(body, buildResumePayload(data.resume_data));
    }
    return api.post<ResumeResponse>('/resumes', body);
  },

  updateResume: (id: number, data: { title?: string; theme_id?: number; resume_data?: ResumeData }) => {
    const body: Record<string, unknown> = {};
    if (data.title) body.title = data.title;
    if (data.theme_id !== undefined) body.theme_id = data.theme_id;
    if (data.resume_data) {
      Object.assign(body, buildResumePayload(data.resume_data));
    }
    return api.put<ResumeResponse>(`/resumes/${id}`, body);
  },

  deleteResume: (id: number) =>
    api.delete<{ code: number; message: string }>(`/resumes/${id}`),

  // PDF 导入简历
  importResume: (file: File) =>
    uploadFile<ImportResumeResponse>('/resumes/import', file),

  // 启用分享
  enableShare: (id: number) =>
    api.post<{ code: number; data: { share_token: string; share_url: string } }>(`/resumes/${id}/share`),

  // 禁用分享
  disableShare: (id: number) =>
    api.delete<{ code: number; message: string }>(`/resumes/${id}/share`),

  // 获取分享的简历（公开）
  getSharedResume: (token: string) =>
    api.get<ResumeResponse>(`/shared/${token}`),

  // 优化单条内容
  optimizeContent: (content: string, type: string) =>
    api.post<{
      code: number;
      data: {
        original: string;
        optimized: string;
        changes: string[];
      };
    }>('/resumes/optimize', { content, type }),

  // 一键优化整份简历
  optimizeFull: (data: ResumeData) =>
    api.post<{
      code: number;
      data: {
        optimized: ResumeData;
        summary: string[];
      };
    }>('/resumes/optimize-full', { resume_data: data }),
};

// 模拟面试 API
export interface InterviewQuestion {
  id: number;
  question: string;
  focus: string;
  standard_answer?: string;
}

export interface InterviewStartResponse {
  code: number;
  message: string;
  data: {
    session_id: string;
    resume_title: string;
    question_count: number;
    current_question: InterviewQuestion;
    job_position?: string;
  } | null;
}

export interface InterviewAnswerResponse {
  code: number;
  message: string;
  data: {
    question: string;
    focus: string;
    your_answer: string;
    evaluation: string;
    score: number;
    standard_answer: string;
    has_next: boolean;
    next_index: number | null;
  } | null;
}

export const interviewApi = {
  // 开始面试
  start: (resumeId: number, jobPosition?: string, questionCount?: number) =>
    api.post<InterviewStartResponse>('/interview/start', {
      resume_id: resumeId,
      job_position: jobPosition,
      question_count: questionCount || 5,
    }),

  // 提交回答
  answer: (sessionId: string, questionIndex: number, answer: string) =>
    api.post<InterviewAnswerResponse>('/interview/answer', {
      session_id: sessionId,
      question_index: questionIndex,
      answer,
    }),

  // 获取下一个问题
  next: (sessionId: string, currentIndex: number) =>
    api.post<{
      code: number;
      data: {
        current_index: number;
        total: number;
        question: InterviewQuestion;
        completed: boolean;
        overall_score?: number;
        summary?: any;
      } | null;
    }>('/interview/next', {
      session_id: sessionId,
      current_index: currentIndex,
    }),

  // 获取面试记录列表
  getRecords: () =>
    api.get<{
      code: number;
      data: Array<{
        id: number;
        resume_title: string;
        job_position: string | null;
        total_questions: number;
        overall_score: number;
        status: string;
        created_at: string;
      }>;
    }>('/interview/records'),

  // 获取面试记录详情
  getRecordDetail: (recordId: number) =>
    api.get<{
      code: number;
      data: {
        id: number;
        session_id: string;
        resume_title: string;
        job_position: string | null;
        total_questions: number;
        overall_score: number;
        answers: Array<{
          question: string;
          focus: string;
          answer: string;
          score: number;
          evaluation: string;
          standard_answer: string;
        }>;
        summary: string;
        status: string;
        created_at: string;
      } | null;
    }>(`/interview/records/${recordId}`),
};
