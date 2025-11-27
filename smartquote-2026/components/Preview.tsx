
import React, { useState, useEffect, useRef } from 'react';
import { CompanyInfo, CustomerInfo, DocumentInfo, LineItem, CalculationSummary, FloatingImage } from '../types';
import { formatCurrency, formatNumber, calculateLineItem } from '../utils/numberUtils';

interface PreviewProps {
  company: CompanyInfo;
  customer: CustomerInfo;
  document: DocumentInfo;
  items: LineItem[];
  totals: CalculationSummary;
  floatingImages?: FloatingImage[];
  onUpdateFloatingImage?: (id: string, updates: Partial<FloatingImage>) => void;
  onRemoveFloatingImage?: (id: string) => void;
}

const DraggableImage: React.FC<{
  img: FloatingImage;
  onUpdate: (id: string, updates: Partial<FloatingImage>) => void;
  onRemove: (id: string) => void;
}> = ({ img, onUpdate }) => {
  const [isActive, setIsActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const dimsStart = useRef({ w: 0, h: 0, x: 0, y: 0 });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsActive(false);
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActive(true);
    setIsDragging(true);
    dragStart.current = { x: e.clientX - img.x, y: e.clientY - img.y };
  };

  const handleResizeDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActive(true);
    setIsResizing(true);
    dimsStart.current = { w: img.width, h: img.height, x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        onUpdate(img.id, { x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
      } else if (isResizing) {
        const deltaX = e.clientX - dimsStart.current.x;
        const deltaY = e.clientY - dimsStart.current.y;
        onUpdate(img.id, { width: Math.max(50, dimsStart.current.w + deltaX), height: Math.max(50, dimsStart.current.h + deltaY) });
      }
    };
    const handleMouseUp = () => { setIsDragging(false); setIsResizing(false); };
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, img.id, onUpdate]);

  return (
    <div
      ref={ref}
      className={`absolute group select-none ${isActive ? 'z-50' : 'z-10'}`}
      style={{ left: img.x, top: img.y, width: img.width, height: img.height, cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
    >
      <img src={img.url} alt="floating" className={`w-full h-full object-contain pointer-events-none ${isActive ? 'ring-1 ring-blue-500 ring-dashed' : ''} print:ring-0`} />
      {isActive && (
           <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-nwse-resize rounded-full border-2 border-white shadow-sm z-50 print:hidden" onMouseDown={handleResizeDown}></div>
      )}
    </div>
  );
};

export const Preview: React.FC<PreviewProps> = ({ company, customer, document, items, totals, floatingImages, onUpdateFloatingImage, onRemoveFloatingImage }) => {
  const isGov = document.formType === 'government';

  // Helper for Thai Date formatting
  const formatDateTH = (dateStr: string) => {
    if (!dateStr) return '';
    // Check if it's a valid date string YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      return dateStr; // Return as-is if it's just text (e.g., "ภายใน 30 วัน")
    }
    const [y, m, d] = dateStr.split('-');
    return `${d}-${m}-${y}`;
  };

  const renderContent = () => {
    if (!isGov) {
      // --- PRIVATE / MODERN LAYOUT ---
      const borderColor = 'border-gray-200';
      return (
          <div className="w-[210mm] h-[297mm] bg-white text-black text-sm leading-relaxed font-sans relative overflow-hidden flex flex-col mx-auto shadow-sm">
          <div className="p-8 pb-4 pt-8 mb-3 flex flex-col h-full flex-grow relative">
              <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3 items-center">
                      {company.logoUrl && <img src={company.logoUrl} alt="Logo" className="w-14 h-14 object-contain print:filter-none" />}
                      <div>
                          <h1 className="text-lg font-bold text-brand-700 tracking-tight leading-tight print:text-black">{company.name}</h1>
                          <p className="text-[11px] text-gray-900 w-80 mt-0.5 leading-snug print:text-black">{company.addressLine1} {company.addressLine2}</p>
                          <div className="text-[10px] text-gray-900 space-y-0 print:text-black"><p>โทร. {company.phone} {company.fax ? `แฟกซ์. ${company.fax}` : ''}</p><p>เลขประจำตัวผู้เสียภาษี {company.taxId}</p></div>
                      </div>
                  </div>
                  <div className="text-right mt-1">
                      <div className="bg-brand-50 text-brand-600 px-4 py-0.5 rounded-l-full inline-block mb-0.5 shadow-sm border border-brand-100 border-r-0 print:border-none">
                          <h2 className="text-base font-bold uppercase tracking-wider">ใบเสนอราคา</h2>
                      </div>
                      <h3 className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium pr-4">Quotation</h3>
                  </div>
              </div>

              <div className="flex gap-4 mb-4 text-[11px]">
                  <div className="w-[60%] bg-white rounded-lg p-3 border border-gray-200 shadow-sm print:shadow-none print:border-gray-300">
                      <h3 className="font-bold text-brand-600 border-b border-gray-100 pb-1 mb-2 text-xs flex items-center gap-2">ข้อมูลลูกค้า <span className="text-gray-300 font-normal text-[9px] uppercase">/ Customer</span></h3>
                      <div className="grid grid-cols-[70px_1fr] gap-y-1">
                          <span className="text-gray-900 font-medium print:text-black">นามลูกค้า</span><span className="text-black font-bold">{customer.companyName}</span>
                          <span className="text-gray-900 font-medium print:text-black">ผู้ติดต่อ</span><span className="text-black font-medium">{customer.contactName}</span>
                          <span className="text-gray-900 font-medium print:text-black">ที่อยู่</span><span className="text-black leading-snug text-gray-900 print:text-black">{customer.address}</span>
                          <span className="text-gray-900 font-medium print:text-black">เบอร์โทร</span><span className="text-black">{customer.phone}</span>
                          {customer.taxId && <><span className="text-gray-900 font-medium print:text-black">เลขภาษี</span><span className="text-black font-mono tracking-wide">{customer.taxId}</span></>}
                      </div>
                  </div>
                  <div className="w-[40%] bg-gray-50/50 rounded-lg p-0 border border-gray-200 overflow-hidden shadow-sm text-[11px] print:shadow-none print:bg-gray-50">
                      <div className="grid grid-cols-[100px_1fr] gap-y-0 h-full">
                          <div className="p-2 bg-white text-gray-900 font-bold border-b border-r border-gray-200 flex items-center print:text-black">เลขที่ใบเสนอราคา</div><div className="p-2 bg-white border-b border-gray-200 font-bold text-brand-700 flex items-center print:text-black">{document.docNumber}</div>
                          <div className="p-2 text-gray-900 font-medium border-b border-r border-gray-200 flex items-center print:text-black">วันที่</div><div className="p-2 border-b border-gray-200 flex items-center text-gray-900 print:text-black">{formatDateTH(document.date)}</div>
                          <div className="p-2 text-gray-900 font-medium border-b border-r border-gray-200 flex items-center print:text-black">ยืนราคา (วัน)</div><div className="p-2 border-b border-gray-200 flex items-center text-gray-900 print:text-black">{document.validDays} วัน</div>
                          <div className="p-2 text-gray-900 font-medium border-b border-r border-gray-200 flex items-center print:text-black">ใช้ได้ถึงวันที่</div><div className="p-2 border-b border-gray-200 flex items-center text-brand-600 font-bold print:text-black">{formatDateTH(document.dueDate)}</div>
                          <div className="p-2 text-gray-900 font-medium border-r border-gray-200 flex items-center bg-gray-50 print:text-black">พนักงานขาย</div><div className="p-2 flex items-center text-gray-900 bg-gray-50 truncate print:text-black">{document.preparedBy}</div>
                      </div>
                  </div>
              </div>

              <div className="flex-grow">
              <table className="w-full text-[11px] border-collapse rounded-t-lg overflow-hidden table-fixed">
                  <thead>
                  <tr className="bg-brand-600 text-white text-center font-bold h-9 shadow-sm print:bg-gray-800 print:text-white">
                      <th className="p-1 w-[4%] rounded-tl-lg border-r border-brand-500 print:border-gray-700">ลำดับ</th>
                      <th className="p-1 text-left border-r border-brand-500 pl-3 print:border-gray-700">รายละเอียดสินค้า</th>
                      <th className="p-1 w-[7%] border-r border-brand-500 print:border-gray-700">จำนวน</th>
                      <th className="p-1 w-[7%] border-r border-brand-500 print:border-gray-700">หน่วย</th>
                      <th className="p-1 w-[12%] border-r border-brand-500 print:border-gray-700">ราคา/หน่วย</th>
                      <th className="p-1 w-[12%] rounded-tr-lg">จำนวนเงิน</th>
                  </tr>
                  </thead>
                  <tbody>
                  {items.map((item, index) => {
                      const { netAmount } = calculateLineItem(item);
                      return (
                      <tr key={item.id} className="align-top text-black border-b border-gray-100 hover:bg-orange-50/20 transition-colors">
                          <td className={`border-x ${borderColor} p-2 text-center text-gray-900 print:text-black`}>{index + 1}</td>
                          <td className={`border-x ${borderColor} p-2`}><div className="whitespace-pre-wrap font-medium text-gray-900 print:text-black">{item.description}</div></td>
                          <td className={`border-x ${borderColor} p-2 text-center font-medium print:text-black`}>{item.qty}</td>
                          <td className={`border-x ${borderColor} p-2 text-center text-gray-900 print:text-black`}>{item.unit}</td>
                          <td className={`border-x ${borderColor} p-2 text-right text-gray-900 print:text-black`}>{formatCurrency(item.pricePerUnit)}</td>
                          <td className={`border-x ${borderColor} p-2 text-right font-bold text-gray-900 print:text-black`}>{formatCurrency(netAmount)}</td>
                      </tr>
                      );
                  })}
                  <tr><td className={`border-t ${borderColor}`}></td><td className={`border-t ${borderColor}`}></td><td className={`border-t ${borderColor}`}></td><td className={`border-t ${borderColor}`}></td><td className={`border-t ${borderColor}`}></td><td className={`border-t ${borderColor}`}></td></tr>
                  </tbody>
              </table>
              </div>

              <div className="mt-auto">
                  <div className="flex gap-4 items-stretch mb-6">
                      <div className="w-[60%] flex flex-col gap-3">
                          <div className="flex-grow border border-gray-200 rounded-lg p-3 bg-white shadow-sm flex flex-col justify-between print:shadow-none print:border-gray-300">
                              <div><h3 className="font-bold text-brand-600 text-xs mb-1.5 flex items-center gap-2">📝 หมายเหตุ (Remarks)</h3><div className="text-[10px] text-gray-900 whitespace-pre-wrap leading-relaxed pl-2 border-l-2 border-brand-500 py-0.5 print:text-black">{document.remarks || "-"}</div></div>
                              <div className="my-2 border-t border-gray-100"></div>
                              <div><h3 className="font-bold text-brand-600 text-xs mb-2 flex items-center gap-2">🏦 ชำระเงินโอนเข้าบัญชี (Bank Details)</h3><div className="text-[11px] text-gray-900 pl-2 print:text-black"><p className="mb-0.5"><span className="font-semibold text-gray-900 print:text-black">{company.bankName}</span> สาขา {company.bankBranch}</p><p className="mb-1.5">ชื่อบัญชี <span className="font-semibold text-gray-900 print:text-black">{company.name}</span></p><div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded border border-gray-100 w-fit print:bg-transparent print:border-gray-300"><span className="font-medium text-gray-900 text-[10px] print:text-black">เลขที่บัญชี</span><span className="font-bold text-lg text-brand-600 tracking-wide font-mono leading-none print:text-black">{company.bankAccount}</span></div></div></div>
                          </div>
                      </div>
                      <div className="w-[40%] flex flex-col">
                          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm h-full flex flex-col print:shadow-none print:border-gray-300">
                              <div className="p-3 space-y-2 text-xs flex-grow">
                                  <div className="flex justify-between items-center text-gray-900 print:text-black"><span>รวมเป็นเงิน</span><span className="font-semibold text-gray-900 print:text-black">{formatCurrency(totals.totalExVat)}</span></div>
                                  {document.vatEnabled && (<div className="flex justify-between items-center text-gray-900 print:text-black"><span>ภาษีมูลค่าเพิ่ม {document.vatRate}%</span><span className="font-semibold text-gray-900 print:text-black">{formatCurrency(totals.vatAmount)}</span></div>)}
                                  <div className="mt-3 bg-[#FFF7ED] border border-[#FED7AA] rounded-md p-2 text-center relative overflow-hidden print:bg-orange-50 print:border-orange-200"><div className="absolute top-0 left-0 w-1 h-full bg-brand-400"></div><span className="font-bold text-brand-800 text-[10px] print:text-black">({totals.grandTotalText})</span></div>
                              </div>
                              <div className="bg-gradient-to-br from-brand-500 to-brand-600 p-4 text-white relative overflow-hidden print:bg-brand-600 print:text-white print:border-t print:border-brand-600">
                                  <div className="absolute -top-6 -right-6 w-16 h-16 bg-white opacity-10 rounded-full print:hidden"></div><div className="absolute bottom-2 right-12 w-8 h-8 bg-white opacity-5 rounded-full print:hidden"></div>
                                  <div className="flex flex-col justify-between h-full relative z-10 gap-1">
                                      <div className="flex justify-between items-end"><div className="flex flex-col"><span className="font-bold text-base leading-tight drop-shadow-sm print:drop-shadow-none print:filter-none">จำนวนเงินรวมทั้งสิ้น</span><span className="text-[9px] opacity-90 uppercase font-medium tracking-widest mt-0.5">Grand Total</span></div><span className="font-bold text-2xl leading-none tracking-tight drop-shadow-md print:drop-shadow-none print:filter-none">{formatCurrency(totals.grandTotal)}</span></div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="flex justify-between px-6 text-black align-bottom pb-4">
                      <div className="text-center relative"><div className="w-48 mb-2 mx-auto"></div><p className="text-[10px] font-bold text-gray-700 print:text-black">ผู้อนุมัติสั่งซื้อ / Customer Signature</p><div className="mt-4 text-[10px] text-gray-900 print:text-black">.......................................................</div></div>
                      <div className="text-center relative"><div className="relative mb-2 mx-auto w-48 h-8 flex items-end justify-center"><div className="border-b border-gray-300 w-full"></div></div><p className="text-xs font-bold text-black">({document.signerName || document.preparedBy || '.......................................'})</p><p className="text-[10px] font-bold text-brand-600 mt-0.5 print:text-black">{document.signerPosition || 'ผู้มีอำนาจลงนาม'}</p><div className="mt-2 text-[10px] text-gray-900 print:text-black">วันที่ {formatDateTH(document.date)}</div></div>
                  </div>
              </div>
          </div>
          </div>
      );
    } else {
      // --- GOVERNMENT / OFFICIAL LAYOUT ---
      return (
        <div className="w-[210mm] h-[297mm] bg-white text-black text-[13px] leading-relaxed font-sans mx-auto flex flex-col overflow-hidden">
          <div className="p-8 flex flex-col h-full relative">
            <div className="flex justify-between items-start mb-3">
              <div className="w-[150px] flex-shrink-0">{company.logoUrl && <img src={company.logoUrl} className="w-full object-contain max-h-20 print:filter-none" alt="logo" />}</div>
              <div className="flex-1 text-right pl-4 text-[12px]"><h1 className="text-lg font-bold text-brand-800 print:text-black">{company.name}</h1><p className="print:text-black">{company.addressLine1}</p><p className="print:text-black">{company.addressLine2}</p><p className="print:text-black">เลขประจำตัวผู้เสียภาษี {company.taxId}</p></div>
            </div>
            <div className="bg-gray-200 border border-black text-center font-bold text-base py-1 mb-0 border-b-0 print:bg-gray-200 print:text-black">ใบเสนอราคา / Quotation</div>
            <div className="flex border border-black mb-1">
              <div className="w-[60%] border-r border-black p-2 relative">
                  <table className="w-full text-[12px] leading-tight"><tbody>
                        <tr><td className="w-[85px] align-top font-bold py-0.5 print:text-black">เรียน</td><td className="align-top py-0.5 print:text-black">{customer.contactName}</td></tr>
                        <tr><td className="align-top font-bold py-0.5 print:text-black">ชื่อบริษัท</td><td className="align-top py-0.5 print:text-black">{customer.companyName}</td></tr>
                        <tr><td className="align-top font-bold py-0.5 print:text-black">หน่วยงาน</td><td className="align-top py-0.5 print:text-black"></td></tr>
                        <tr><td className="align-top font-bold py-0.5 print:text-black">ที่อยู่</td><td className="align-top py-0.5 print:text-black">{customer.address}</td></tr>
                        <tr><td className="align-top font-bold py-0.5 print:text-black">เบอร์ติดต่อ</td><td className="align-top py-0.5 print:text-black">{customer.phone}</td></tr>
                        {customer.taxId && (<tr><td className="align-top font-bold py-0.5 print:text-black">เลขผู้เสียภาษี</td><td className="align-top py-0.5 print:text-black">{customer.taxId}</td></tr>)}
                      </tbody></table>
              </div>
              <div className="w-[40%] p-2">
                  <table className="w-full text-[12px] leading-tight"><tbody>
                        <tr><td className="w-[110px] align-top font-bold py-0.5 print:text-black">วันที่</td><td className="align-top py-0.5 print:text-black">{formatDateTH(document.date)}</td></tr>
                        {document.deliveryDate && (<tr><td className="align-top font-bold py-0.5 print:text-black">วันที่ส่งสินค้า</td><td className="align-top py-0.5 print:text-black">{formatDateTH(document.deliveryDate)}</td></tr>)}
                        <tr><td className="align-top font-bold py-0.5 print:text-black">ยืนราคา (วัน)</td><td className="align-top py-0.5 print:text-black">{document.validDays}</td></tr>
                        <tr><td className="align-top font-bold py-0.5 print:text-black">ยืนราคาถึงวันที่</td><td className="align-top py-0.5 print:text-black">{formatDateTH(document.dueDate)}</td></tr>
                        <tr><td className="align-top font-bold py-0.5 print:text-black">ผู้เสนอราคา</td><td className="align-top py-0.5 print:text-black">{document.preparedBy}</td></tr>
                        <tr><td className="align-top font-bold py-0.5 print:text-black">เงื่อนไขการชำระเงิน</td><td className="align-top py-0.5 print:text-black">{document.paymentTerms}</td></tr>
                      </tbody></table>
              </div>
            </div>
            <div className="text-black mb-1 text-[12px] print:text-black">ทางห้างฯ มีความยินดีที่จะเสนอราคาสินค้า ดังรายการต่อไปนี้</div>
            <div className="flex-grow">
              <table className="w-full border-collapse border border-black text-[12px] table-fixed">
                  <thead><tr className="text-center font-bold"><th className="border border-black p-1 w-[5%] print:text-black">ลำดับ</th><th className="border border-black p-1 print:text-black">รายละเอียดสินค้า</th><th className="border border-black p-1 w-[8%] print:text-black">จำนวน</th><th className="border border-black p-1 w-[8%] print:text-black">หน่วยนับ</th><th className="border border-black p-1 w-[12%] print:text-black">ราคาต่อหน่วย</th><th className="border border-black p-1 w-[13%] print:text-black">ราคารวม</th></tr></thead>
                  <tbody>
                    {items.map((item, index) => {
                        const { totalLinePrice } = calculateLineItem(item);
                        return (
                            <tr key={item.id} className="align-top">
                              <td className="border-x border-black p-1 text-center print:text-black">{index + 1}</td>
                              <td className="border-x border-black p-1"><div className="whitespace-pre-wrap print:text-black">{item.description}</div></td>
                              <td className="border-x border-black p-1 text-center print:text-black">{formatNumber(item.qty)}</td>
                              <td className="border-x border-black p-1 text-center print:text-black">{item.unit}</td>
                              <td className="border-x border-black p-1 text-right print:text-black">{formatCurrency(item.pricePerUnit)}</td>
                              <td className="border-x border-black p-1 text-right print:text-black">{formatCurrency(totalLinePrice)}</td>
                            </tr>
                        );
                    })}
                    <tr className="border-t border-black"><td colSpan={6}></td></tr>
                  </tbody>
              </table>
            </div>
            <div className="mt-auto">
                <div className="border border-black border-t-0 p-1 text-center font-bold bg-gray-100 text-[12px] print:bg-gray-100 print:text-black">{totals.grandTotalText}</div>
                <div className="flex mt-2 items-start">
                    <div className="flex-1 pr-4">
                        <div className="mb-2"><span className="font-bold underline text-[12px] print:text-black">หมายเหตุ</span><div className="ml-4 whitespace-pre-wrap text-[11px] leading-snug print:text-black">{document.remarks}</div></div>
                        <div className="mb-2"><span className="font-bold underline text-[12px] print:text-black">ข้อมูลการชำระเงิน</span><div className="ml-4 text-[11px] leading-snug print:text-black">ธนาคาร: {company.bankName} สาขา: {company.bankBranch} <br/>ชื่อบัญชี: {company.name} <br/>เลขที่บัญชี: {company.bankAccount}</div></div>
                    </div>
                    <div className="w-[280px]">
                        <div className="border border-black text-[12px]">
                            {totals.priceIncludeVat && document.vatEnabled ? (
                                <><div className="flex justify-between p-1 border-b border-black print:text-black"><span>ราคารวม</span><span>{formatCurrency(totals.totalExVat)}</span></div><div className="flex justify-between p-1 border-b border-black print:text-black"><span>รวมภาษี</span><span>{formatCurrency(totals.grandTotal)}</span></div><div className="flex justify-between p-1 border-b border-black text-gray-700 italic print:text-black"><span>ถอดภาษีมูลค่าเพิ่ม {document.vatRate}%</span><span>{formatCurrency(totals.vatAmount)}</span></div><div className="flex justify-between p-1 border-b border-black text-gray-700 italic print:text-black"><span>มูลค่าสินค้าก่อนภาษี</span><span>{formatCurrency(totals.preVatTotal)}</span></div><div className="flex justify-between p-1 font-bold bg-gray-200 print:bg-gray-200 print:text-black"><span>ราคารวมทั้งสิ้น</span><span>{formatCurrency(totals.grandTotal)}</span></div></>
                            ) : (
                                <><div className="flex justify-between p-1 border-b border-black print:text-black"><span>ราคารวม</span><span>{formatCurrency(totals.totalExVat)}</span></div><div className="flex justify-between p-1 border-b border-black print:text-black"><span>ภาษีมูลค่าเพิ่ม {document.vatRate}%</span><span>{document.vatEnabled ? formatCurrency(totals.vatAmount) : '-'}</span></div><div className="flex justify-between p-1 font-bold bg-gray-200 print:bg-gray-200 print:text-black"><span>ราคารวมทั้งสิ้น</span><span>{formatCurrency(totals.grandTotal)}</span></div></>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex justify-between mt-6 px-8 pb-4">
                    <div className="text-center relative w-1/3"><div className="border-b border-black mb-1 mx-auto w-4/5"></div><div className="text-left text-[11px] ml-[10%] mb-2 print:text-black">ประทับตรา_<br/>ตัวบรรจง (...........................................)</div><p className="font-bold text-[12px] print:text-black">ผู้สั่งซื้อสินค้า</p><div className="mt-2 text-[11px] text-left ml-[10%] print:text-black">ตำแหน่ง...........................................<br/>วันที่ ...........................................</div></div>
                    <div className="text-center relative w-1/3"><div className="border-b border-black mb-1 mx-auto w-4/5"></div><p className="text-[12px] font-bold mb-1 print:text-black">({document.signerName || '...........................................'})</p><p className="font-bold text-[12px] print:text-black">{document.signerPosition || 'ผู้มีอำนาจลงนาม'}</p><div className="mt-2 text-[11px] print:text-black">วันที่ {formatDateTH(document.date)}</div></div>
                </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="relative w-full h-full">
        {company.logoUrl && !isGov && <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-500 to-brand-600 print:bg-brand-600 z-10"></div>}
        {renderContent()}
        {floatingImages && floatingImages.length > 0 && onUpdateFloatingImage && onRemoveFloatingImage && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {floatingImages.map(img => <div key={img.id} className="pointer-events-auto"><DraggableImage img={img} onUpdate={onUpdateFloatingImage} onRemove={onRemoveFloatingImage}/></div>)}
            </div>
        )}
    </div>
  );
};
