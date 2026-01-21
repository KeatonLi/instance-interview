import { useState } from 'react';
import type { RefObject } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface PDFDownloaderProps {
  resumeRef: RefObject<HTMLDivElement | null>;
  filename?: string;
}

type ExportStatus = 'idle' | 'generating' | 'success' | 'error';

const PDFDownloader: React.FC<PDFDownloaderProps> = ({ resumeRef, filename = 'resume' }) => {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [progress, setProgress] = useState(0);

  const downloadPDF = async () => {
    if (!resumeRef.current || status === 'generating') return;

    setStatus('generating');
    setProgress(10);

    try {
      // Step 1: 准备渲染
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Step 2: 生成Canvas
      setProgress(40);
      const canvas = await html2canvas(resumeRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
        windowWidth: resumeRef.current.scrollWidth,
        windowHeight: resumeRef.current.scrollHeight,
        backgroundColor: '#ffffff',
      });

      // Step 3: 转换图片
      setProgress(60);
      const imgData = canvas.toDataURL('image/png', 1.0);

      // Step 4: 创建PDF
      setProgress(80);
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(
        imgData,
        'PNG',
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );

      // Step 5: 保存文件
      setProgress(100);
      pdf.save(`${filename}.pdf`);

      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
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
    if (status === 'success') return 'success';
    if (status === 'error') return 'destructive';
    return 'default';
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
      {status === 'error' && (
        <p className="text-xs text-red-500 text-center">生成PDF时出错，请检查内容后重试</p>
      )}
    </div>
  );
};

export default PDFDownloader;
