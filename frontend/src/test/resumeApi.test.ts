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
});