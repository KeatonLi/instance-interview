import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resumeApi } from '@/lib/resumes';

// Mock fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe('resumeApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getResumes', () => {
    it('should call API without params', async () => {
      const mockResponse = {
        code: 0,
        data: { list: [], total: 0, page: 1, page_size: 10 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await resumeApi.getResumes();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/resumes'),
        expect.any(Object)
      );
    });

    it('should call API with search params', async () => {
      const mockResponse = {
        code: 0,
        data: { list: [], total: 0, page: 1, page_size: 10 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await resumeApi.getResumes({ search: 'test', theme_id: 1, sort: 'updated_at_desc' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=test'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('theme_id=1'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('sort=updated_at_desc'),
        expect.any(Object)
      );
    });

    it('should handle partial params', async () => {
      const mockResponse = {
        code: 0,
        data: { list: [], total: 0, page: 1, page_size: 10 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await resumeApi.getResumes({ search: 'only-search' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=only-search'),
        expect.any(Object)
      );
      expect(mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining('theme_id'),
        expect.any(Object)
      );
    });
  });

  describe('enableShare', () => {
    it('should call enable share API', async () => {
      const mockResponse = {
        code: 0,
        data: { share_token: 'abc123', share_url: '/shared/abc123' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await resumeApi.enableShare(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/resumes/1/share'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('disableShare', () => {
    it('should call disable share API', async () => {
      const mockResponse = {
        code: 0,
        message: '分享已取消',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await resumeApi.disableShare(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/resumes/1/share'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('getSharedResume', () => {
    it('should call get shared resume API', async () => {
      const mockResponse = {
        code: 0,
        data: { id: 1, title: 'Test Resume' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await resumeApi.getSharedResume('token123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/shared/token123'),
        expect.any(Object)
      );
    });
  });

  describe('optimizeContent', () => {
    it('should call optimize API with content and type', async () => {
      const mockResponse = {
        code: 0,
        data: {
          original: '原内容',
          optimized: '优化后内容',
          changes: ['措辞优化', '量化成果']
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await resumeApi.optimizeContent('测试工作经历内容', 'work_experience');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/resumes/optimize'),
        expect.objectContaining({ method: 'POST' })
      );
      expect(result.code).toBe(0);
      expect(result.data.optimized).toBe('优化后内容');
    });

    it('should handle optimize different content types', async () => {
      const mockResponse = {
        code: 0,
        data: {
          original: '项目描述',
          optimized: '优化后的项目描述',
          changes: ['关键词增强']
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await resumeApi.optimizeContent('项目描述内容', 'project');

      expect(result.code).toBe(0);
      expect(result.data.changes).toContain('关键词增强');
    });
  });

  describe('optimizeFull', () => {
    it('should call optimize-full API with resume data', async () => {
      const mockResponse = {
        code: 0,
        data: {
          optimized: {
            personalInfo: { name: '张三', title: '前端工程师' },
            workExperience: [],
            projects: [],
            education: [],
            skills: [],
            awards: [],
            languages: []
          },
          summary: ['措辞已优化', '成就已量化']
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const resumeData = {
        personalInfo: { name: '张三', title: '前端工程师', email: '', phone: '', location: '', linkedin: '', github: '', website: '', summary: '' },
        workExperience: [{ id: '1', company: 'ABC', position: '工程师', description: '负责开发', startDate: '', endDate: '', current: false, achievements: [] }],
        projects: [],
        education: [],
        skills: [],
        awards: [],
        languages: []
      };

      const result = await resumeApi.optimizeFull(resumeData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/resumes/optimize-full'),
        expect.objectContaining({ method: 'POST' })
      );
      expect(result.code).toBe(0);
      expect(result.data.summary).toContain('措辞已优化');
    });

    it('should handle empty resume data', async () => {
      const mockResponse = {
        code: 0,
        data: {
          optimized: {
            personalInfo: {},
            workExperience: [],
            projects: [],
            education: [],
            skills: [],
            awards: [],
            languages: []
          },
          summary: ['简历为空，无内容可优化']
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const emptyData = {
        personalInfo: { name: '', title: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '', summary: '' },
        workExperience: [],
        projects: [],
        education: [],
        skills: [],
        awards: [],
        languages: []
      };

      const result = await resumeApi.optimizeFull(emptyData);

      expect(result.code).toBe(0);
    });
  });
});