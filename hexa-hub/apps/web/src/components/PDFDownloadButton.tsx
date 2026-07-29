'use client';

import React, { useCallback, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/components/ui/cn';
import type { InvoicePDFData } from './InvoicePDF';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PDFDownloadButtonProps {
  /** Invoice data to render in the PDF */
  invoiceData: InvoicePDFData;
  /** Custom button label */
  label?: string;
  /** Button size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Additional CSS classes */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Filename override — defaults to 'HEXA-Invoice-{invoiceNumber}.pdf' */
  filename?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function PDFDownloadButton({
  invoiceData,
  label = 'Download PDF',
  size = 'sm',
  variant = 'secondary',
  className,
  disabled = false,
  filename,
}: PDFDownloadButtonProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resolvedFilename =
    filename ?? `HEXA-Invoice-${invoiceData.invoiceNumber}.pdf`;

  const handleDownload = useCallback(async () => {
    if (disabled || state === 'loading') return;

    setState('loading');

    try {
      // Dynamically import libraries to avoid SSR issues
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const html2canvas = html2canvasModule.default;
      const { jsPDF } = jsPDFModule;

      // Dynamically import and render the InvoicePDF component
      const { InvoicePDF } = await import('./InvoicePDF');
      const { createRoot } = await import('react-dom/client');

      // Create a temporary container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '800px';
      document.body.appendChild(container);

      // Render the invoice in print mode
      const root = createRoot(container);
      await new Promise<void>((resolve) => {
        root.render(
          React.createElement(InvoicePDF, {
            data: invoiceData,
            printMode: true,
          }),
        );
        // Give React time to render
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });

      // Capture with html2canvas
      const canvas = await html2canvas(container.firstChild as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Clean up
      root.unmount();
      document.body.removeChild(container);

      // Generate PDF
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF('p', 'mm', 'a4');
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add pages if content exceeds one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(resolvedFilename);

      setState('success');
      timeoutRef.current = setTimeout(() => setState('idle'), 2000);
    } catch (err) {
      console.error('PDF generation failed:', err);
      setState('error');
      timeoutRef.current = setTimeout(() => setState('idle'), 3000);
    }
  }, [invoiceData, resolvedFilename, disabled, state]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const sizeClasses: Record<NonNullable<PDFDownloadButtonProps['size']>, string> = {
    sm: 'px-3 py-2 text-[11px] gap-1.5 rounded-lg',
    md: 'px-4 py-2.5 text-sm gap-2 rounded-lg',
    lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
  };

  const variantClasses: Record<NonNullable<PDFDownloadButtonProps['variant']>, string> = {
    primary:
      'bg-[#D4A843] text-[#0A0A0A] hover:bg-[#D4A843]/90 hover:shadow-[0_0_20px_rgba(212,168,67,0.15)]',
    secondary:
      'bg-transparent text-[#D4A843] border border-[#D4A843]/30 hover:bg-[#D4A843]/10 hover:border-[#D4A843]/50',
    ghost:
      'bg-transparent text-[#888] hover:text-[#D4A843] hover:bg-[#D4A843]/5',
  };

  const isDisabled = disabled || state === 'loading';

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.03 } : undefined}
      whileTap={!isDisabled ? { scale: 0.97 } : undefined}
      onClick={handleDownload}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center font-light tracking-wide transition-all duration-300',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        state === 'success' && '!bg-emerald-500/10 !text-emerald-400 !border-emerald-500/20',
        state === 'error' && '!bg-red-500/10 !text-red-400 !border-red-500/20',
        className,
      )}
      title={`Download invoice ${invoiceData.invoiceNumber} as PDF`}
    >
      {state === 'loading' ? (
        <Loader2 size={size === 'sm' ? 13 : 15} className="animate-spin" />
      ) : state === 'success' ? (
        <Download size={size === 'sm' ? 13 : 15} className="text-emerald-400" />
      ) : state === 'error' ? (
        <FileText size={size === 'sm' ? 13 : 15} className="text-red-400" />
      ) : (
        <Download size={size === 'sm' ? 13 : 15} />
      )}
      <span>
        {state === 'loading'
          ? 'Generating...'
          : state === 'success'
          ? 'Downloaded!'
          : state === 'error'
          ? 'Failed'
          : label}
      </span>
    </motion.button>
  );
}

export default PDFDownloadButton;
