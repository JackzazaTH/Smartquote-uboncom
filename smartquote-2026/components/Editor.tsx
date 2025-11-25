import React, { useState } from 'react';
import { CompanyInfo, CustomerInfo, DocumentInfo, LineItem } from '../types';
import { Plus, Trash2, Calendar, User, Building, CreditCard, Upload, FileText, ChevronDown, Settings, RefreshCcw, LayoutTemplate, Image as ImageIcon, X, PenTool, CheckCircle2 } from 'lucide-react';

interface EditorProps {
  company: CompanyInfo;
  setCompany: (c: CompanyInfo) => void;
  customer: CustomerInfo;
  setCustomer: (c: CustomerInfo) => void;
  document: DocumentInfo;
  setDocument: (d: DocumentInfo) => void;
  items: LineItem[];
  setItems: (i: LineItem[]) => void;
}

const InputGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-800 mb-2 uppercase tracking-wide flex items-center gap-1">
      {label}
    </label>
    {children}
  </div>
);

const StyledInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder-gray-400 bg-white shadow-sm hover:border-gray-400"
  />
);

const StyledTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder-gray-400 bg-white shadow-sm resize-none hover:border-gray-400"
  />
);

interface CollapsibleSectionProps {
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, icon: Icon, isOpen, onToggle, children }) => (
  <div className={`bg-white rounded-xl shadow-sm border transition-all duration-300 overflow-hidden ${isOpen ? 'border-brand-200 ring-1 ring-brand-100' : 'border-gray-200 hover:border-brand-200'}`}>
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between p-4 text-left transition-all ${
        isOpen ? 'bg-brand-50/50' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl transition-all shadow-sm ${
          isOpen ? 'bg-brand-500 text-white shadow-brand-200' : 'bg-white text-gray-500 border border-gray-100'
        }`}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <span className={`font-bold text-base tracking-tight ${
          isOpen ? 'text-brand-900' : 'text-gray-600'
        }`}>
          {title}
        </span>
      </div>
      <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
         <ChevronDown size={20} className={isOpen ? 'text-brand-500' : 'text-gray-400'} />
      </div>
    </button>
    
    <div className={`transition-all duration-300 ease-in-out ${
      isOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
    }`}>
      <div className="p-5 border-t border-brand-100/50 bg-white">
        {children}
      </div>
    </div>
  </div>
);

export const Editor: React.FC<EditorProps> = ({
  company,
  setCompany,
  customer,
  setCustomer,
  document,
  setDocument,
  items,
  setItems,
}) => {
  const [activeSection, setActiveSection] = useState<string | null>('document');
  const [showDocSettings, setShowDocSettings] = useState(false);

  const toggleSection = (section: string) => {
    setActiveSection(prev => prev === section ? null : section);
  };
  
  const handleItemChange = (id: string, field: keyof LineItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addItem = () => {
    if (items.length >= 10) {
      alert("⚠️ คำเตือน: รายการสินค้าครบจำนวนที่กำหนดแล้ว (10 รายการ)\n\nเพื่อให้เอกสารสวยงามและพอดีกับ 1 หน้ากระดาษ A4 ระบบจึงจำกัดจำนวนรายการไว้เท่านี้");
      return;
    }

    const newItem: LineItem = {
      id: Date.now().toString(),
      partNumber: '',
      description: '',
      qty: 1,
      unit: 'ตัว',
      pricePerUnit: 0,
      discountValue: 0,
      discountType: 'amount',
      imageHeight: 100 // Default height
    };
    setItems([...items, newItem]);
    if (activeSection !== 'items') setActiveSection('items');
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  // Helper to check file size (Limit to 800KB to prevent LocalStorage full)
  const checkFileSize = (file: File): boolean => {
      if (file.size > 800 * 1024) {
          alert(`⚠️ ไฟล์มีขนาดใหญ่เกินไป (${(file.size / 1024 / 1024).toFixed(2)} MB)\n\nกรุณาใช้ไฟล์ขนาดไม่เกิน 800KB เพื่อให้ระบบบันทึกข้อมูลได้`);
          return false;
      }
      return true;
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!checkFileSize(file)) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        setCompany({ ...company, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!checkFileSize(file)) return;
      
      const reader = new FileReader();
      reader.onloadend = () => {
        handleItemChange(id, 'imageUrl', reader.result as string);
        // Set default height if not present
        const currentItem = items.find(i => i.id === id);
        if (!currentItem?.imageHeight) {
            handleItemChange(id, 'imageHeight', 100);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  return (
    <div className="space-y-4 pb-20">
      
      {/* Sticky Form Type Selector - PROMINENT & SEGMENTED */}
      <div className="sticky top-[76px] z-30 -mx-4 px-4 py-3 bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-sm mb-6 transition-all">
        <div className="bg-gray-100 p-1 rounded-xl flex gap-1 shadow-inner border border-gray-200">
            <button 
                onClick={() => setDocument({...document, formType: 'private'})}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                    document.formType === 'private' 
                    ? 'bg-white text-brand-600 shadow-sm ring-1 ring-black/5 transform scale-[1.02]' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
            >
                <div className={`p-1 rounded-md transition-colors ${document.formType === 'private' ? 'bg-brand-50 text-brand-600' : 'bg-transparent text-gray-400'}`}>
                   <LayoutTemplate size={16} />
                </div>
                <span>แบบเอกชน</span>
            </button>
            <button 
                onClick={() => setDocument({...document, formType: 'government'})}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                    document.formType === 'government' 
                    ? 'bg-white text-black shadow-sm ring-1 ring-black/5 transform scale-[1.02]' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
            >
                <div className={`p-1 rounded-md transition-colors ${document.formType === 'government' ? 'bg-gray-200 text-black' : 'bg-transparent text-gray-400'}`}>
                    <Building size={16} />
                </div>
                <span>แบบราชการ</span>
            </button>
        </div>
      </div>

      {/* Document Settings */}
      <CollapsibleSection 
        title="ตั้งค่าเอกสาร (Document)" 
        icon={Calendar} 
        isOpen={activeSection === 'document'}
        onToggle={() => toggleSection('document')}
      >
        <div className="grid grid-cols-2 gap-4">
           
           <div className="col-span-2">
               <div className="flex justify-between items-center mb-1.5">
                   <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1">เลขที่เอกสาร <CheckCircle2 size={12} className="text-brand-500" /></label>
                   <button 
                      onClick={() => setShowDocSettings(!showDocSettings)}
                      className="text-xs text-brand-600 flex items-center gap-1 hover:underline font-medium bg-brand-50 px-2 py-0.5 rounded-full"
                   >
                       <Settings size={12} /> ตั้งค่าเลขรัน
                   </button>
               </div>
               <div className="relative">
                   <StyledInput value={document.docNumber} onChange={e => setDocument({...document, docNumber: e.target.value})} className="font-mono" />
               </div>
               
               {/* Advanced Doc Number Settings Panel */}
               {showDocSettings && (
                   <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-3 shadow-inner">
                       <div className="flex items-center gap-2 mb-2">
                           <input 
                              type="checkbox" 
                              checked={document.docConfig.autoGen}
                              onChange={e => setDocument({...document, docConfig: {...document.docConfig, autoGen: e.target.checked}})}
                              id="autoGen"
                              className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                           />
                           <label htmlFor="autoGen" className="font-bold text-gray-700">เปิดใช้งานรันเลขอัตโนมัติ</label>
                       </div>
                       
                       {document.docConfig.autoGen && (
                           <div className="grid grid-cols-2 gap-3">
                               <div>
                                   <label className="block text-gray-500 mb-1 font-bold">Prefix</label>
                                   <input className="w-full border rounded-lg p-2 bg-white" value={document.docConfig.prefix} onChange={e => setDocument({...document, docConfig: {...document.docConfig, prefix: e.target.value}})} />
                               </div>
                               <div>
                                   <label className="block text-gray-500 mb-1 font-bold">Date Format</label>
                                   <select className="w-full border rounded-lg p-2 bg-white" value={document.docConfig.dateFormat} onChange={e => setDocument({...document, docConfig: {...document.docConfig, dateFormat: e.target.value as any}})}>
                                       <option value="YYYYMM">YYYYMM (202402)</option>
                                       <option value="YYMM">YYMM (2402)</option>
                                       <option value="YYYY">YYYY (2024)</option>
                                       <option value="NONE">None</option>
                                   </select>
                               </div>
                               <div>
                                   <label className="block text-gray-500 mb-1 font-bold">Run Number</label>
                                   <input type="number" className="w-full border rounded-lg p-2 bg-white" value={document.docConfig.runNumber} onChange={e => setDocument({...document, docConfig: {...document.docConfig, runNumber: Number(e.target.value)}})} />
                               </div>
                               <div>
                                   <label className="block text-gray-500 mb-1 font-bold">Thai Year</label>
                                   <div className="flex items-center gap-2 mt-2">
                                       <input type="checkbox" checked={document.docConfig.thaiYear} onChange={e => setDocument({...document, docConfig: {...document.docConfig, thaiYear: e.target.checked}})} className="rounded text-brand-600 focus:ring-brand-500" />
                                       <span>ใช้พ.ศ.</span>
                                   </div>
                               </div>
                           </div>
                       )}
                   </div>
               )}
           </div>

           <InputGroup label="วันที่เอกสาร">
             <StyledInput type="date" value={document.date} onChange={e => setDocument({...document, date: e.target.value})} />
           </InputGroup>
           
           <InputGroup label="วันส่งสินค้า (ถ้ามี)">
             <StyledInput value={document.deliveryDate || ''} onChange={e => setDocument({...document, deliveryDate: e.target.value})} placeholder="เช่น ภายใน 30 วัน" />
           </InputGroup>

           <InputGroup label="ยืนราคา (วัน)">
             <StyledInput 
                type="number" 
                value={document.validDays} 
                onChange={e => setDocument({...document, validDays: Number(e.target.value)})} 
                onFocus={handleFocus}
             />
           </InputGroup>
           
           <InputGroup label="เงื่อนไขการชำระ">
             <StyledInput value={document.paymentTerms} onChange={e => setDocument({...document, paymentTerms: e.target.value})} />
           </InputGroup>

           <div className="col-span-2">
             <InputGroup label="พนักงานขาย (Prepared By)">
                <StyledInput 
                  value={document.preparedBy} 
                  onChange={e => setDocument({...document, preparedBy: e.target.value})} 
                  placeholder="เช่น สมชาย ใจดี"
                />
             </InputGroup>
           </div>
           
           <div className="col-span-2 mt-2 bg-brand-50/50 p-4 rounded-xl border border-brand-100">
               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-brand-100 rounded text-brand-600"><CreditCard size={14}/></div>
                        <span className="font-bold text-gray-900 text-sm">การคำนวณภาษี (VAT)</span>
                        <label className="relative inline-flex items-center cursor-pointer ml-2">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={document.vatEnabled}
                                onChange={e => setDocument({...document, vatEnabled: e.target.checked})}
                            />
                            <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
                        </label>
                    </div>
               </div>
               
               {document.vatEnabled && (
                 <div className="space-y-3 animate-fade-in-down mt-3 pl-2 border-l-2 border-brand-200 ml-3">
                     <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 min-w-[100px] font-medium">อัตราภาษี (%):</span>
                        <input 
                            type="number" 
                            value={document.vatRate} 
                            onChange={e => setDocument({...document, vatRate: Number(e.target.value)})}
                            onFocus={handleFocus}
                            className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center font-bold focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                        />
                     </div>
                     
                     <div className="flex items-center gap-2">
                        <input 
                           type="checkbox" 
                           id="priceIncludeVat"
                           checked={document.priceIncludeVat}
                           onChange={e => setDocument({...document, priceIncludeVat: e.target.checked})}
                           className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                        />
                        <label htmlFor="priceIncludeVat" className="text-sm text-gray-700 select-none font-medium">
                            ราคารวมภาษีแล้ว (คำนวณถอด VAT)
                        </label>
                     </div>
                 </div>
               )}
           </div>
        </div>
      </CollapsibleSection>
      
      {/* Signature Section */}
      <CollapsibleSection
        title="ลงนามอนุมัติ (Signature)"
        icon={PenTool}
        isOpen={activeSection === 'signature'}
        onToggle={() => toggleSection('signature')}
      >
        <div className="space-y-4">
            <InputGroup label="ชื่อผู้มีอำนาจลงนาม (Signer Name)">
                <StyledInput 
                    value={document.signerName || ''} 
                    onChange={e => setDocument({...document, signerName: e.target.value})}
                    placeholder="เช่น นายวิษณุวัฒน์ ส่งเสริม" 
                />
            </InputGroup>
            <InputGroup label="ตำแหน่ง (Position)">
                <StyledInput 
                    value={document.signerPosition || ''} 
                    onChange={e => setDocument({...document, signerPosition: e.target.value})}
                    placeholder="เช่น ผู้จัดการสาขา" 
                />
            </InputGroup>
        </div>
      </CollapsibleSection>

      {/* Customer Info */}
      <CollapsibleSection 
        title="ข้อมูลลูกค้า" 
        icon={User} 
        isOpen={activeSection === 'customer'}
        onToggle={() => toggleSection('customer')}
      >
        <div className="space-y-4">
             <InputGroup label="ชื่อบริษัท / หน่วยงาน (Company/Org)">
                <StyledInput value={customer.companyName} onChange={e => setCustomer({...customer, companyName: e.target.value})} placeholder="ระบุชื่อบริษัท" />
             </InputGroup>
             <InputGroup label="ชื่อผู้ติดต่อ (เรียน...) (Attention)">
                <StyledInput value={customer.contactName} onChange={e => setCustomer({...customer, contactName: e.target.value})} placeholder="ระบุชื่อผู้ติดต่อ" />
             </InputGroup>
             <InputGroup label="ที่อยู่">
                <StyledInput value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} />
             </InputGroup>
             <div className="grid grid-cols-2 gap-4">
                <InputGroup label="เบอร์โทร">
                    <StyledInput value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
                </InputGroup>
                <InputGroup label="เลขภาษี (ถ้ามี)">
                    <StyledInput value={customer.taxId || ''} onChange={e => setCustomer({...customer, taxId: e.target.value})} />
                </InputGroup>
             </div>
        </div>
      </CollapsibleSection>

      {/* Items */}
      <CollapsibleSection 
        title="รายการสินค้า" 
        icon={CreditCard} 
        isOpen={activeSection === 'items'}
        onToggle={() => toggleSection('items')}
      >
        <div className="space-y-4">
            <button 
                onClick={addItem} 
                disabled={items.length >= 10}
                className={`w-full py-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 font-bold transition-all mb-4 ${
                  items.length >= 10 
                    ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed' 
                    : 'bg-brand-50/50 text-brand-600 border-brand-300 hover:bg-brand-50 hover:border-brand-500 hover:shadow-sm hover:scale-[1.01]'
                }`}
            >
                <div className={`p-1 rounded-full ${items.length >= 10 ? 'bg-gray-200' : 'bg-brand-100'}`}>
                    <Plus size={18} /> 
                </div>
                {items.length >= 10 ? 'ครบจำนวน 10 รายการแล้ว' : 'เพิ่มรายการใหม่'}
            </button>
            {items.length >= 10 && (
                <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 text-xs rounded-lg mb-4 border border-red-100">
                    <div className="shrink-0 mt-0.5">⚠️</div>
                    <span>จำกัด 10 รายการ เพื่อให้พอดีกับหน้า A4 หากต้องการเพิ่ม กรุณาลบรายการเดิมออก</span>
                </div>
            )}

            {items.map((item, index) => (
                <div key={item.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm group hover:border-brand-300 transition-all hover:shadow-md mb-3">
                    {/* Header Row: Index & Delete Button */}
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-[10px] font-bold">
                                {index + 1}
                             </div>
                             <span className="text-xs font-bold text-gray-500 uppercase">สินค้าที่ {index + 1}</span>
                        </div>
                        <button 
                            onClick={() => removeItem(item.id)} 
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-md transition-colors flex items-center gap-1 text-xs"
                            title="Remove Item"
                        >
                            <Trash2 size={14} /> <span className="font-bold">ลบรายการ</span>
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-12 gap-3 pb-0">
                        <div className="col-span-12">
                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Part No.</label>
                            <StyledInput value={item.partNumber} onChange={e => handleItemChange(item.id, 'partNumber', e.target.value)} placeholder="Code" className="font-mono text-xs" />
                        </div>

                        <div className="col-span-12">
                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Description</label>
                            <StyledTextArea 
                                rows={2}
                                value={item.description} 
                                onChange={e => handleItemChange(item.id, 'description', e.target.value)} 
                                placeholder="รายละเอียดสินค้า..."
                                className="min-h-[60px]"
                            />
                            
                            {/* Product Image Section */}
                            <div className="mt-3 flex items-center gap-3 flex-wrap p-2 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 transition-colors shadow-sm">
                                    <ImageIcon size={14} className="text-brand-500" />
                                    {item.imageUrl ? 'เปลี่ยนรูป' : 'เพิ่มรูปภาพ'}
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleProductImageUpload(item.id, e)} />
                                </label>
                                
                                {item.imageUrl && (
                                    <>
                                        <div className="relative group/img bg-white p-1 rounded border border-gray-200">
                                            <img src={item.imageUrl} alt="Product" className="h-8 w-8 object-contain rounded" />
                                            <button 
                                                onClick={() => handleItemChange(item.id, 'imageUrl', undefined)}
                                                className="absolute -top-1.5 -right-1.5 bg-white text-red-500 border border-gray-200 shadow-sm rounded-full p-0.5 hidden group-hover/img:block hover:bg-red-50"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 ml-auto">
                                            <span className="text-[10px] text-gray-400 font-bold">H:</span>
                                            <input 
                                                type="range" 
                                                min="50" 
                                                max="300" 
                                                step="10"
                                                value={item.imageHeight || 100}
                                                onChange={(e) => handleItemChange(item.id, 'imageHeight', Number(e.target.value))}
                                                className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                                                title="Image Height"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <div className="col-span-6 sm:col-span-3">
                             <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Qty</label>
                             <StyledInput 
                                type="number" 
                                min="0" 
                                value={item.qty} 
                                onChange={e => handleItemChange(item.id, 'qty', Number(e.target.value))}
                                onFocus={handleFocus}
                                className="text-center font-bold text-brand-700"
                             />
                        </div>
                        <div className="col-span-6 sm:col-span-3">
                             <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Unit</label>
                             <StyledInput value={item.unit} onChange={e => handleItemChange(item.id, 'unit', e.target.value)} className="text-center" />
                        </div>
                        <div className="col-span-6 sm:col-span-3">
                             <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Price</label>
                             <StyledInput 
                                type="number" 
                                min="0" 
                                value={item.pricePerUnit} 
                                onChange={e => handleItemChange(item.id, 'pricePerUnit', Number(e.target.value))}
                                onFocus={handleFocus}
                                className="text-right"
                             />
                        </div>
                        <div className="col-span-6 sm:col-span-3">
                             <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Discount</label>
                             <div className="flex -space-x-px">
                                 <input
                                     type="number"
                                     min="0"
                                     value={item.discountValue}
                                     onChange={e => handleItemChange(item.id, 'discountValue', Number(e.target.value))}
                                     onFocus={handleFocus}
                                     className="w-full min-w-0 border border-gray-300 rounded-l-lg px-2 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:z-10 bg-white text-right"
                                 />
                                 <button
                                     onClick={() => handleItemChange(item.id, 'discountType', item.discountType === 'amount' ? 'percent' : 'amount')}
                                     className="px-1 border border-gray-300 border-l-0 rounded-r-lg bg-gray-50 hover:bg-gray-100 text-gray-600 text-[10px] font-bold w-8 flex-shrink-0 flex items-center justify-center transition-colors"
                                     title="Switch % or Baht"
                                 >
                                     {item.discountType === 'percent' ? '%' : '฿'}
                                 </button>
                             </div>
                        </div>
                    </div>
                </div>
            ))}
            
            {items.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                    <div className="p-3 bg-white rounded-full mb-2 shadow-sm">
                        <CreditCard size={24} className="opacity-50" />
                    </div>
                    <span className="text-sm font-medium">ยังไม่มีรายการสินค้า</span>
                    <button onClick={addItem} className="text-brand-600 text-xs font-bold mt-2 hover:underline">เพิ่มรายการแรกเลย</button>
                </div>
            )}
        </div>
      </CollapsibleSection>

      {/* Remarks Section */}
      <CollapsibleSection 
        title="หมายเหตุ" 
        icon={FileText} 
        isOpen={activeSection === 'remarks'}
        onToggle={() => toggleSection('remarks')}
      >
        <InputGroup label="ข้อความหมายเหตุ">
            <StyledTextArea 
                rows={4} 
                value={document.remarks} 
                onChange={e => setDocument({...document, remarks: e.target.value})} 
                placeholder="เช่น หมายเหตุ : จัดส่งฟรี..."
            />
        </InputGroup>
      </CollapsibleSection>

      {/* Company Info */}
      <CollapsibleSection 
        title="ข้อมูลผู้ขาย" 
        icon={Building} 
        isOpen={activeSection === 'company'}
        onToggle={() => toggleSection('company')}
      >
        <div className="grid grid-cols-1 gap-4 text-sm">
             <InputGroup label="โลโก้บริษัท (Image Only)">
               <div className="flex flex-col gap-3">
                 {company.logoUrl && (
                    <div className="shrink-0 p-4 bg-white rounded-xl border border-gray-200 inline-block w-fit shadow-sm">
                      <img src={company.logoUrl} alt="Preview" className="h-12 object-contain" />
                    </div>
                 )}
                 <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-brand-200 border-dashed rounded-xl cursor-pointer bg-brand-50/30 hover:bg-brand-50 transition-all group">
                      <div className="flex flex-col items-center justify-center pt-2 pb-3">
                          <Upload className="w-6 h-6 text-brand-400 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-xs text-brand-700 font-bold">คลิกเพื่ออัพโหลดโลโก้</p>
                          <p className="text-[10px] text-brand-500 font-medium opacity-70">PNG, JPG (Max 800KB)</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </label>
               </div>
             </InputGroup>
             <InputGroup label="ชื่อบริษัท">
                <StyledInput value={company.name} onChange={e => setCompany({...company, name: e.target.value})} />
             </InputGroup>
             <InputGroup label="ที่อยู่ 1">
                <StyledInput value={company.addressLine1} onChange={e => setCompany({...company, addressLine1: e.target.value})} />
             </InputGroup>
             <InputGroup label="ที่อยู่ 2 / รายละเอียดติดต่อ">
                <StyledInput value={company.addressLine2} onChange={e => setCompany({...company, addressLine2: e.target.value})} />
             </InputGroup>
             <InputGroup label="ธนาคาร / สาขา">
                <StyledInput value={company.bankName} onChange={e => setCompany({...company, bankName: e.target.value})} />
             </InputGroup>
             <InputGroup label="เลขที่บัญชี">
                <StyledInput value={company.bankAccount} onChange={e => setCompany({...company, bankAccount: e.target.value})} className="font-mono" />
             </InputGroup>
        </div>
      </CollapsibleSection>

    </div>
  );
};