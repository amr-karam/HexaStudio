'use client';

import React from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoicePDFData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientAddress: string;
  clientEmail?: string;
  clientPhone?: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency?: string;
  paymentTerms?: string;
  bankDetails?: string;
  notes?: string;
}

interface InvoicePDFProps {
  data: InvoicePDFData;
  /** If true, renders a light-background version optimized for printing/PDF capture */
  printMode?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(amount: number, currency = '$'): string {
  return `${currency}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export function InvoicePDF({ data, printMode = false }: InvoicePDFProps) {
  const currencySymbol = data.currency ?? '$';

  const bg = printMode ? '#ffffff' : '#141414';
  const textPrimary = printMode ? '#1a1a1a' : '#ffffff';
  const textSecondary = printMode ? '#666666' : '#888888';
  const textMuted = printMode ? '#999999' : '#555555';
  const borderColor = printMode ? '#e5e5e5' : '#1F1F1F';
  const surfaceBg = printMode ? '#f9fafb' : '#0A0A0A';
  const gold = '#D4A843';
  const headerHeight = printMode ? '120px' : '140px';

  return (
    <div
      id="hexa-invoice-pdf"
      className="invoice-pdf-root"
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        backgroundColor: bg,
        color: textPrimary,
        maxWidth: '800px',
        margin: '0 auto',
        padding: '48px 56px',
        boxSizing: 'border-box',
        lineHeight: 1.6,
        fontSize: '13px',
      }}
    >
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '48px',
          borderBottom: `2px solid ${gold}`,
          paddingBottom: '28px',
        }}
      >
        {/* Company Info */}
        <div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 300,
              letterSpacing: '1px',
              fontFamily: "'Inter', serif",
              color: gold,
              marginBottom: '4px',
            }}
          >
            HEXA <span style={{ color: textPrimary }}>STUDIO</span>
          </div>
          <div style={{ fontSize: '11px', color: textMuted, marginTop: '8px', lineHeight: 1.8 }}>
            <div>123 Architecture Row, Suite 400</div>
            <div>San Francisco, CA 94105</div>
            <div>hello@hexastudio.net • +1 (415) 555-0172</div>
          </div>
        </div>

        {/* Invoice Meta */}
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '3px',
              color: gold,
              marginBottom: '12px',
            }}
          >
            Invoice
          </div>
          <div style={{ fontSize: '13px', lineHeight: 2, color: textSecondary }}>
            <div>
              <span style={{ color: textMuted }}># </span>
              <span style={{ color: textPrimary, fontWeight: 500 }}>{data.invoiceNumber}</span>
            </div>
            <div>
              <span style={{ color: textMuted }}>Date: </span>
              {formatDate(data.date)}
            </div>
            <div>
              <span style={{ color: textMuted }}>Due: </span>
              {formatDate(data.dueDate)}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bill To ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '36px' }}>
        <div
          style={{
            fontSize: '10px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: textMuted,
            marginBottom: '8px',
          }}
        >
          Bill To
        </div>
        <div style={{ color: textPrimary, fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
          {data.clientName}
        </div>
        <div style={{ color: textSecondary, fontSize: '12px', lineHeight: 1.8 }}>
          {data.clientAddress && <div>{data.clientAddress}</div>}
          {data.clientEmail && <div>{data.clientEmail}</div>}
          {data.clientPhone && <div>{data.clientPhone}</div>}
        </div>
      </div>

      {/* ─── Line Items Table ────────────────────────────────────────── */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '28px',
          fontSize: '12px',
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: `1px solid ${gold}`,
              borderTop: `1px solid ${borderColor}`,
            }}
          >
            <th
              style={{
                textAlign: 'left',
                padding: '12px 8px',
                fontSize: '9px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: textMuted,
              }}
            >
              Description
            </th>
            <th
              style={{
                textAlign: 'center',
                padding: '12px 8px',
                fontSize: '9px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: textMuted,
                width: '80px',
              }}
            >
              Qty
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '12px 8px',
                fontSize: '9px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: textMuted,
                width: '110px',
              }}
            >
              Rate
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '12px 16px',
                fontSize: '9px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: textMuted,
                width: '120px',
              }}
            >
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {data.lineItems.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                style={{
                  textAlign: 'center',
                  padding: '40px 8px',
                  color: textMuted,
                  fontSize: '12px',
                  fontStyle: 'italic',
                }}
              >
                No line items
              </td>
            </tr>
          ) : (
            data.lineItems.map((item, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: `1px solid ${borderColor}`,
                  ...(i % 2 === 1 ? { backgroundColor: surfaceBg } : {}),
                }}
              >
                <td style={{ padding: '12px 8px', color: textPrimary, fontWeight: 300 }}>
                  {item.description}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center', color: textSecondary }}>
                  {item.quantity}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right', color: textSecondary }}>
                  {formatCurrency(item.rate, currencySymbol)}
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    color: textPrimary,
                    fontWeight: 400,
                  }}
                >
                  {formatCurrency(item.amount, currencySymbol)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ─── Totals ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '36px' }}>
        <div style={{ width: '280px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: `1px solid ${borderColor}`,
              fontSize: '12px',
            }}
          >
            <span style={{ color: textMuted }}>Subtotal</span>
            <span style={{ color: textSecondary }}>
              {formatCurrency(data.subtotal, currencySymbol)}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: `1px solid ${borderColor}`,
              fontSize: '12px',
            }}
          >
            <span style={{ color: textMuted }}>Tax ({data.taxRate}%)</span>
            <span style={{ color: textSecondary }}>
              {formatCurrency(data.taxAmount, currencySymbol)}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderTop: `2px solid ${gold}`,
              marginTop: '4px',
              fontSize: '15px',
              fontWeight: 600,
            }}
          >
            <span style={{ color: textPrimary }}>Total</span>
            <span style={{ color: gold }}>
              {formatCurrency(data.total, currencySymbol)}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Gold Accent Divider ─────────────────────────────────────── */}
      <div
        style={{
          height: '1px',
          background: `linear-gradient(to right, ${gold}60, ${gold}20, transparent)`,
          marginBottom: '28px',
        }}
      />

      {/* ─── Payment & Notes ─────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: '48px',
          fontSize: '11px',
          lineHeight: 1.8,
          color: textSecondary,
        }}
      >
        {data.paymentTerms && (
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: textMuted,
                marginBottom: '6px',
              }}
            >
              Payment Terms
            </div>
            <div style={{ whiteSpace: 'pre-wrap', color: textSecondary }}>
              {data.paymentTerms}
            </div>
          </div>
        )}

        {data.bankDetails && (
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: textMuted,
                marginBottom: '6px',
              }}
            >
              Bank Details
            </div>
            <div style={{ whiteSpace: 'pre-wrap', color: textSecondary }}>
              {data.bankDetails}
            </div>
          </div>
        )}
      </div>

      {data.notes && (
        <div style={{ marginTop: '24px', fontSize: '11px', color: textMuted, fontStyle: 'italic' }}>
          {data.notes}
        </div>
      )}

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <div
        style={{
          marginTop: '48px',
          paddingTop: '16px',
          borderTop: `1px solid ${borderColor}`,
          fontSize: '10px',
          color: textMuted,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>HEXA Studio — Architecture &amp; 3D Visualization</span>
        <span>Tax ID: US-12-3456789</span>
      </div>
    </div>
  );
}

export default InvoicePDF;
