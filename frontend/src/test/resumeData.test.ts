import { describe, it, expect } from 'vitest';
import { sanitizeResumeFilename } from '@/lib/resumeData';

describe('resumeData', () => {
  describe('sanitizeResumeFilename', () => {
    it('should preserve special characters except invalid ones', () => {
      // 函数只替换 Windows 不允许的字符
      expect(sanitizeResumeFilename('我的 简历 (1).pdf')).toBe('我的 简历 (1)');
    });

    it('should return resume for empty string', () => {
      expect(sanitizeResumeFilename('')).toBe('resume');
    });

    it('should preserve underscores and normal chars', () => {
      expect(sanitizeResumeFilename('John_Doe_Resume.pdf')).toBe('John_Doe_Resume');
    });

    it('should handle Chinese characters', () => {
      expect(sanitizeResumeFilename('张伟的简历.pdf')).toBe('张伟的简历');
    });

    it('should remove .pdf extension case insensitive', () => {
      expect(sanitizeResumeFilename('test.PDF')).toBe('test');
      expect(sanitizeResumeFilename('test.Pdf')).toBe('test');
    });

    it('should replace invalid Windows chars with dash', () => {
      expect(sanitizeResumeFilename('test:file*name?.pdf')).toBe('test-file-name-');
    });
  });
});