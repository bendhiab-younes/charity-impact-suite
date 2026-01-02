/**
 * Export utilities for CSV and data download
 */

type ExportData = Record<string, any>[];

interface ExportOptions {
  filename: string;
  headers?: Record<string, string>; // { fieldName: 'Display Name' }
}

/**
 * Convert data array to CSV string
 */
function toCSV(data: ExportData, headers?: Record<string, string>): string {
  if (data.length === 0) return '';

  // Get all unique keys from data
  const allKeys = [...new Set(data.flatMap(item => Object.keys(item)))];
  
  // Use custom headers or field names
  const headerRow = allKeys.map(key => headers?.[key] || key).join(',');
  
  // Convert each row
  const rows = data.map(item => {
    return allKeys.map(key => {
      const value = item[key];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value).replace(/,/g, ';');
      // Escape quotes and wrap in quotes if contains comma
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });

  return [headerRow, ...rows].join('\n');
}

/**
 * Trigger file download in browser
 */
function downloadFile(content: string, filename: string, mimeType: string = 'text/csv') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data as CSV file
 */
export function exportToCSV(data: ExportData, options: ExportOptions): void {
  const csv = toCSV(data, options.headers);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${options.filename}_${timestamp}.csv`;
  downloadFile(csv, filename);
}

/**
 * Export donations to CSV
 */
export function exportDonations(donations: any[]): void {
  const formattedData = donations.map(d => ({
    id: d.id,
    amount: d.amount,
    currency: d.currency || 'TND',
    type: d.type,
    method: d.method,
    status: d.status,
    beneficiary: d.beneficiary ? `${d.beneficiary.firstName} ${d.beneficiary.lastName}` : 'N/A',
    notes: d.notes || '',
    createdAt: new Date(d.createdAt).toLocaleDateString(),
  }));

  exportToCSV(formattedData, {
    filename: 'donations',
    headers: {
      id: 'ID',
      amount: 'Amount',
      currency: 'Currency',
      type: 'Type',
      method: 'Payment Method',
      status: 'Status',
      beneficiary: 'Beneficiary',
      notes: 'Notes',
      createdAt: 'Date',
    },
  });
}

/**
 * Export beneficiaries to CSV
 */
export function exportBeneficiaries(beneficiaries: any[]): void {
  const formattedData = beneficiaries.map(b => ({
    id: b.id,
    firstName: b.firstName,
    lastName: b.lastName,
    nationalId: b.nationalId || '',
    phone: b.phone || '',
    email: b.email || '',
    address: b.address || '',
    status: b.status,
    family: b.family?.name || 'N/A',
    createdAt: new Date(b.createdAt).toLocaleDateString(),
  }));

  exportToCSV(formattedData, {
    filename: 'beneficiaries',
    headers: {
      id: 'ID',
      firstName: 'First Name',
      lastName: 'Last Name',
      nationalId: 'National ID',
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      status: 'Status',
      family: 'Family',
      createdAt: 'Registered Date',
    },
  });
}

/**
 * Export families to CSV
 */
export function exportFamilies(families: any[]): void {
  const formattedData = families.map(f => ({
    id: f.id,
    name: f.name,
    address: f.address || '',
    phone: f.phone || '',
    memberCount: f.memberCount || 0,
    status: f.status,
    lastDonationDate: f.lastDonationDate ? new Date(f.lastDonationDate).toLocaleDateString() : 'Never',
    createdAt: new Date(f.createdAt).toLocaleDateString(),
  }));

  exportToCSV(formattedData, {
    filename: 'families',
    headers: {
      id: 'ID',
      name: 'Family Name',
      address: 'Address',
      phone: 'Phone',
      memberCount: 'Members',
      status: 'Status',
      lastDonationDate: 'Last Donation',
      createdAt: 'Registered Date',
    },
  });
}

/**
 * Export report summary to CSV
 */
export function exportReportSummary(data: {
  donations: any[];
  beneficiaries: any[];
  stats: any;
}): void {
  const summary = [
    { metric: 'Total Donations', value: `${data.stats.totalDonations} TND` },
    { metric: 'Total Beneficiaries', value: data.stats.totalBeneficiaries },
    { metric: 'Total Transactions', value: data.donations.length },
    { metric: 'Success Rate', value: `${data.stats.successRate}%` },
    { metric: 'Report Generated', value: new Date().toLocaleString() },
  ];

  exportToCSV(summary, {
    filename: 'report_summary',
    headers: {
      metric: 'Metric',
      value: 'Value',
    },
  });
}
