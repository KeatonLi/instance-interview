import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ResumeData } from '@/types/resume';

interface PDFDownloaderProps {
  resumeData: ResumeData;
  filename?: string;
}

type ExportStatus = 'idle' | 'generating' | 'success' | 'error';

const PDFDownloader: React.FC<PDFDownloaderProps> = ({ resumeData, filename = 'resume' }) => {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const downloadPDF = async () => {
    if (status === 'generating') return;

    setStatus('generating');
    setProgress(10);
    setErrorMessage('');

    try {
      // 动态导入PDF库
      setProgress(20);
      const { pdf } = await import('@react-pdf/renderer');
      const { default: ResumePDF } = await import('./ResumePDF');

      // Step 1: 准备文档
      setProgress(30);
      const doc = <ResumePDF data={resumeData} />;

      // Step 2: 生成PDF blob
      setProgress(60);
      const blob = await pdf(doc).toBlob();

      // Step 3: 创建下载链接
      setProgress(90);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // 完成
      setProgress(100);
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
            生成中 {progress}%
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
      {status === 'generating' && (
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {status === 'error' && errorMessage && (
        <p className="text-xs text-red-500 text-center break-words">{errorMessage}</p>
      )}
    </div>
  );
};

export default PDFDownloader;
