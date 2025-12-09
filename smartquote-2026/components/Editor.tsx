import React, { useState, useEffect, useRef } from 'react';
import { CompanyInfo, CustomerInfo, DocumentInfo, LineItem, FloatingImage } from '../types';
import { Plus, Trash2, Calendar, User, Building, CreditCard, Upload, Image as ImageIcon, X, PenTool, Search, Save, RefreshCw, Box, Tag, Layers, FileText, Lock } from 'lucide-react';

interface EditorProps {
  activeTab: 'doc' | 'items' | 'images';
  setActiveTab: (t: 'doc' | 'items' | 'images') => void;
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

// --- Modern Filled Input Components ---

const FilledInput: React.FC<{ label?: string; icon?: React.ElementType } & React.InputHTMLAttributes<HTMLInputElement>> = ({ label, icon: Icon, className, ...props }) => (
    <div className="w-full">
        {label && <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">{label}</label>}
        <div className="relative">
            {Icon && <Icon size={16} className="absolute left-3.5 top-3 text-slate-400" />}
            <input 
                {...props}
                className={`w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border-0 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-brand-100 focus:shadow-sm block py-2.5 transition-all placeholder-slate-300 font-medium ${Icon ? 'pl-10 pr-3' : 'px-3'} ${className}`}
            />
        </div>
    </div>
);

const FilledTextArea: React.FC<{ label?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ label, className, ...props }) => (
    <div className="w-full">
        {label && <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">{label}</label>}
        <textarea 
            {...props}
            className={`w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border-0 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-brand-100 focus:shadow-sm block p-3 transition-all placeholder-slate-300 font-medium resize-none ${className}`}
        />
    </div>
);

const ModernSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label?: React.ReactNode; size?: 'sm' | 'md' }> = ({ checked, onChange, label, size = 'md' }) => {
    const isSmall = size === 'sm';
    return (
    <label className="inline-flex items-center cursor-pointer group select-none">
        <div className="relative">
            <input type="checkbox" className="sr-only peer" checked={checked} onChange={e => onChange(e.target.checked)} />
            <div className={`
                ${isSmall ? 'w-8 h-5' : 'w-10 h-6'} 
                bg-slate-200 peer-focus:outline-none rounded-full peer 
                peer-checked:after:translate-x-full peer-checked:after:border-white 
                after:content-[''] after:absolute after:bg-white after:shadow-sm after:rounded-full after:transition-all 
                peer-checked:bg-brand-500
                ${isSmall ? 'after:top-[2px] after:left-[2px] after:h-4 after:w-4' : 'after:top-[2px] after:left-[2px] after:h-5 after:w-5'}
            `}></div>
        </div>
        {label && <span className={`ml-3 text-slate-600 font-medium group-hover:text-slate-900 transition-colors ${isSmall ? 'text-xs' : 'text-sm'}`}>{label}</span>}
    </label>
    );
};

export const Editor: React.FC<EditorProps> = ({
  activeTab, setActiveTab,
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
        alert(`⚠️ Limit ${maxFloatingImages} images reached.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
    }
    const file = e.target.files?.[0];
    if (file && onAddFloatingImage) {
        if (file.size > 1.5 * 1024 * 1024) {
            alert("File too large (Max 1.5MB)");
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
    <div className="relative">
      
      {/* Sticky Tab Nav */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          {[
              { id: 'doc', label: 'Document', icon: FileText },
              { id: 'items', label: 'Items', icon: Box },
              { id: 'images', label: 'Images', icon: ImageIcon },
          ].map(tab => (
              <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                      activeTab === tab.id 
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                  <tab.icon size={16} /> {tab.label}
              </button>
          ))}
      </div>

      <div className="p-6 pb-24 space-y-8">

      {/* --- TAB: DOCUMENT --- */}
      {activeTab === 'doc' && (
        <div className="animate-fade-in space-y-8">
            {/* Document Info Block */}
            <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-4">Document Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                       <FilledInput label="Document No" value={document.docNumber} onChange={e => setDocument({...document, docNumber: e.target.value})} className="font-mono font-bold tracking-tight text-brand-600" />
                    </div>
                    <FilledInput type="date" label="Date" value={document.date} onChange={e => setDocument({...document, date: e.target.value})} />
                    <FilledInput type="number" label="Valid Days" value={document.validDays} onChange={e => setDocument({...document, validDays: Number(e.target.value)})} />
                    
                    {isGovernment && (
                        <>
                        <FilledInput label="Delivery Date" value={document.deliveryDate || ''} onChange={e => setDocument({...document, deliveryDate: e.target.value})} placeholder="Ex: ภายใน 15 วัน" />
                        <FilledInput label="Payment Terms" value={document.paymentTerms || ''} onChange={e => setDocument({...document, paymentTerms: e.target.value})} placeholder="Ex: เครดิต 30 วัน" />
                        </>
                    )}
                    <div className="col-span-2">
                        <FilledInput label="Salesperson" icon={User} value={document.preparedBy} onChange={e => setDocument({...document, preparedBy: e.target.value})} />
                    </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Signature Settings</h4>
                    <div className="grid grid-cols-2 gap-3">
                         <FilledInput label="Signer Name" value={document.signerName || ''} onChange={e => setDocument({...document, signerName: e.target.value})} placeholder="Name" className="bg-white" />
                         <FilledInput label="Position" value={document.signerPosition || ''} onChange={e => setDocument({...document, signerPosition: e.target.value})} placeholder="Role" className="bg-white" />
                    </div>
                </div>

                <FilledTextArea label="Remarks" rows={3} value={document.remarks} onChange={e => setDocument({...document, remarks: e.target.value})} className="font-mono text-xs" />
            </div>
            
            <hr className="border-dashed border-slate-200" />

            {/* VAT Config */}
            <div>
                 <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-4">Tax Configuration</h3>
                 <div className="flex flex-col gap-3">
                    <ModernSwitch checked={document.vatEnabled} onChange={c => setDocument({...document, vatEnabled: c})} label={`Enable VAT ${document.vatRate}%`} />
                    {document.vatEnabled && <div className="ml-6"><ModernSwitch checked={document.priceIncludeVat} onChange={c => setDocument({...document, priceIncludeVat: c})} label="Prices Include VAT" size="sm" /></div>}
                 </div>
            </div>

            <hr className="border-dashed border-slate-200" />

            {/* Customer Info Block */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">Customer Info</h3>
                    <button type="button" onClick={() => setCustomer({ companyName: "", contactName: "", address: "", phone: "", taxId: "" })} className="text-[10px] text-red-400 hover:text-red-500 font-bold flex items-center gap-1"><RefreshCw size={10}/> CLEAR</button>
                </div>
                
                {/* Search Bar */}
                <div className="relative mb-5">
                    <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                        <input 
                            type="text"
                            placeholder="Search Address Book..."
                            className="w-full pl-10 pr-3 py-2.5 bg-white border-2 border-slate-100 rounded-xl text-sm focus:border-brand-500 focus:ring-0 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setShowSearchResults(true); }}
                            onFocus={() => setShowSearchResults(true)}
                            onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                        />
                    </div>
                    {showSearchResults && (searchTerm || filteredCustomers.length > 0) && (
                        <div className="absolute z-50 w-full bg-white mt-2 border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-1">
                            {filteredCustomers.map((cust, idx) => (
                                <div key={idx} className="px-3 py-2.5 hover:bg-slate-50 rounded-xl flex justify-between items-center group cursor-pointer transition-colors"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => { setCustomer(cust); setShowSearchResults(false); setSearchTerm(''); }}
                                >
                                    <div>
                                        <div className="text-sm font-bold text-slate-800">{cust.companyName}</div>
                                        <div className="text-xs text-slate-400">{cust.contactName}</div>
                                    </div>
                                    <button 
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={(e) => { e.stopPropagation(); if(confirm('Delete customer?')) onDeleteCustomer?.(cust.companyName); }}
                                        className="text-slate-200 hover:text-red-500 p-2"
                                    ><Trash2 size={14} /></button>
                                </div>
                            ))}
                            {onClearAllCustomers && <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { if(confirm('Clear all?')) onClearAllCustomers(); }} className="w-full text-center text-xs text-red-500 py-2.5 font-bold hover:bg-red-50 rounded-xl mt-1">Clear Database</button>}
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <FilledInput label="Company Name" value={customer.companyName} onChange={e => setCustomer({...customer, companyName: e.target.value})} />
                    <FilledInput label="Contact Name" value={customer.contactName} onChange={e => setCustomer({...customer, contactName: e.target.value})} />
                    <FilledTextArea label="Address" rows={2} value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} />
                    <div className="grid grid-cols-2 gap-3">
                        <FilledInput label="Phone" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
                        <FilledInput label="Tax ID" value={customer.taxId || ''} onChange={e => setCustomer({...customer, taxId: e.target.value})} />
                    </div>
                    {onSaveCustomer && (
                        <button type="button" onClick={() => onSaveCustomer(customer)} className="w-full mt-2 bg-slate-800 hover:bg-black text-white text-xs font-bold py-3 rounded-xl transition-all shadow-lg shadow-slate-200 flex justify-center gap-2">
                            <Save size={14} /> SAVE TO ADDRESS BOOK
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* --- TAB: ITEMS --- */}
      {activeTab === 'items' && (
        <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">Line Items ({items.length}/{maxItems})</h3>
                <button type="button" onClick={addItem} disabled={items.length >= maxItems} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${items.length >= maxItems ? 'text-slate-300 bg-slate-50' : 'bg-brand-50 text-brand-600 hover:bg-brand-100'}`}>
                    <Plus size={14}/> Add Item
                </button>
            </div>
            
            <div className="space-y-4">
              {items.map((item, index) => (
                  <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 group relative">
                      <div className="absolute -left-2 top-4 bg-slate-800 text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-lg shadow-md">#{index+1}</div>
                      <button type="button" onClick={() => { const n = items.filter(i => i.id !== item.id); setItems(n); }} className="absolute -top-2 -right-2 bg-white text-slate-300 hover:text-red-500 hover:scale-110 shadow-sm border border-slate-100 rounded-full p-1.5 transition-all"><X size={14}/></button>
                      
                      <div className="pl-3">
                        <FilledTextArea 
                            label="Description" 
                            value={item.description} 
                            onChange={e => handleItemChange(item.id, 'description', e.target.value)} 
                            maxLength={700} rows={2}
                            className={`text-sm ${item.description.length >= 700 ? 'bg-red-50 text-red-700' : ''}`}
                        />
                        <div className="flex justify-end text-[9px] text-slate-300 mb-3 mt-1 font-mono">{item.description.length}/700</div>

                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-3"><FilledInput type="number" label="Qty" value={item.qty} onChange={e => handleItemChange(item.id, 'qty', Number(e.target.value))} className="text-center font-bold text-brand-600" /></div>
                            <div className="col-span-4"><FilledInput label="Unit" value={item.unit} onChange={e => handleItemChange(item.id, 'unit', e.target.value)} className="text-center" /></div>
                            <div className="col-span-5"><FilledInput type="number" label="Price" value={item.pricePerUnit} onChange={e => handleItemChange(item.id, 'pricePerUnit', Number(e.target.value))} className="text-right" /></div>
                        </div>
                      </div>
                  </div>
              ))}
              {items.length === 0 && (
                  <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                      <Box className="mx-auto text-slate-300 mb-2" size={32} />
                      <p className="text-slate-400 text-sm font-medium">No items added yet</p>
                  </div>
              )}
            </div>
        </div>
      )}

      {/* --- TAB: IMAGES --- */}
      {activeTab === 'images' && (
        <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">Floating Assets ({floatingImages?.length || 0}/{maxFloatingImages})</h3>
            </div>

            <label className={`block w-full border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all mb-6 group ${
                (floatingImages?.length || 0) >= maxFloatingImages ? 'border-slate-200 bg-slate-50 cursor-not-allowed' : 'border-slate-300 hover:border-brand-400 hover:bg-brand-50/30'
            }`}>
                 <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef}
                    onChange={handleFloatingImageUpload}
                    disabled={(floatingImages?.length || 0) >= maxFloatingImages}
                    className="hidden"
                 />
                 <Upload size={24} className="mx-auto text-slate-400 group-hover:text-brand-500 mb-2 transition-colors" />
                 <p className="text-sm font-bold text-slate-600 group-hover:text-brand-600">
                     {(floatingImages?.length || 0) >= maxFloatingImages ? 'Limit Reached' : 'Upload Image'}
                 </p>
            </label>

            <div className="grid grid-cols-2 gap-4">
                  {(floatingImages || []).map((img, idx) => (
                      <div key={img.id} className="bg-white rounded-2xl p-2.5 shadow-soft border border-slate-100">
                          <div className="aspect-square bg-slate-50 rounded-xl mb-3 flex items-center justify-center overflow-hidden relative border border-slate-100">
                              <img src={img.url} className="w-full h-full object-contain" alt="thumb" />
                              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">#{idx+1}</div>
                          </div>
                          <button 
                              type="button"
                              onClick={(e) => {
                                  e.preventDefault(); e.stopPropagation();
                                  if(confirm('Delete image?')) onRemoveFloatingImage?.(img.id);
                              }}
                              className="w-full bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 text-[10px] font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                              <Trash2 size={12} /> Remove
                          </button>
                      </div>
                  ))}
            </div>
        </div>
      )}

      {/* --- COMPANY (LOCKED) --- */}
      {activeTab === 'doc' && (
      <div className="mt-8 pt-8 border-t border-dashed border-slate-200">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2"><Lock size={12}/> Seller Info (Locked)</h3>
          <FilledInput label="Company Name" value={company.name} readOnly className="bg-slate-100 text-slate-400 cursor-not-allowed" />
          
          <div className="mt-4 bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100">
              <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1"><CreditCard size={12}/> Bank Details (Editable)</h4>
              <div className="space-y-3">
                 <FilledInput label="Bank Name" value={company.bankName} onChange={e => setCompany({...company, bankName: e.target.value})} className="bg-white border-indigo-100 focus:ring-indigo-200" />
                 <div className="grid grid-cols-2 gap-3">
                     <FilledInput label="Account No" value={company.bankAccount} onChange={e => setCompany({...company, bankAccount: e.target.value})} className="bg-white border-indigo-100 focus:ring-indigo-200" />
                     <FilledInput label="Branch" value={company.bankBranch} onChange={e => setCompany({...company, bankBranch: e.target.value})} className="bg-white border-indigo-100 focus:ring-indigo-200" />
                 </div>
              </div>
          </div>
      </div>
      )}

      </div>
    </div>
  );
};