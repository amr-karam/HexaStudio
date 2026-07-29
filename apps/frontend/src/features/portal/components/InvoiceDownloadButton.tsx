'use client';

import React, { useState } from 'react';

export function InvoiceDownloadButton({ invoiceId }: { invoiceId: string }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Simulate PDF generation / download from presigned S3/MinIO vault
      await new Promise((resolve) => setTimeout(resolve, 1200));
      alert(`Statement of Account / Invoice #${invoiceId} downloaded successfully.`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-accent text-xs font-mono uppercase tracking-wider text-neutral-300 hover:text-accent rounded-xl transition-all disabled:opacity-50"
    >
      {downloading ? 'Preparing PDF...' : 'Download Official PDF'}
    </button>
  );
}
