import React, { useState, useEffect } from 'react';
import { CompanyInfo, CustomerInfo, DocumentInfo, LineItem, FloatingImage } from './types';
import { calculateTotals } from './utils/numberUtils';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Printer, RefreshCcw, LayoutTemplate, Building, CheckCircle2 } from 'lucide-react';

// --- Default Data ---
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
  { id: '1', partNumber: '', description: 'Notebook Dell Latitude 3540\n- CPU: Intel Core i5-1335U\n- RAM: 8GB DDR4\n- SSD: 256GB NVMe', qty: 10, unit: 'เครื่อง', pricePerUnit: 25900, imageHeight: 100 },
  { id: '2', partNumber: '', description: 'Microsoft Office Home & Business 2021 (FPP)', qty: 10, unit: 'ชุด', pricePerUnit: 8900, imageHeight: 100 },
];

const getInitialDocument = (): DocumentInfo => ({
  docNumber: "QT-6703001",
  docConfig: { prefix: "QT-", dateFormat: "YYMM", runNumber: 1, padding: 3, suffix: "", thaiYear: true, autoGen: true },
  date: new Date().toISOString().split('T')[0],
  validDays: 30, dueDate: "", deliveryDate: "ภายใน 15 วัน", paymentTerms: "เครดิต 30 วัน",
  remarks: "หมายเหตุ :\n1. รับประกันสินค้า 3 ปี Onsite Service\n2. ราคานี้รวมภาษีมูลค่าเพิ่มแล้ว",
  vatEnabled: true, vatRate: 7, priceIncludeVat: true, 
  preparedBy: "นายสมชาย ขายดี", formType: 'private',
  signerName: "นายวิษณุวัฒน์ ส่งเสริม", signerPosition: "ผู้จัดการสาขา"
});

// --- Modal ---
const FormatSelectionModal: React.FC<{ onSelect: (type: 'private' | 'government') => void }> = ({ onSelect }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up">
        <div className="bg-slate-900 p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Select Format</h2>
          <p className="text-slate-400 text-sm">เลือกรูปแบบใบเสนอราคาที่ต้องการใช้งาน</p>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50">
            <button onClick={() => onSelect('private')} className="group flex flex-col items-center p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-brand-500 hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-brand-600 mb-4 group-hover:scale-110 transition-transform"><LayoutTemplate size={32}/></div>
                <h3 className="text-lg font-bold text-slate-800">แบบเอกชน (Modern)</h3>
                <p className="text-xs text-slate-500 mt-2 text-center">ดีไซน์ทันสมัย เหมาะสำหรับลูกค้าทั่วไป</p>
            </button>
            <button onClick={() => onSelect('government')} className="group flex flex-col items-center p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform"><Building size={32}/></div>
                <h3 className="text-lg font-bold text-slate-800">แบบราชการ (Official)</h3>
                <p className="text-xs text-slate-500 mt-2 text-center">ตารางมาตรฐาน เหมาะสำหรับหน่วยงานราชการ</p>
            </button>
        </div>
      </div>
    </div>
);

const loadState = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try { return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)!) : fallback; } 
  catch { return fallback; }
};

const App: React.FC = () => {
  const [company, setCompany] = useState<CompanyInfo>(() => loadState('sq_company', DEFAULT_COMPANY));
  const [customer, setCustomer] = useState<CustomerInfo>(() => loadState('sq_customer', DEFAULT_CUSTOMER));
  
  // Force Date to Today on Load
  const [document, setDocument] = useState<DocumentInfo>(() => {
      const saved = loadState('sq_document', getInitialDocument());
      const today = new Date().toISOString().split('T')[0];
      return { ...saved, date: today };
  });

  const [savedCustomers, setSavedCustomers] = useState<CustomerInfo[]>(() => loadState('sq_saved_customers', [DEFAULT_CUSTOMER]));
  const [floatingImages, setFloatingImages] = useState<FloatingImage[]>(() => loadState('sq_floating_images', []));
  
  const [privateItems, setPrivateItems] = useState<LineItem[]>(() => loadState('sq_items_private', DEFAULT_ITEMS));
  const [govItems, setGovItems] = useState<LineItem[]>(() => loadState('sq_items_government', DEFAULT_ITEMS));
  const [showFormatModal, setShowFormatModal] = useState(false);

  // Persistence
  useEffect(() => localStorage.setItem('sq_company', JSON.stringify(company)), [company]);
  useEffect(() => localStorage.setItem('sq_customer', JSON.stringify(customer)), [customer]);
  useEffect(() => localStorage.setItem('sq_document', JSON.stringify(document)), [document]);
  useEffect(() => localStorage.setItem('sq_saved_customers', JSON.stringify(savedCustomers)), [savedCustomers]);
  useEffect(() => localStorage.setItem('sq_items_private', JSON.stringify(privateItems)), [privateItems]);
  useEffect(() => localStorage.setItem('sq_items_government', JSON.stringify(govItems)), [govItems]);
  useEffect(() => localStorage.setItem('sq_floating_images', JSON.stringify(floatingImages)), [floatingImages]);

  // Logic: Auto-Calculate Due Date
  useEffect(() => {
    if (document.date && document.validDays) {
        const startDate = new Date(document.date);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + document.validDays);
        
        const yyyy = endDate.getFullYear();
        const mm = String(endDate.getMonth() + 1).padStart(2, '0');
        const dd = String(endDate.getDate()).padStart(2, '0');
        const newDueDate = `${yyyy}-${mm}-${dd}`;

        if (document.dueDate !== newDueDate) {
            setDocument(prev => ({ ...prev, dueDate: newDueDate }));
        }
    }
  }, [document.date, document.validDays]);

  const currentItems = document.formType === 'government' ? govItems : privateItems;
  const handleSetItems = (newItems: LineItem[]) => document.formType === 'government' ? setGovItems(newItems) : setPrivateItems(newItems);
  const totals = calculateTotals(currentItems, document.vatEnabled, document.vatRate, document.priceIncludeVat);

  // Address Book
  const handleSaveCustomerToBook = (newC: CustomerInfo) => {
      if(!newC.companyName) return alert("ระบุชื่อบริษัท");
      const exists = savedCustomers.some(c => c.companyName === newC.companyName);
      if(exists) { if(confirm("ทับข้อมูลเดิม?")) setSavedCustomers(savedCustomers.map(c => c.companyName === newC.companyName ? newC : c)); }
      else setSavedCustomers([...savedCustomers, newC]);
  };
  const handleDeleteCustomer = (name: string) => setSavedCustomers(prev => prev.filter(c => c.companyName !== name));
  const handleClearAllCustomers = () => setSavedCustomers([]);

  // Floating Images
  const handleAddFloatingImage = (img: FloatingImage) => setFloatingImages(prev => [...prev, img]);
  const handleRemoveFloatingImage = (id: string) => setFloatingImages(prev => prev.filter(img => img.id !== id));
  const handleUpdateFloatingImage = (id: string, updates: Partial<FloatingImage>) => setFloatingImages(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img));

  // Reset
  const handleReset = () => setShowFormatModal(true);
  const handleSelectFormat = (type: 'private' | 'government') => {
      setShowFormatModal(false);
      setCompany(DEFAULT_COMPANY);
      setCustomer({ companyName: "", contactName: "", address: "", phone: "", taxId: "" });
      // Reset Date to Today on Reset as well
      const today = new Date().toISOString().split('T')[0];
      setDocument({ ...getInitialDocument(), formType: type, docNumber: "", date: today });
      setPrivateItems([]); setGovItems([]); setFloatingImages([]);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
        {showFormatModal && <FormatSelectionModal onSelect={handleSelectFormat} />}

        {/* --- LEFT SIDEBAR (EDITOR) --- */}
        <div className="w-[420px] bg-white border-r border-gray-200 flex flex-col z-20 shadow-2xl no-print">
            <div className="h-16 bg-slate-850 flex items-center justify-between px-6 shadow-md shrink-0">
                <h1 className="text-white font-bold text-lg tracking-tight flex items-center gap-2">
                    SmartQuote <span className="text-brand-500">2026</span>
                </h1>
                <div className="flex gap-2">
                     <button onClick={handleReset} className="text-slate-400 hover:text-white transition-colors" title="New"><RefreshCcw size={18}/></button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                <Editor 
                   company={company} setCompany={setCompany}
                   customer={customer} setCustomer={setCustomer}
                   document={document} setDocument={setDocument}
                   items={currentItems} setItems={handleSetItems}
                   savedCustomers={savedCustomers} onSaveCustomer={handleSaveCustomerToBook} onDeleteCustomer={handleDeleteCustomer} onClearAllCustomers={handleClearAllCustomers}
                   onAddFloatingImage={handleAddFloatingImage} floatingImages={floatingImages} onRemoveFloatingImage={handleRemoveFloatingImage}
                />
            </div>
        </div>

        {/* --- RIGHT CANVAS (PREVIEW) --- */}
        <div className="flex-1 bg-slate-100/50 relative overflow-hidden flex flex-col">
            {/* Toolbar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 no-print">
                <div className="bg-white/90 backdrop-blur-md border border-gray-200 p-2 rounded-full shadow-xl flex items-center gap-2 px-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${document.formType === 'government' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-brand-700'}`}>
                        {document.formType === 'government' ? 'Government Mode' : 'Private Mode'}
                    </span>
                    <div className="w-px h-4 bg-gray-300 mx-2"></div>
                    <button onClick={() => window.print()} className="bg-slate-800 hover:bg-black text-white px-5 py-2 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                        <Printer size={16} /> Print / PDF
                    </button>
                </div>
            </div>

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-8 flex justify-center items-start print:p-0 print:overflow-visible">
                <div className="bg-white shadow-2xl print:shadow-none transition-transform duration-300 a4-page relative ring-1 ring-black/5">
                    <Preview 
                        company={company} customer={customer} document={document} 
                        items={currentItems} totals={totals} 
                        floatingImages={floatingImages} onUpdateFloatingImage={handleUpdateFloatingImage} onRemoveFloatingImage={handleRemoveFloatingImage}
                    />
                </div>
            </div>
        </div>
    </div>
  );
};

export default App;