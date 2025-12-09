import React, { useState, useEffect } from 'react';
import { CompanyInfo, CustomerInfo, DocumentInfo, LineItem, FloatingImage } from './types';
import { calculateTotals } from './utils/numberUtils';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Printer, LayoutTemplate, Building, ChevronLeft, Download } from 'lucide-react';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden animate-slide-up flex flex-col md:flex-row">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-10 text-white md:w-2/5 flex flex-col justify-center">
            <h1 className="text-3xl font-bold mb-2">SmartQuote</h1>
            <p className="text-slate-300 mb-8">Professional Quotation Generator</p>
            <p className="text-sm text-slate-400 leading-relaxed">Please select the document format you wish to create. This will initialize a new session.</p>
        </div>
        <div className="p-10 md:w-3/5 bg-slate-50 flex flex-col justify-center gap-6">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Select Template</h2>
            <button onClick={() => onSelect('private')} className="group flex items-center p-4 bg-white border border-slate-200 rounded-2xl hover:border-brand-500 hover:shadow-lg transition-all text-left">
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center text-brand-600 mr-4 group-hover:scale-110 transition-transform"><LayoutTemplate size={28}/></div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-brand-600 transition-colors">Private / Modern</h3>
                    <p className="text-xs text-slate-500">Clean design for general business.</p>
                </div>
            </button>
            <button onClick={() => onSelect('government')} className="group flex items-center p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all text-left">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mr-4 group-hover:scale-110 transition-transform"><Building size={28}/></div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Government / Official</h3>
                    <p className="text-xs text-slate-500">Standard form for official use.</p>
                </div>
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
  const [activeTab, setActiveTab] = useState<'doc' | 'items' | 'images'>('doc');

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

  const handleSaveCustomerToBook = (newC: CustomerInfo) => {
      if(!newC.companyName) return alert("ระบุชื่อบริษัท");
      const exists = savedCustomers.some(c => c.companyName === newC.companyName);
      if(exists) { if(confirm("ทับข้อมูลเดิม?")) setSavedCustomers(savedCustomers.map(c => c.companyName === newC.companyName ? newC : c)); }
      else setSavedCustomers([...savedCustomers, newC]);
  };
  const handleDeleteCustomer = (name: string) => setSavedCustomers(prev => prev.filter(c => c.companyName !== name));
  const handleClearAllCustomers = () => setSavedCustomers([]);

  const handleAddFloatingImage = (img: FloatingImage) => setFloatingImages(prev => [...prev, img]);
  const handleRemoveFloatingImage = (id: string) => setFloatingImages(prev => prev.filter(img => img.id !== id));
  const handleUpdateFloatingImage = (id: string, updates: Partial<FloatingImage>) => setFloatingImages(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img));

  const handleReset = () => setShowFormatModal(true);
  const handleSelectFormat = (type: 'private' | 'government') => {
      setShowFormatModal(false);
      setCompany(DEFAULT_COMPANY);
      setCustomer({ companyName: "", contactName: "", address: "", phone: "", taxId: "" });
      const today = new Date().toISOString().split('T')[0];
      setDocument({ ...getInitialDocument(), formType: type, docNumber: "", date: today });
      setPrivateItems([]); setGovItems([]); setFloatingImages([]);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-4 md:p-6 overflow-hidden relative">
        {showFormatModal && <FormatSelectionModal onSelect={handleSelectFormat} />}

        {/* --- MAIN WORKSPACE --- */}
        <div className="w-full h-full max-w-[1920px] grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-6 relative">
            
            {/* LEFT PANE: EDITOR */}
            <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-soft flex flex-col overflow-hidden border border-white/40 relative z-20">
                {/* Header */}
                <div className="h-20 px-8 flex items-center justify-between border-b border-slate-100 shrink-0 bg-white">
                    <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white shadow-glow">
                             <LayoutTemplate size={20} />
                         </div>
                         <div>
                             <h1 className="text-slate-800 font-bold text-lg leading-tight">SmartQuote</h1>
                             <p className="text-[10px] text-slate-400 font-medium tracking-wide">PRO EDITION</p>
                         </div>
                    </div>
                    <button onClick={handleReset} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors" title="New Quote">
                        <Download size={20} className="rotate-180" />
                    </button>
                </div>

                {/* Editor Content */}
                <div className="flex-1 overflow-y-auto scroll-smooth">
                    <Editor 
                       activeTab={activeTab} setActiveTab={setActiveTab}
                       company={company} setCompany={setCompany}
                       customer={customer} setCustomer={setCustomer}
                       document={document} setDocument={setDocument}
                       items={currentItems} setItems={handleSetItems}
                       savedCustomers={savedCustomers} onSaveCustomer={handleSaveCustomerToBook} onDeleteCustomer={handleDeleteCustomer} onClearAllCustomers={handleClearAllCustomers}
                       onAddFloatingImage={handleAddFloatingImage} floatingImages={floatingImages} onRemoveFloatingImage={handleRemoveFloatingImage}
                    />
                </div>
            </div>

            {/* RIGHT PANE: PREVIEW */}
            <div className="hidden lg:flex flex-col relative rounded-[2rem] bg-slate-900/50 backdrop-blur-sm border border-white/10 shadow-inner overflow-hidden">
                {/* Toolbar */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 p-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-white/50 no-print">
                     <button onClick={() => setDocument({...document, formType: 'private'})} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${document.formType === 'private' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>Modern</button>
                     <button onClick={() => setDocument({...document, formType: 'government'})} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${document.formType === 'government' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>Official</button>
                     <div className="w-px h-4 bg-slate-300 mx-2"></div>
                     <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-full text-xs font-bold shadow-glow transition-all">
                         <Printer size={14} /> Print
                     </button>
                </div>

                {/* Canvas */}
                <div className="flex-1 overflow-y-auto p-12 flex justify-center items-start print:p-0 print:overflow-visible custom-scrollbar">
                    <div className="bg-white shadow-2xl print:shadow-none transition-transform duration-300 origin-top scale-[0.9] xl:scale-100 a4-page relative ring-1 ring-black/5">
                        <Preview 
                            company={company} customer={customer} document={document} 
                            items={currentItems} totals={totals} 
                            floatingImages={floatingImages} onUpdateFloatingImage={handleUpdateFloatingImage} onRemoveFloatingImage={handleRemoveFloatingImage}
                        />
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
};

export default App;