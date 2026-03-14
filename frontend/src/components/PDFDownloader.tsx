import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ResumeData } from '@/types/resume';
import { generateResumePDF } from './ResumePDF';

interface PDFDownloaderProps {
  resumeData: ResumeData;
  filename?: string;
}

type ExportStatus = 'idle' | 'generating' | 'success' | 'error';

const PDFDownloader: React.FC<PDFDownloaderProps> = ({ resumeData, filename = 'resume' }) => {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const downloadPDF = async () => {
    if (status === 'generating') return;

    setStatus('generating');
    setErrorMessage('');

    try {
      await generateResumePDF({
        data: resumeData,
        filename: filename || 'resume'
      });

      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      setErrorMessage(`PDF生成失败: ${errorMsg}`);
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

  return (
    <div className="space-y-2">
      <Button
        onClick={downloadPDF}
        disabled={status === 'generating'}
        variant={getButtonVariant()}
        className="w-full shadow-md hover:shadow-lg transition-all duration-200"
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
