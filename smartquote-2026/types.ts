
export interface LineItem {
  id: string;
  partNumber: string;
  description: string;
  qty: number;
  unit: string;
  pricePerUnit: number;
  imageUrl?: string; // Base64 or URL of the product image
  imageHeight?: number; // Height in pixels for the preview
}

export interface CompanyInfo {
  name: string;
  addressLine1: string;
  addressLine2: string;
  taxId: string;
  phone: string;
  fax: string;
  logoUrl?: string;
  promptPayId?: string;
  bankName?: string;
  bankAccount?: string;
  bankBranch?: string;
}

export interface CustomerInfo {
  contactName: string;
  companyName: string;
  address: string;
  phone: string;
  taxId?: string;
}

export interface DocConfig {
  prefix: string;
  dateFormat: 'YYYYMM' | 'YYMM' | 'YYYY' | 'NONE';
  runNumber: number;
  padding: number;
  suffix: string;
  thaiYear: boolean;
  autoGen: boolean;
}

export type FormType = 'private' | 'government';

export interface DocumentInfo {
  docNumber: string;
  docConfig: DocConfig; // Configuration for auto-numbering
  date: string; // ISO date string YYYY-MM-DD
  validDays: number;
  dueDate: string; // Calculated or manual
  deliveryDate?: string; // New field for PDF matching
  paymentTerms: string;
  remarks: string;
  vatEnabled: boolean; // VAT Toggle
  vatRate: number; // Default 7
  priceIncludeVat: boolean; // New: Prices include VAT
  preparedBy: string; // Salesperson Name
  formType: FormType; // Private or Government design
  signerName?: string; // Authorized Signer Name
  signerPosition?: string; // Authorized Signer Position
}

export interface CalculationSummary {
  totalExVat: number;
  vatAmount: number;
  grandTotal: number;
  grandTotalText: string;
  priceIncludeVat: boolean; // Pass to preview
  preVatTotal: number; // Explicit Pre-Vat amount for display
}
