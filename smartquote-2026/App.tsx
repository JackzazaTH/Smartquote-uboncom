import React, { useState, useEffect } from 'react';
import { CompanyInfo, CustomerInfo, DocumentInfo, LineItem } from './types';
import { calculateTotals } from './utils/numberUtils';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Printer, FileText, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';

// --- Default Data Constants ---

const DEFAULT_COMPANY: CompanyInfo = {
  name: "ห้างหุ้นส่วนจำกัด อุบลคอมพิวเตอร์ แอนด์ เทเลคอมเซอร์วิส",
  addressLine1: "42,44,46 ถนนพโลชัย ต.ในเมือง อ.เมือง",
  addressLine2: "จ.อุบลราชธานี 34000",
  taxId: "0343536000913",
  phone: "045-240835-8",
  fax: "045-255061",
  logoUrl: "https://img5.pic.in.th/file/secure-sv1/logo-Ubon-computer-full-01.png",
  bankName: "ธนาคารกสิกรไทย",
  bankAccount: "123-2-45678-9",
  bankBranch: "สาขาอุบลราชธานี"
};

const DEFAULT_CUSTOMER: CustomerInfo = {
  companyName: "มหาวิทยาลัยอุบลราชธานี",
  contactName: "กองคลังและพัสดุ",
  address: "85 หมู่ 4 ถนนสถลมาร์ค ตำบลเมืองศรีไค อำเภอวารินชำราบ จังหวัดอุบลราชธานี 34190",
  phone: "045-353-000",
  taxId: "0994000005555"
};

const DEFAULT_ITEMS: LineItem[] = [
  {
    id: '1',
    partNumber: 'NB-DELL-001',
    description: 'Notebook Dell Latitude 3540\n- CPU: Intel Core i5-1335U\n- RAM: 8GB DDR4\n- SSD: 256GB NVMe\n- OS: Windows 11 Pro',
    qty: 10,
    unit: 'เครื่อง',
    pricePerUnit: 25900,
    discountValue: 0,
    discountType: 'amount',
    imageHeight: 100
  },
  {
    id: '2',
    partNumber: 'MS-OFFICE',
    description: 'Microsoft Office Home & Business 2021 (FPP)',
    qty: 10,
    unit: 'ชุด',
    pricePerUnit: 8900,
    discountValue: 0,
    discountType: 'amount',
    imageHeight: 100
  },
  {
    id: '3',
    partNumber: 'LOGITECH-MS',
    description: 'Wireless Mouse Logitech M185',
    qty: 10,
    unit: 'อัน',
    pricePerUnit: 450,
    discountValue: 0,
    discountType: 'amount',
    imageHeight: 100
  }
];

// Helper for initial document state
const getInitialDocument = (): DocumentInfo => ({
  docNumber: "QT-6703001",
  docConfig: {
    prefix: "QT-",
    dateFormat: "YYMM",
    runNumber: 1,
    padding: 3,
    suffix: "",
    thaiYear: true,
    autoGen: true
  },
  date: new Date().toISOString().split('T')[0],
  validDays: 30,
  dueDate: "",
  deliveryDate: "ภายใน 15 วัน",
  paymentTerms: "เครดิต 30 วัน",
  remarks: "หมายเหตุ :\n1. รับประกันสินค้า 3 ปี Onsite Service\n2. ราคานี้รวมภาษีมูลค่าเพิ่มแล้ว",
  vatEnabled: true,
  vatRate: 7,
  priceIncludeVat: true, 
  preparedBy: "นายสมชาย ขายดี",
  formType: 'government',
  signerName: "นายวิษณุวัฒน์ ส่งเสริม",
  signerPosition: "ผู้จัดการสาขา"
});

// Helper to load from LocalStorage (SSR Safe)
const loadState = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    console.warn(`Error loading ${key} from localStorage`, e);
    return fallback;
  }
};

const App: React.FC = () => {
  // --- State Initialization with LocalStorage ---
  const [company, setCompany] = useState<CompanyInfo>(() => 
    loadState('sq_company', DEFAULT_COMPANY)
  );

  const [customer, setCustomer] = useState<CustomerInfo>(() => 
    loadState('sq_customer', DEFAULT_CUSTOMER)
  );

  const [document, setDocument] = useState<DocumentInfo>(() => 
    loadState('sq_document', getInitialDocument())
  );

  const [items, setItems] = useState<LineItem[]>(() => 
    loadState('sq_items', DEFAULT_ITEMS)
  );

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // --- Persistence Effects with Error Handling ---
  const saveState = (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    setSaveStatus('saving');
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setTimeout(() => setSaveStatus('saved'), 500);
    } catch (e: any) {
      console.error("LocalStorage Save Error:", e);
      setSaveStatus('error');
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
          alert('⚠️ พื้นที่จัดเก็บข้อมูลในเบราว์เซอร์เต็ม! (Storage Full)\n\nกรุณาลบรูปภาพสินค้าที่มีขนาดใหญ่ออก หรือ Reset ข้อมูลเพื่อล้างพื้นที่');
      }
    }
  };

  useEffect(() => saveState('sq_company', company), [company]);
  useEffect(() => saveState('sq_customer', customer), [customer]);
  useEffect(() => saveState('sq_document', document), [document]);
  useEffect(() => saveState('sq_items', items), [items]);

  // --- Logic Effects ---
  
  // Auto-calculate Due Date
  useEffect(() => {
    if (document.date && document.validDays) {
      const date = new Date(document.date);
      date.setDate(date.getDate() + document.validDays);
      setDocument(prev => {
        const newDueDate = date.toISOString().split('T')[0];
        if (prev.dueDate === newDueDate) return prev;
        return { ...prev, dueDate: newDueDate };
      });
    }
  }, [document.date, document.validDays]);

  // Auto-Generate Document Number
  useEffect(() => {
    if (document.docConfig.autoGen) {
      const { prefix, dateFormat, runNumber, padding, suffix, thaiYear } = document.docConfig;
      let datePart = "";
      
      if (dateFormat !== 'NONE') {
        const today = new Date();
        let year = today.getFullYear();
        if (thaiYear) year += 543;
        
        const yearStr = year.toString();
        const shortYear = yearStr.substring(2);
        const month = (today.getMonth() + 1).toString().padStart(2, '0');

        switch (dateFormat) {
          case 'YYYYMM': datePart = `${yearStr}${month}`; break;
          case 'YYMM': datePart = `${shortYear}${month}`; break;
          case 'YYYY': datePart = `${yearStr}`; break;
        }
      }

      const numStr = runNumber.toString().padStart(padding, '0');
      const newDocId = `${prefix}${datePart}${numStr}${suffix}`;

      setDocument(prev => {
        if (prev.docNumber === newDocId) return prev;
        return { ...prev, docNumber: newDocId };
      });
    }
  }, [document.docConfig]); 

  const totals = calculateTotals(items, document.vatEnabled, document.vatRate, document.priceIncludeVat);

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (window.confirm('ยืนยันการล้างข้อมูล?\n\nข้อมูลทั้งหมดจะถูกลบและกลับสู่ค่าเริ่มต้น')) {
      setCompany(DEFAULT_COMPANY);
      setCustomer(DEFAULT_CUSTOMER);
      setDocument(getInitialDocument());
      setItems(DEFAULT_ITEMS);
      localStorage.clear(); 
      window.location.reload(); // Reload to ensure clean slate
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans text-gray-900 bg-gray-100">
      
      {/* Sidebar Editor (Left) */}
      <div className="w-full md:w-[400px] lg:w-[450px] flex-shrink-0 bg-white border-r border-gray-200 md:h-screen md:overflow-y-auto no-print shadow-2xl z-20 md:fixed md:left-0 top-0 h-auto">
        <div className="p-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white sticky top-0 z-20 shadow-md flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2 tracking-tight">
                  <FileText className="text-white/90" /> SmartQuote 2026 - Ubon Computer
              </h1>
              <div className="flex items-center gap-2 pl-8">
                  {saveStatus === 'saved' && (
                      <span className="flex items-center gap-1 text-[10px] text-brand-100 bg-white/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={10} /> Saved
                      </span>
                  )}
                  {saveStatus === 'saving' && (
                      <span className="flex items-center gap-1 text-[10px] text-white/80 animate-pulse">
                          Saving...
                      </span>
                  )}
                  {saveStatus === 'error' && (
                      <span className="flex items-center gap-1 text-[10px] text-red-200 bg-red-900/50 px-2 py-0.5 rounded-full">
                          <AlertCircle size={10} /> Error
                      </span>
                  )}
              </div>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={handleReset}
                    className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full shadow-sm transition-colors"
                    title="ล้างข้อมูล / เริ่มใหม่ (Reset)"
                >
                    <RotateCcw size={18} />
                </button>
                <button 
                    onClick={handlePrint}
                    className="md:hidden bg-white text-brand-600 p-2 rounded-full shadow-lg active:scale-95 transition-transform"
                >
                    <Printer size={20} />
                </button>
            </div>
        </div>
        
        <div className="p-4 bg-gray-50/50 min-h-full">
            <Editor 
              company={company} setCompany={setCompany}
              customer={customer} setCustomer={setCustomer}
              document={document} setDocument={setDocument}
              items={items} setItems={setItems}
            />
        </div>
      </div>

      {/* Main Preview Area (Right) */}
      <div className="flex-grow md:ml-[400px] lg:ml-[450px] p-4 md:p-8 overflow-y-auto flex flex-col items-center print:m-0 print:p-0 print:w-full print:h-full bg-gray-100/80">
         
         {/* Toolbar */}
         <div className="w-full max-w-[21cm] mb-6 flex justify-between items-center no-print">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Preview Mode (A4)
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <button 
                    onClick={handlePrint}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 text-white px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all font-bold tracking-wide text-sm"
                >
                    <Printer size={18} /> พิมพ์ / บันทึก PDF
                </button>
            </div>
         </div>

         {/* The Paper Sheet */}
         <div className="bg-white shadow-2xl print:shadow-none w-full max-w-[21cm] print:max-w-none print:w-full mx-auto animate-fade-in a4-page ring-1 ring-black/5">
             <Preview 
                company={company}
                customer={customer}
                document={document}
                items={items}
                totals={totals}
             />
         </div>
         
         <div className="mt-8 text-center text-gray-400 text-xs no-print pb-8 flex flex-col gap-2">
            <p>ออกแบบโดยรองรับกระดาษขนาด A4 มาตรฐาน</p>
            <div className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
                 💡 <strong>Tips:</strong> กดปุ่มพิมพ์ และเลือก Destination เป็น <strong>"Save as PDF"</strong> เพื่อบันทึกไฟล์
            </div>
         </div>

      </div>

    </div>
  );
};

export default App;