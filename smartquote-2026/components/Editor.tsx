
import React, { useState, useEffect, useRef } from 'react';
import { CompanyInfo, CustomerInfo, DocumentInfo, LineItem, FloatingImage } from '../types';
import { Plus, Trash2, Calendar, User, Building, CreditCard, Upload, Settings, LayoutTemplate, Image as ImageIcon, X, PenTool, CheckCircle2, Box, Tag, Lock, AlertTriangle, Search, Save, RefreshCw, Paperclip, MoreVertical, FileText } from 'lucide-react';

interface EditorProps {
  company: CompanyInfo;
  setCompany: (c: CompanyInfo) => void;
  customer: CustomerInfo;
  setCustomer: (c: CustomerInfo) => void;
  document: DocumentInfo;
  setDocument: (d: DocumentInfo) => void;
  items: LineItem[];
  setItems: (i: LineItem[]) => void;
  savedCustomers?: CustomerInfo[];
  onSaveCustomer?: (c: CustomerInfo) => void;
  onDeleteCustomer?: (name: string) => void;
  onClearAllCustomers?: () => void;
  onAddFloatingImage?: (img: FloatingImage) => void;
  floatingImages?: FloatingImage[];
  onRemoveFloatingImage?: (id: string) => void;
}

// --- Modern UI Components ---

const SectionCard: React.FC<{ 
    title: string; 
    icon: React.ElementType; 
    children: React.ReactNode; 
    rightAction?: React.ReactNode;
    isLocked?: boolean;
}> = ({ title, icon: Icon, children, rightAction, isLocked }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden transition-all hover:shadow-md">
        <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-100 flex justify-between items-center backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${isLocked ? 'bg-yellow-100 text-yellow-700' : 'bg-white shadow-sm border border-gray-100 text-brand-600'}`}>
                    <Icon size={16} />
                </div>
                <h3 className="font-bold text-gray-800 text-sm tracking-tight">{title}</h3>
                {isLocked && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">Locked</span>}
            </div>
            {rightAction}
        </div>
        <div className="p-5">
            {children}
        </div>
    </div>
);

const ModernInput: React.FC<{ label: string; icon?: React.ElementType } & React.InputHTMLAttributes<HTMLInputElement>> = ({ label, icon: Icon, className, ...props }) => (
    <div className="group">
        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 group-focus-within:text-brand-600 transition-colors">
            {label}
        </label>
        <div className="relative">
            {Icon && <Icon size={14} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-brand-500 transition-colors" />}
            <input 
                {...props}
                className={`w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 block p-2.5 transition-all placeholder-gray-300 font-medium disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${Icon ? 'pl-9' : ''} ${className}`}
            />
        </div>
    </div>
);

const ModernTextArea: React.FC<{ label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ label, className, ...props }) => (
    <div className="group">
        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 group-focus-within:text-brand-600 transition-colors">
            {label}
        </label>
        <textarea 
            {...props}
            className={`w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 block p-2.5 transition-all placeholder-gray-300 resize-none font-medium disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${className}`}
        />
    </div>
);

const ModernSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label?: React.ReactNode; size?: 'sm' | 'md' }> = ({ checked, onChange, label, size = 'md' }) => {
    const isSmall = size === 'sm';
    return (
    <label className="inline-flex items-center cursor-pointer group">
        <div className="relative">
            <input type="checkbox" className="sr-only peer" checked={checked} onChange={e => onChange(e.target.checked)} />
            <div className={`
                ${isSmall ? 'w-9 h-5' : 'w-11 h-6'} 
                bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-100 rounded-full peer 
                peer-checked:after:translate-x-full peer-checked:after:border-white 
                after:content-[''] after:absolute after:bg-white after:border-gray-300 after:border after:rounded-full after:transition-all 
                peer-checked:bg-brand-500
                ${isSmall ? 'after:top-[2px] after:left-[2px] after:h-4 after:w-4' : 'after:top-[2px] after:left-[2px] after:h-5 after:w-5'}
            `}></div>
        </div>
        {label && <span className={`ml-2 text-gray-600 group-hover:text-gray-900 transition-colors select-none ${isSmall ? 'text-[10px]' : 'text-xs font-bold'}`}>{label}</span>}
    </label>
    );
};


export const Editor: React.FC<EditorProps> = ({
  company, setCompany, customer, setCustomer, document, setDocument, items, setItems,
  savedCustomers = [], onSaveCustomer, onDeleteCustomer, onClearAllCustomers,
  onAddFloatingImage, floatingImages, onRemoveFloatingImage
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isGovernment = document.formType === 'government';
  const maxItems = isGovernment ? 5 : 4;
  const maxFloatingImages = 10;
  
  const filteredCustomers = savedCustomers.filter(c => 
     c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     c.contactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItem = () => {
    if (items.length >= maxItems) return;
    setItems([...items, {
      id: Date.now().toString(),
      partNumber: '', description: '', qty: 1, unit: 'ตัว', pricePerUnit: 0, imageHeight: 100
    }]);
  };

  const handleItemChange = (id: string, field: keyof LineItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleFloatingImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (floatingImages && floatingImages.length >= maxFloatingImages) {
        alert(`⚠️ จำกัดรูปภาพสูงสุด ${maxFloatingImages} รูป`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
    }
    const file = e.target.files?.[0];
    if (file && onAddFloatingImage) {
        if (file.size > 1.5 * 1024 * 1024) {
            alert("ขนาดไฟล์ใหญ่เกินไป (Max 1.5MB)");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            onAddFloatingImage({
                id: Date.now().toString(),
                url: reader.result as string,
                x: 50, y: 50, width: 150, height: 150
            });
        };
        reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="pb-32 animate-fade-in">
        
      {/* Mode Switcher */}
      <div className="mb-6 bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex">
          <button 
             type="button"
             onClick={() => setDocument({...document, formType: 'private'})}
             className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                 document.formType === 'private' 
                 ? 'bg-brand-50 text-brand-600 shadow-sm ring-1 ring-brand-200' 
                 : 'text-gray-500 hover:bg-gray-50'
             }`}
          >
              <LayoutTemplate size={16} /> เอกชน (Private)
          </button>
          <button 
             type="button"
             onClick={() => setDocument({...document, formType: 'government'})}
             className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                 document.formType === 'government' 
                 ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-200' 
                 : 'text-gray-500 hover:bg-gray-50'
             }`}
          >
              <Building size={16} /> ราชการ (Gov)
          </button>
      </div>

      {/* 1. Document Settings */}
      <SectionCard title="ตั้งค่าเอกสาร (Document)" icon={Calendar}>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                 <ModernInput label="เลขที่เอกสาร" value={document.docNumber} onChange={e => setDocument({...document, docNumber: e.target.value})} className="font-mono font-bold tracking-wide" />
              </div>
              <ModernInput type="date" label="วันที่" value={document.date} onChange={e => setDocument({...document, date: e.target.value})} />
              <ModernInput type="number" label="ยืนราคา (วัน)" value={document.validDays} onChange={e => setDocument({...document, validDays: Number(e.target.value)})} />
              
              {isGovernment && (
                <>
                  <ModernInput 
                    label="วันที่ส่งสินค้า (Delivery)" 
                    value={document.deliveryDate || ''} 
                    onChange={e => setDocument({...document, deliveryDate: e.target.value})} 
                    placeholder="Ex: ภายใน 15 วัน" 
                  />
                  <ModernInput 
                    label="เงื่อนไขการชำระเงิน (Term)" 
                    value={document.paymentTerms || ''} 
                    onChange={e => setDocument({...document, paymentTerms: e.target.value})} 
                    placeholder="Ex: เครดิต 30 วัน"
                  />
                </>
              )}

              <div className="col-span-2">
                <ModernInput label="พนักงานขาย (Prepared By)" icon={User} value={document.preparedBy} onChange={e => setDocument({...document, preparedBy: e.target.value})} />
              </div>
              
              {/* Authorized Signer Inputs - Restored/Verified */}
              <ModernInput 
                label="ผู้มีอำนาจลงนาม (Signer)" 
                icon={PenTool} 
                value={document.signerName || ''} 
                onChange={e => setDocument({...document, signerName: e.target.value})} 
                placeholder="ชื่อ-สกุล ผู้เซ็นอนุมัติ"
              />
              <ModernInput 
                label="ตำแหน่ง (Position)" 
                value={document.signerPosition || ''} 
                onChange={e => setDocument({...document, signerPosition: e.target.value})} 
                placeholder="ตำแหน่ง (เช่น ผู้จัดการสาขา)"
              />
              
              {/* Remarks Input */}
              <div className="col-span-2">
                  <ModernTextArea 
                      label="หมายเหตุ (Remarks)" 
                      value={document.remarks} 
                      onChange={e => setDocument({...document, remarks: e.target.value})} 
                      rows={3} 
                      className="font-mono text-xs"
                  />
              </div>
          </div>
          
          {/* VAT Toggle Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                   <ModernSwitch 
                      checked={document.vatEnabled} 
                      onChange={c => setDocument({...document, vatEnabled: c})} 
                      label={`เปิดใช้งาน VAT ${document.vatRate}%`}
                   />
              </div>
              {document.vatEnabled && (
                  <div className="pl-2 border-l-2 border-brand-200">
                      <ModernSwitch 
                          checked={document.priceIncludeVat} 
                          onChange={c => setDocument({...document, priceIncludeVat: c})} 
                          label="ราคารวม VAT (Include)"
                          size="sm"
                      />
                  </div>
              )}
          </div>
      </SectionCard>

      {/* 2. Customer Info */}
      <SectionCard title="ข้อมูลลูกค้า (Customer)" icon={User} rightAction={
          <button type="button" onClick={() => setCustomer({ companyName: "", contactName: "", address: "", phone: "", taxId: "" })} className="text-[10px] text-gray-400 hover:text-red-500 flex items-center gap-1"><RefreshCw size={10}/> ล้างค่า</button>
      }>
          {/* Search Bar */}
          <div className="relative mb-4">
              <input 
                  type="text"
                  placeholder="🔍 ค้นหาลูกค้าเดิม (Address Book)..."
                  className="w-full pl-3 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setShowSearchResults(true); }}
                  onFocus={() => setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              />
              {showSearchResults && (searchTerm || filteredCustomers.length > 0) && (
                  <div className="absolute z-50 w-full bg-white mt-1 border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      {filteredCustomers.map((cust, idx) => (
                          <div key={idx} className="px-3 py-2 hover:bg-gray-50 flex justify-between items-center border-b border-gray-50 last:border-none group cursor-pointer"
                               onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking row
                               onClick={() => { setCustomer(cust); setShowSearchResults(false); setSearchTerm(''); }}
                          >
                              <div>
                                  <div className="text-sm font-bold text-gray-800">{cust.companyName}</div>
                                  <div className="text-xs text-gray-500">{cust.contactName}</div>
                              </div>
                              <button 
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()} // Prevent blur
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if(confirm('ลบลูกค้ารายนี้?')) onDeleteCustomer?.(cust.companyName); 
                                  }}
                                  className="text-gray-300 hover:text-red-500 p-1.5"
                              >
                                  <Trash2 size={14} />
                              </button>
                          </div>
                      ))}
                      {onClearAllCustomers && (
                          <button 
                            type="button"
                            onMouseDown={(e) => e.preventDefault()} // Prevent blur
                            onClick={() => { if(confirm('ลบทั้งหมด?')) onClearAllCustomers(); }} 
                            className="w-full text-center text-xs text-red-500 py-2 font-bold hover:bg-red-50 border-t border-gray-100"
                          >
                              ล้างทั้งหมด
                          </button>
                      )}
                  </div>
              )}
          </div>

          <div className="space-y-3">
              <ModernInput label="ชื่อบริษัท/หน่วยงาน" value={customer.companyName} onChange={e => setCustomer({...customer, companyName: e.target.value})} />
              <ModernInput label="ผู้ติดต่อ" value={customer.contactName} onChange={e => setCustomer({...customer, contactName: e.target.value})} />
              <ModernTextArea label="ที่อยู่" rows={2} value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                  <ModernInput label="เบอร์โทร" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
                  <ModernInput label="เลขผู้เสียภาษี" value={customer.taxId || ''} onChange={e => setCustomer({...customer, taxId: e.target.value})} />
              </div>
              {onSaveCustomer && (
                  <button type="button" onClick={() => onSaveCustomer(customer)} className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg transition-colors flex justify-center gap-2">
                      <Save size={14} /> บันทึกข้อมูลลูกค้าลงสมุด
                  </button>
              )}
          </div>
      </SectionCard>

      {/* 3. Items */}
      <SectionCard title={`รายการสินค้า (${items.length}/${maxItems})`} icon={Box} rightAction={
           <button type="button" onClick={addItem} disabled={items.length >= maxItems} className={`text-xs font-bold px-2 py-1 rounded transition-colors ${items.length >= maxItems ? 'text-gray-300' : 'text-brand-600 bg-brand-50 hover:bg-brand-100'}`}>+ เพิ่มรายการ</button>
      }>
          <div className="space-y-4">
              {items.map((item, index) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 relative hover:border-brand-200 transition-colors shadow-sm">
                      <div className="absolute -left-3 top-4 bg-gray-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">#{index+1}</div>
                      <button type="button" onClick={() => { const n = items.filter(i => i.id !== item.id); setItems(n); }} className="absolute top-2 right-2 text-gray-300 hover:text-red-500"><X size={16}/></button>
                      
                      <ModernTextArea 
                         label="รายละเอียดสินค้า" 
                         value={item.description} 
                         onChange={e => handleItemChange(item.id, 'description', e.target.value)} 
                         maxLength={700}
                         rows={2}
                         className={item.description.length >= 700 ? 'border-red-300 bg-red-50' : ''}
                      />
                      <div className="flex justify-end text-[9px] text-gray-400 mb-2">{item.description.length}/700</div>

                      <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-3"><ModernInput type="number" label="จำนวน" value={item.qty} onChange={e => handleItemChange(item.id, 'qty', Number(e.target.value))} className="text-center" /></div>
                          <div className="col-span-4"><ModernInput label="หน่วย" value={item.unit} onChange={e => handleItemChange(item.id, 'unit', e.target.value)} className="text-center" /></div>
                          <div className="col-span-5"><ModernInput type="number" label="ราคา/หน่วย" value={item.pricePerUnit} onChange={e => handleItemChange(item.id, 'pricePerUnit', Number(e.target.value))} className="text-right" /></div>
                      </div>
                  </div>
              ))}
              {items.length === 0 && <div className="text-center text-gray-400 text-sm py-8 border-2 border-dashed border-gray-100 rounded-lg">ยังไม่มีรายการสินค้า</div>}
          </div>
      </SectionCard>

      {/* 4. Floating Images (THE FIX) */}
      <SectionCard title="รูปภาพอิสระ (Floating Images)" icon={ImageIcon} rightAction={<span className="text-[10px] text-gray-400">{floatingImages?.length || 0}/{maxFloatingImages}</span>}>
          
          {/* Upload Zone */}
          <div className="relative group border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all p-4 text-center cursor-pointer mb-4">
               <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  onChange={handleFloatingImageUpload}
                  disabled={(floatingImages?.length || 0) >= maxFloatingImages}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
               />
               <Upload size={20} className="mx-auto text-gray-400 group-hover:text-blue-500 mb-2" />
               <p className="text-xs font-bold text-gray-600 group-hover:text-blue-600">
                   {(floatingImages?.length || 0) >= maxFloatingImages ? 'ครบจำนวนที่กำหนดแล้ว' : 'คลิกเพื่ออัปโหลดรูปภาพ'}
               </p>
               <p className="text-[10px] text-gray-400">ลากวางได้ • Max 1.5MB</p>
          </div>

          {/* Gallery Grid - With ROBUST Delete Buttons */}
          {(floatingImages || []).length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                  {floatingImages!.map((img, idx) => (
                      <div key={img.id} className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
                          {/* Image Preview */}
                          <div className="aspect-square bg-gray-50 rounded border border-gray-100 mb-2 flex items-center justify-center overflow-hidden relative">
                              <img src={img.url} className="w-full h-full object-contain" alt="thumb" />
                              <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[9px] px-1.5 rounded">#{idx+1}</span>
                          </div>
                          
                          {/* Dedicated Action Button Row */}
                          <button 
                              type="button"
                              onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if(confirm('ลบรูปภาพนี้?')) onRemoveFloatingImage?.(img.id);
                              }}
                              className="w-full bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold py-1.5 rounded transition-colors flex items-center justify-center gap-1.5 border border-red-100 cursor-pointer"
                          >
                              <Trash2 size={12} /> ลบรูปภาพ
                          </button>
                      </div>
                  ))}
              </div>
          )}
      </SectionCard>

      {/* 5. Company Info (Locked) */}
      <SectionCard title="ข้อมูลผู้ขาย (Seller)" icon={Building} isLocked>
          <ModernInput label="ชื่อบริษัท" value={company.name} readOnly className="bg-gray-100 text-gray-500 cursor-not-allowed" />
          <div className="mt-3 bg-brand-50 p-3 rounded-lg border border-brand-100">
              <div className="text-[10px] font-bold text-brand-700 mb-2 uppercase flex items-center gap-1"><CreditCard size={10}/> ข้อมูลธนาคาร (แก้ไขได้)</div>
              <div className="space-y-2">
                 <ModernInput label="ธนาคาร" value={company.bankName} onChange={e => setCompany({...company, bankName: e.target.value})} className="bg-white" />
                 <div className="grid grid-cols-2 gap-2">
                     <ModernInput label="เลขที่บัญชี" value={company.bankAccount} onChange={e => setCompany({...company, bankAccount: e.target.value})} className="bg-white" />
                     <ModernInput label="สาขา" value={company.bankBranch} onChange={e => setCompany({...company, bankBranch: e.target.value})} className="bg-white" />
                 </div>
              </div>
          </div>
      </SectionCard>

    </div>
  );
};
