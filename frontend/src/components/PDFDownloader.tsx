import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import type { ResumeData } from '@/types/resume';
import { sanitizeResumeFilename } from '@/lib/resumeData';

interface PDFDownloaderProps {
  resumeId?: number;
  resumeData?: ResumeData;
  filename?: string;
  className?: string;
}

type ExportStatus = 'idle' | 'generating' | 'success' | 'error';

const PDFDownloader: React.FC<PDFDownloaderProps> = ({
  resumeId,
  resumeData,
  filename = 'resume',
  className = '',
}) => {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const downloadPDF = async () => {
    if (status === 'generating') return;

    setStatus('generating');
    setErrorMessage('');

    try {
      // 如果有 resumeId，优先使用后端 API
      if (resumeId) {
        await api.downloadPdf(resumeId, filename);
      } else if (resumeData) {
        // 否则使用前端 PDF 生成
        const { generateResumePDF } = await import('./ResumePDF');
        await generateResumePDF({
          data: resumeData,
          filename: sanitizeResumeFilename(filename),
        });
      } else {
        throw new Error('无可用简历数据');
      }

      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      setErrorMessage(`PDF导出失败: ${errorMsg}`);
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 5000);
    }
  };

  const getButtonContent = () => {
    switch (status) {
      case 'generating':
        return (
          <>
            <Loader2 size={18} className="mr-2 animate-spin" />
            生成中...
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle2 size={18} className="mr-2 text-green-500" />
            下载成功
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle size={18} className="mr-2 text-red-500" />
            生成失败
          </>
        );
      default:
        return (
          <>
            <Download size={18} className="mr-2" />
            导出 PDF
          </>
        );
    }
  };

  const getButtonVariant = () => {
    if (status === 'error') return 'destructive';
    return status === 'success' ? 'default' : 'outline';
  };

  const isDisabled = status === 'generating' || (!resumeId && !resumeData);

  return (
    <div className="space-y-2">
      <Button
        onClick={downloadPDF}
        disabled={isDisabled}
        variant={getButtonVariant()}
        className={`w-full shadow-md hover:shadow-lg transition-all duration-200 ${className}`}
      >
        {getButtonContent()}
      </Button>
      {status === 'success' && (
        <p className="text-xs text-green-600 text-center">
          PDF 已开始下载
        </p>
      )}
      {status === 'error' && errorMessage && (
        <p className="text-xs text-red-500 text-center break-words">{errorMessage}</p>
      )}
    </div>
  );
};

export default PDFDownloader;
