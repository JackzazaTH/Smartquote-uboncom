
import React, { useState } from 'react';
import { CompanyInfo, CustomerInfo, DocumentInfo, LineItem } from '../types';
import { Plus, Trash2, Calendar, User, Building, CreditCard, Upload, FileText, ChevronDown, Settings, LayoutTemplate, Image as ImageIcon, X, PenTool, CheckCircle2, Box, Tag, Lock } from 'lucide-react';

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

const InputGroup: React.FC<{ label: string; icon?: React.ElementType; children: React.ReactNode }> = ({ label, icon: Icon, children }) => (
  <div className="mb-4 relative">
    <div className="flex items-center gap-1.5 mb-1.5">
        <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
          {Icon && <Icon size={12} className="text-brand-500" />}
          {label}
        </label>
    </div>
    {children}
  </div>
);

const StyledInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder-gray-400 bg-white shadow-sm hover:border-gray-400 ${props.className || ''}`}
  />
);

const StyledTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className={`w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder-gray-400 bg-white shadow-sm resize-none hover:border-gray-400 ${props.className || ''}`}
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
  <div className={`bg-white rounded-xl shadow-sm border transition-all duration-300 overflow-hidden ${isOpen ? 'border-brand-200 ring-1 ring-brand-100 shadow-md' : 'border-gray-200 hover:border-brand-200 hover:shadow-sm'}`}>
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between p-4 text-left transition-all duration-300 ${
        isOpen ? 'bg-gradient-to-r from-brand-50/80 to-white' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl transition-all duration-300 shadow-sm ${
          isOpen ? 'bg-brand-500 text-white shadow-brand-200 rotate-3 scale-110' : 'bg-white text-gray-500 border border-gray-100 group-hover:border-brand-200'
        }`}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <span className={`font-bold text-base tracking-tight transition-colors ${
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
    if (items.length >= 5) {
      alert("⚠️ คำเตือน: รายการสินค้าครบจำนวนที่กำหนดแล้ว (5 รายการ)\n\nเพื่อให้เอกสารสวยงามและพอดีกับ 1 หน้ากระดาษ A4 ระบบจึงจำกัดจำนวนรายการไว้เท่านี้");
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
    <div className="space-y-4 pb-24">
      
      {/* Sticky Form Type Selector */}
      <div className="sticky top-[76px] z-30 -mx-4 px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-gray-200/80 shadow-sm mb-6 transition-all">
        <div className="bg-gray-100 p-1.5 rounded-xl flex gap-1 shadow-inner border border-gray-200">
            <button 
                onClick={() => setDocument({...document, formType: 'private'})}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all duration-300 ${
                    document.formType === 'private' 
                    ? 'bg-white text-brand-600 shadow-sm ring-1 ring-black/5 transform scale-[1.02]' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
            >
                <LayoutTemplate size={16} className={document.formType === 'private' ? 'text-brand-500' : 'text-gray-400'} />
                <span>แบบเอกชน</span>
            </button>
            <button 
                onClick={() => setDocument({...document, formType: 'government'})}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all duration-300 ${
                    document.formType === 'government' 
                    ? 'bg-white text-black shadow-sm ring-1 ring-black/5 transform scale-[1.02]' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
            >
                <Building size={16} className={document.formType === 'government' ? 'text-black' : 'text-gray-400'} />
                <span>แบบราชการ</span>
            </button>
        </div>
      </div>

      {/* Document Settings */}
      <CollapsibleSection 
        title="ตั้งค่าเอกสาร" 
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
                      className={`text-xs flex items-center gap-1 font-medium px-2 py-1 rounded-md transition-colors ${
                          showDocSettings ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                   >
                       <Settings size={12} /> ตั้งค่าเลขรัน
                   </button>
               </div>
               <div className="relative">
                   <StyledInput value={document.docNumber} onChange={e => setDocument({...document, docNumber: e.target.value})} className="font-mono tracking-wide font-bold text-gray-800" />
               </div>
               
               {/* Advanced Doc Number Settings Panel */}
               {showDocSettings && (
                   <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-3 shadow-inner animate-in fade-in slide-in-from-top-2">
                       <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                           <input 
                              type="checkbox" 
                              checked={document.docConfig.autoGen}
                              onChange={e => setDocument({...document, docConfig: {...document.docConfig, autoGen: e.target.checked}})}
                              id="autoGen"
                              className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 border-gray-300"
                           />
                           <label htmlFor="autoGen" className="font-bold text-gray-700">เปิดใช้งานรันเลขอัตโนมัติ</label>
                       </div>
                       
                       {document.docConfig.autoGen && (
                           <div className="grid grid-cols-2 gap-3">
                               <div>
                                   <label className="block text-gray-500 mb-1 font-bold">Prefix</label>
                                   <input className="w-full border rounded-lg p-2 bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none" value={document.docConfig.prefix} onChange={e => setDocument({...document, docConfig: {...document.docConfig, prefix: e.target.value}})} />
                               </div>
                               <div>
                                   <label className="block text-gray-500 mb-1 font-bold">Date Format</label>
                                   <select className="w-full border rounded-lg p-2 bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none" value={document.docConfig.dateFormat} onChange={e => setDocument({...document, docConfig: {...document.docConfig, dateFormat: e.target.value as any}})}>
                                       <option value="YYYYMM">YYYYMM (202402)</option>
                                       <option value="YYMM">YYMM (2402)</option>
                                       <option value="YYYY">YYYY (2024)</option>
                                       <option value="NONE">None</option>
                                   </select>
                               </div>
                               <div>
                                   <label className="block text-gray-500 mb-1 font-bold">Run Number</label>
                                   <input type="number" className="w-full border rounded-lg p-2 bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none" value={document.docConfig.runNumber} onChange={e => setDocument({...document, docConfig: {...document.docConfig, runNumber: Number(e.target.value)}})} />
                               </div>
                               <div>
                                   <label className="block text-gray-500 mb-1 font-bold">Options</label>
                                   <div className="flex items-center gap-2 mt-2">
                                       <input type="checkbox" checked={document.docConfig.thaiYear} onChange={e => setDocument({...document, docConfig: {...document.docConfig, thaiYear: e.target.checked}})} className="rounded text-brand-600 focus:ring-brand-500" />
                                       <span>ใช้ พ.ศ.</span>
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
           
           <InputGroup label="วันส่งสินค้า">
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
                        <div className="p-1.5 bg-brand-100 rounded text-brand-600"><Tag size={14}/></div>
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
                            className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center font-bold focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 bg-white"
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
                        <label htmlFor="priceIncludeVat" className="text-sm text-gray-700 select-none font-medium cursor-pointer">
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
        title="ลงนามอนุมัติ"
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
             <InputGroup label="ชื่อบริษัท / หน่วยงาน">
                <StyledInput value={customer.companyName} onChange={e => setCustomer({...customer, companyName: e.target.value})} placeholder="ระบุชื่อบริษัท" />
             </InputGroup>
             <InputGroup label="ชื่อผู้ติดต่อ (เรียน...)">
                <StyledInput value={customer.contactName} onChange={e => setCustomer({...customer, contactName: e.target.value})} placeholder="ระบุชื่อผู้ติดต่อ" />
             </InputGroup>
             <InputGroup label="ที่อยู่">
                <StyledTextArea rows={2} value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} />
             </InputGroup>
             <div className="grid grid-cols-2 gap-4">
                <InputGroup label="เบอร์โทร">
                    <StyledInput value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
                </InputGroup>
                <InputGroup label="เลขภาษี">
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
                disabled={items.length >= 5}
                className={`w-full py-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 font-bold transition-all mb-4 group ${
                  items.length >= 5 
                    ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed' 
                    : 'bg-brand-50/30 text-brand-600 border-brand-200 hover:bg-brand-50 hover:border-brand-500 hover:shadow-md'
                }`}
            >
                <div className={`p-1.5 rounded-full transition-transform group-hover:scale-110 ${items.length >= 5 ? 'bg-gray-200' : 'bg-brand-100 text-brand-600'}`}>
                    <Plus size={20} /> 
                </div>
                <span className="text-sm">{items.length >= 5 ? 'ครบจำนวน 5 รายการแล้ว' : 'เพิ่มรายการใหม่'}</span>
            </button>
            
            {items.length >= 5 && (
                <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 text-xs rounded-lg mb-4 border border-red-100 animate-in fade-in">
                    <div className="shrink-0 mt-0.5"><CheckCircle2 size={14} className="rotate-180" /></div>
                    <span className="font-medium">จำกัด 5 รายการ เพื่อให้พอดีกับหน้า A4 หากต้องการเพิ่ม กรุณาลบรายการเดิมออก</span>
                </div>
            )}

            <div className="space-y-4">
            {items.map((item, index) => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group">
                    {/* Header Row */}
                    <div className="flex justify-between items-center p-3 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                             <span className="bg-white border border-gray-200 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                                #{index + 1}
                             </span>
                             <span className="text-xs font-bold text-gray-600">สินค้าที่ {index + 1}</span>
                        </div>
                        <button 
                            onClick={() => removeItem(item.id)} 
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-all"
                            title="Remove Item"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                    
                    <div className="p-4 space-y-4">
                        {/* Part 1: Description & Code */}
                        <div>
                            <InputGroup label="รหัสสินค้า (Part No.)">
                                <StyledInput 
                                    value={item.partNumber} 
                                    onChange={e => handleItemChange(item.id, 'partNumber', e.target.value)} 
                                    placeholder="เช่น NB-001" 
                                    className="font-mono text-xs bg-gray-50/50 focus:bg-white" 
                                />
                            </InputGroup>

                            <InputGroup label="รายละเอียด (Description)">
                                <div className="relative">
                                    <StyledTextArea 
                                        rows={3}
                                        maxLength={100}
                                        value={item.description} 
                                        onChange={e => handleItemChange(item.id, 'description', e.target.value)} 
                                        placeholder="ชื่อสินค้า และรายละเอียด..."
                                        className={item.description.length >= 100 ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}
                                    />
                                    <div className={`absolute bottom-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm border shadow-sm transition-colors ${
                                        item.description.length >= 100 
                                        ? 'text-red-600 bg-red-50 border-red-200' 
                                        : 'text-gray-400 bg-white/80 border-gray-100'
                                    }`}>
                                        {item.description.length}/100
                                    </div>
                                </div>
                            </InputGroup>
                        </div>

                        {/* Part 2: Pricing Grid, Discount & Image */}
                        <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100/80 grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                                <InputGroup label="จำนวน" icon={Box}>
                                    <StyledInput 
                                        type="number" 
                                        min="0" 
                                        value={item.qty} 
                                        onChange={e => handleItemChange(item.id, 'qty', Number(e.target.value))}
                                        onFocus={handleFocus}
                                        className="text-center font-bold text-brand-700 bg-white"
                                    />
                                </InputGroup>
                            </div>
                            <div className="col-span-4">
                                <InputGroup label="หน่วยนับ">
                                    <StyledInput 
                                        value={item.unit} 
                                        onChange={e => handleItemChange(item.id, 'unit', e.target.value)} 
                                        className="text-center bg-white" 
                                    />
                                </InputGroup>
                            </div>
                            <div className="col-span-4">
                                <InputGroup label="ราคา/หน่วย" icon={Tag}>
                                    <StyledInput 
                                        type="number" 
                                        min="0" 
                                        value={item.pricePerUnit} 
                                        onChange={e => handleItemChange(item.id, 'pricePerUnit', Number(e.target.value))}
                                        onFocus={handleFocus}
                                        className="text-right font-medium bg-white"
                                    />
                                </InputGroup>
                            </div>

                            <div className="col-span-5">
                                <InputGroup label="ส่วนลด" icon={Tag}>
                                    <div className="flex shadow-sm rounded-lg">
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.discountValue}
                                            onChange={e => handleItemChange(item.id, 'discountValue', Number(e.target.value))}
                                            onFocus={handleFocus}
                                            className="w-full border border-gray-300 border-r-0 rounded-l-lg px-3 py-2.5 text-sm text-right font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                                        />
                                        <button
                                            onClick={() => handleItemChange(item.id, 'discountType', item.discountType === 'amount' ? 'percent' : 'amount')}
                                            className="px-2 bg-gray-50 border border-gray-300 border-l-0 rounded-r-lg text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors min-w-[40px]"
                                            title="คลิกเพื่อเปลี่ยนหน่วย (Click to toggle)"
                                        >
                                            {item.discountType === 'percent' ? '%' : '฿'}
                                        </button>
                                    </div>
                                </InputGroup>
                            </div>

                            <div className="col-span-7">
                                <InputGroup label="รูปสินค้า (Image)" icon={ImageIcon}>
                                   {!item.imageUrl ? (
                                      <label className="flex flex-col items-center justify-center w-full h-[42px] border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-brand-500 transition-colors">
                                          <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                                              <Upload size={14} /> <span>เลือกรูป</span>
                                          </div>
                                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleProductImageUpload(item.id, e)} />
                                      </label>
                                   ) : (
                                      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 h-[42px]">
                                          <div className="relative group/preview h-full aspect-square">
                                             <img src={item.imageUrl} className="h-full w-full object-cover rounded cursor-pointer border border-gray-100" onClick={() => window.open(item.imageUrl)} />
                                          </div>
                                          <div className="flex-1 flex flex-col justify-center min-w-0">
                                              <div className="flex items-center justify-between">
                                                 <span className="text-[9px] text-gray-500 font-medium truncate">ขนาด: {item.imageHeight || 100}px</span>
                                              </div>
                                              <input 
                                                  type="range" 
                                                  min="50" max="200" step="10"
                                                  value={item.imageHeight || 100}
                                                  onChange={(e) => handleItemChange(item.id, 'imageHeight', Number(e.target.value))}
                                                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                                              />
                                          </div>
                                          <button onClick={() => handleItemChange(item.id, 'imageUrl', undefined)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                                              <Trash2 size={14} />
                                          </button>
                                      </div>
                                   )}
                                </InputGroup>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            </div>
            
            {items.length === 0 && (
                <div className="text-center py-12 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 group cursor-pointer hover:bg-gray-50 hover:border-brand-200 transition-all" onClick={addItem}>
                    <div className="p-4 bg-white rounded-full mb-3 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all">
                        <Plus size={24} className="opacity-50 group-hover:text-brand-500 group-hover:opacity-100" />
                    </div>
                    <span className="text-sm font-medium group-hover:text-gray-600">ยังไม่มีรายการสินค้า</span>
                    <span className="text-xs text-brand-500 font-bold mt-1 group-hover:underline">คลิกเพื่อเพิ่มรายการแรก</span>
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
                placeholder="เช่น หมายเหตุ : ราคานี้ยืนยัน 30 วัน..."
            />
        </InputGroup>
      </CollapsibleSection>

      {/* Company Info */}
      <CollapsibleSection 
        title="ข้อมูลผู้ขาย (Company Info)" 
        icon={Building} 
        isOpen={activeSection === 'company'}
        onToggle={() => toggleSection('company')}
      >
        <div className="grid grid-cols-1 gap-4 text-sm">
             <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-xs text-yellow-700 font-medium flex items-center gap-2 mb-2">
                <Lock size={14} />
                <span>ข้อมูลที่อยู่บริษัทและโลโก้ถูกล็อคไว้ (สามารถแก้ไขข้อมูลธนาคารได้)</span>
             </div>

             <InputGroup label="โลโก้บริษัท">
                 {company.logoUrl && (
                    <div className="shrink-0 p-4 bg-gray-50 rounded-xl border border-gray-200 inline-block w-fit shadow-sm opacity-80 pointer-events-none select-none">
                      <img src={company.logoUrl} alt="Preview" className="h-12 object-contain grayscale-[0.2]" />
                    </div>
                 )}
             </InputGroup>
             <InputGroup label="ชื่อบริษัท">
                <StyledInput value={company.name} readOnly className="bg-gray-100 text-gray-500 cursor-not-allowed" />
             </InputGroup>
             <InputGroup label="ที่อยู่ 1">
                <StyledInput value={company.addressLine1} readOnly className="bg-gray-100 text-gray-500 cursor-not-allowed" />
             </InputGroup>
             <InputGroup label="ที่อยู่ 2 / รายละเอียดติดต่อ">
                <StyledInput value={company.addressLine2} readOnly className="bg-gray-100 text-gray-500 cursor-not-allowed" />
             </InputGroup>
             
             {/* Editable Bank Info */}
             <div className="p-4 bg-brand-50/30 rounded-xl border border-brand-100 space-y-4">
                 <div className="text-xs font-bold text-brand-700 flex items-center gap-1.5 border-b border-brand-200 pb-2 mb-2">
                    <PenTool size={12} /> แก้ไขข้อมูลการชำระเงิน
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                     <InputGroup label="ธนาคาร">
                        <StyledInput 
                            value={company.bankName || ''} 
                            onChange={e => setCompany({...company, bankName: e.target.value})} 
                            placeholder="ระบุชื่อธนาคาร"
                        />
                     </InputGroup>
                     <InputGroup label="สาขา">
                        <StyledInput 
                            value={company.bankBranch || ''} 
                            onChange={e => setCompany({...company, bankBranch: e.target.value})} 
                            placeholder="ระบุสาขา"
                        />
                     </InputGroup>
                 </div>
                 <InputGroup label="เลขที่บัญชี">
                    <StyledInput 
                        value={company.bankAccount || ''} 
                        onChange={e => setCompany({...company, bankAccount: e.target.value})} 
                        className="font-mono text-brand-700 font-bold"
                        placeholder="xxx-x-xxxxx-x"
                    />
                 </InputGroup>
             </div>
        </div>
      </CollapsibleSection>

    </div>
  );
};
