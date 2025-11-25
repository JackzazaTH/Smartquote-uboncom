
import React from 'react';
import { CompanyInfo, CustomerInfo, DocumentInfo, LineItem, CalculationSummary } from '../types';
import { formatCurrency, formatNumber, calculateLineItem } from '../utils/numberUtils';

interface PreviewProps {
  company: CompanyInfo;
  customer: CustomerInfo;
  document: DocumentInfo;
  items: LineItem[];
  totals: CalculationSummary;
}

export const Preview: React.FC<PreviewProps> = ({ company, customer, document, items, totals }) => {
  
  const isGov = document.formType === 'government';

  // --- PRIVATE / MODERN LAYOUT ---
  if (!isGov) {
    const borderColor = 'border-gray-200';

    return (
        <div className="w-[210mm] h-[297mm] bg-white text-black text-sm leading-relaxed font-sans relative overflow-hidden flex flex-col mx-auto shadow-sm">
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-500 to-brand-600 print:bg-brand-600"></div>

        <div className="p-8 pb-4 pt-10 flex flex-col h-full flex-grow relative">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                    {company.logoUrl && (
                        <img src={company.logoUrl} alt="Logo" className="w-16 h-16 object-contain print:filter-none" />
                    )}
                    <div>
                        <h1 className="text-xl font-bold text-brand-700 tracking-tight">{company.name}</h1>
                        <p className="text-xs text-gray-600 w-80 mt-1 leading-snug">{company.addressLine1} {company.addressLine2}</p>
                        <div className="mt-1 text-[11px] text-gray-500 space-y-0.5">
                           <p>โทร. {company.phone} {company.fax ? `แฟกซ์. ${company.fax}` : ''}</p>
                           <p>เลขประจำตัวผู้เสียภาษี {company.taxId}</p>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="bg-brand-50 text-brand-600 px-5 py-1 rounded-l-full inline-block mb-1 shadow-sm border border-brand-100 border-r-0 print:border-none">
                        <h2 className="text-lg font-bold uppercase tracking-wider">ใบเสนอราคา</h2>
                    </div>
                    <h3 className="text-xs text-gray-400 uppercase tracking-[0.2em] font-medium pr-5">Quotation</h3>
                </div>
            </div>

            {/* Info Grid - Modern Cards */}
            <div className="flex gap-4 mb-4 text-[11px]">
                {/* Customer Box */}
                <div className="w-[60%] bg-white rounded-lg p-3 border border-gray-200 shadow-sm print:shadow-none print:border-gray-300">
                    <h3 className="font-bold text-brand-600 border-b border-gray-100 pb-1 mb-2 text-xs flex items-center gap-2">
                        ข้อมูลลูกค้า <span className="text-gray-300 font-normal text-[9px] uppercase">/ Customer</span>
                    </h3>
                    <div className="grid grid-cols-[70px_1fr] gap-y-1">
                        <span className="text-gray-500">นามลูกค้า</span>
                        <span className="text-black font-bold">{customer.companyName}</span>
                        
                        <span className="text-gray-500">ผู้ติดต่อ</span>
                        <span className="text-black font-medium">{customer.contactName}</span>
                        
                        <span className="text-gray-500">ที่อยู่</span>
                        <span className="text-black leading-snug text-gray-700">{customer.address}</span>
                        
                        <span className="text-gray-500">เบอร์โทร</span>
                        <span className="text-black">{customer.phone}</span>
                        
                        {customer.taxId && (
                            <>
                                <span className="text-gray-500">เลขภาษี</span>
                                <span className="text-black font-mono tracking-wide">{customer.taxId}</span>
                            </>
                        )}
                    </div>
                </div>
                
                {/* Document Info Box */}
                <div className="w-[40%] bg-gray-50/50 rounded-lg p-0 border border-gray-200 overflow-hidden shadow-sm text-[11px] print:shadow-none print:bg-gray-50">
                    <div className="grid grid-cols-[100px_1fr] gap-y-0 h-full">
                        <div className="p-2 bg-white text-gray-500 font-bold border-b border-r border-gray-200 flex items-center">เลขที่ใบเสนอราคา</div>
                        <div className="p-2 bg-white border-b border-gray-200 font-bold text-brand-700 flex items-center">{document.docNumber}</div>
                        
                        <div className="p-2 text-gray-500 font-medium border-b border-r border-gray-200 flex items-center">วันที่</div>
                        <div className="p-2 border-b border-gray-200 flex items-center text-gray-800">{document.date}</div>
                        
                        <div className="p-2 text-gray-500 font-medium border-b border-r border-gray-200 flex items-center">ยืนราคา (วัน)</div>
                        <div className="p-2 border-b border-gray-200 flex items-center text-gray-800">{document.validDays} วัน</div>
                        
                        <div className="p-2 text-gray-500 font-medium border-b border-r border-gray-200 flex items-center">ใช้ได้ถึงวันที่</div>
                        <div className="p-2 border-b border-gray-200 flex items-center text-brand-600 font-bold">{document.dueDate}</div>
                        
                        <div className="p-2 text-gray-500 font-medium border-r border-gray-200 flex items-center bg-gray-50">พนักงานขาย</div>
                        <div className="p-2 flex items-center text-gray-800 bg-gray-50 truncate">{document.preparedBy}</div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-grow">
            <table className="w-full text-[11px] border-collapse rounded-t-lg overflow-hidden table-fixed">
                <thead>
                <tr className="bg-brand-600 text-white text-center font-bold h-9 shadow-sm print:bg-gray-800 print:text-white">
                    <th className="p-1 w-[5%] rounded-tl-lg border-r border-brand-500 print:border-gray-700">#</th>
                    <th className="p-1 w-[10%] border-r border-brand-500 print:border-gray-700">รูปภาพ</th>
                    <th className="p-1 w-[12%] border-r border-brand-500 print:border-gray-700">Part Number</th>
                    <th className="p-1 text-left border-r border-brand-500 pl-3 print:border-gray-700">รายละเอียดสินค้า</th>
                    <th className="p-1 w-[8%] border-r border-brand-500 print:border-gray-700">จำนวน</th>
                    <th className="p-1 w-[8%] border-r border-brand-500 print:border-gray-700">หน่วย</th>
                    <th className="p-1 w-[12%] border-r border-brand-500 print:border-gray-700">ราคา/หน่วย</th>
                    <th className="p-1 w-[10%] border-r border-brand-500 print:border-gray-700">ส่วนลด</th>
                    <th className="p-1 w-[13%] rounded-tr-lg">จำนวนเงิน</th>
                </tr>
                </thead>
                <tbody>
                {items.map((item, index) => {
                    const { netAmount } = calculateLineItem(item);
                    
                    return (
                    <tr key={item.id} className="align-top text-black border-b border-gray-100 hover:bg-orange-50/20 transition-colors">
                        <td className={`border-x ${borderColor} p-2 text-center text-gray-500`}>{index + 1}</td>
                        <td className={`border-x ${borderColor} p-1 text-center align-middle`}>
                            {item.imageUrl ? (
                                <img 
                                    src={item.imageUrl} 
                                    alt="Product" 
                                    style={{ height: (item.imageHeight || 100) * 0.6 }}
                                    className="object-contain max-w-full mx-auto rounded-sm print:filter-none"
                                />
                            ) : null}
                        </td>
                        <td className={`border-x ${borderColor} p-2 text-center font-medium text-gray-700`}>{item.partNumber}</td>
                        <td className={`border-x ${borderColor} p-2`}>
                            <div className="whitespace-pre-wrap font-medium text-gray-900">{item.description}</div>
                        </td>
                        <td className={`border-x ${borderColor} p-2 text-center font-medium`}>{item.qty}</td>
                        <td className={`border-x ${borderColor} p-2 text-center text-gray-500`}>{item.unit}</td>
                        <td className={`border-x ${borderColor} p-2 text-right text-gray-700`}>{formatCurrency(item.pricePerUnit)}</td>
                        <td className={`border-x ${borderColor} p-2 text-right text-gray-600`}>
                            {item.discountValue > 0 ? (
                                <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                    {item.discountType === 'percent' ? `${item.discountValue}%` : formatNumber(item.discountValue)}
                                </span>
                            ) : '-'}
                        </td>
                        <td className={`border-x ${borderColor} p-2 text-right font-bold text-gray-900`}>{formatCurrency(netAmount)}</td>
                    </tr>
                    );
                })}
                <tr>
                    <td className={`border-t ${borderColor}`}></td>
                    <td className={`border-t ${borderColor}`}></td>
                    <td className={`border-t ${borderColor}`}></td>
                    <td className={`border-t ${borderColor}`}></td>
                    <td className={`border-t ${borderColor}`}></td>
                    <td className={`border-t ${borderColor}`}></td>
                    <td className={`border-t ${borderColor}`}></td>
                    <td className={`border-t ${borderColor}`}></td>
                    <td className={`border-t ${borderColor}`}></td>
                </tr>
                </tbody>
            </table>
            </div>

            {/* Footer Zone (Stick to bottom with flex-col parent) */}
            <div className="mt-auto">
                <div className="flex gap-4 items-stretch mb-6">
                    {/* Left Column: Remarks & Bank */}
                    <div className="w-[60%] flex flex-col gap-3">
                        <div className="flex-grow border border-gray-200 rounded-lg p-3 bg-white shadow-sm flex flex-col justify-between print:shadow-none print:border-gray-300">
                            {/* Remarks */}
                            <div>
                                <h3 className="font-bold text-brand-600 text-xs mb-1.5 flex items-center gap-2">
                                    📝 หมายเหตุ (Remarks)
                                </h3>
                                <div className="text-[10px] text-gray-600 whitespace-pre-wrap leading-relaxed pl-2 border-l-2 border-brand-200 py-0.5">
                                    {document.remarks || "-"}
                                </div>
                            </div>
                            
                            <div className="my-2 border-t border-gray-100"></div>
                            
                            {/* Bank Details */}
                            <div>
                                <h3 className="font-bold text-brand-600 text-xs mb-2 flex items-center gap-2">
                                    🏦 ชำระเงินโอนเข้าบัญชี (Bank Details)
                                </h3>
                                <div className="text-[11px] text-gray-700 pl-2">
                                    <p className="mb-0.5"><span className="font-semibold text-gray-900">{company.bankName}</span> สาขา {company.bankBranch}</p>
                                    <p className="mb-1.5">ชื่อบัญชี <span className="font-semibold text-gray-900">{company.name}</span></p>
                                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded border border-gray-100 w-fit print:bg-transparent print:border-gray-300">
                                        <span className="font-medium text-gray-500 text-[10px]">เลขที่บัญชี</span>
                                        <span className="font-bold text-lg text-brand-600 tracking-wide font-mono leading-none">{company.bankAccount}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Baht Text Box - Separated */}
                        <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-lg p-2 text-center shadow-sm relative overflow-hidden print:bg-orange-50 print:border-orange-200">
                            <div className="absolute top-0 left-0 w-1 h-full bg-brand-400"></div>
                            <span className="font-bold text-brand-800 text-xs">({totals.grandTotalText})</span>
                        </div>
                    </div>

                    {/* Right Column: Totals */}
                    <div className="w-[40%] flex flex-col">
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm h-full flex flex-col print:shadow-none print:border-gray-300">
                            <div className="p-3 space-y-2 text-xs flex-grow">
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>รวมเป็นเงิน</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(totals.totalExVat)}</span>
                                </div>
                                
                                {totals.totalDiscount > 0 && (
                                    <div className="flex justify-between items-center text-gray-600">
                                        <span>หักส่วนลด</span>
                                        <span className="font-semibold text-red-500">-{formatCurrency(totals.totalDiscount)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center text-gray-900 font-bold pt-1.5 border-t border-gray-100">
                                    <span>จำนวนเงินหลังหักส่วนลด</span>
                                    <span>{formatCurrency(totals.subtotalAfterDiscount)}</span>
                                </div>

                                {document.vatEnabled && (
                                    <div className="flex justify-between items-center text-gray-600">
                                        <span>ภาษีมูลค่าเพิ่ม {document.vatRate}%</span>
                                        <span className="font-semibold text-gray-900">{formatCurrency(totals.vatAmount)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Grand Total - Orange Card */}
                            <div className="bg-gradient-to-br from-brand-500 to-brand-600 p-4 text-white relative overflow-hidden print:bg-brand-600 print:text-white">
                                <div className="absolute -top-6 -right-6 w-16 h-16 bg-white opacity-10 rounded-full"></div>
                                <div className="absolute bottom-2 right-12 w-8 h-8 bg-white opacity-5 rounded-full"></div>
                                
                                <div className="flex flex-col justify-between h-full relative z-10 gap-1">
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-base leading-tight drop-shadow-sm">จำนวนเงินรวมทั้งสิ้น</span>
                                            <span className="text-[9px] opacity-90 uppercase font-medium tracking-widest mt-0.5">Grand Total</span>
                                        </div>
                                        <span className="font-bold text-2xl leading-none tracking-tight drop-shadow-md">{formatCurrency(totals.grandTotal)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Signatures */}
                <div className="flex justify-between px-6 text-black align-bottom pb-4">
                    {/* Customer Signature Block */}
                    <div className="text-center relative">
                        <div className="border-b border-gray-300 w-48 mb-2 mx-auto"></div>
                        <p className="text-[10px] font-bold text-gray-700">ผู้อนุมัติสั่งซื้อ / Customer Signature</p>
                        <div className="mt-4 text-[10px] text-gray-400">
                            วันที่ ........./........./.........
                        </div>
                    </div>

                    {/* Seller Signature Block */}
                    <div className="text-center relative">
                        <div className="relative mb-2 mx-auto w-48 h-8 flex items-end justify-center">
                            <div className="border-b border-gray-300 w-full"></div>
                        </div>
                        <p className="text-xs font-bold text-black">({document.signerName || document.preparedBy || '.......................................'})</p>
                        <p className="text-[10px] font-bold text-brand-600 mt-0.5">{document.signerPosition || 'ผู้มีอำนาจลงนาม'}</p>
                        <div className="mt-2 text-[10px] text-gray-400">
                            วันที่ ........./........./.........
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
  }

  // --- GOVERNMENT / OFFICIAL LAYOUT ---
  return (
    <div className="w-[210mm] h-[297mm] bg-white text-black text-[13px] leading-relaxed font-sans mx-auto flex flex-col overflow-hidden">
      <div className="p-8 flex flex-col h-full relative">
        
        {/* Header (Aligned similar to PDF) */}
        <div className="flex justify-between items-start mb-3">
           {/* Logo Left */}
           <div className="w-[150px] flex-shrink-0">
               {company.logoUrl && <img src={company.logoUrl} className="w-full object-contain max-h-20 print:filter-none" alt="logo" />}
           </div>
           {/* Company Info Right */}
           <div className="flex-1 text-right pl-4 text-[12px]">
               <h1 className="text-lg font-bold text-brand-800">{company.name}</h1>
               <p>{company.addressLine1}</p>
               <p>{company.addressLine2}</p>
               <p>เลขประจำตัวผู้เสียภาษี {company.taxId}</p>
           </div>
        </div>

        {/* Gray Bar Title - Compact */}
        <div className="bg-gray-200 border border-black text-center font-bold text-base py-1 mb-0 border-b-0 print:bg-gray-200 print:text-black">
            ใบเสนอราคา / Quotation
        </div>

        {/* Info Grid (Borders) - Compact & Exact Match */}
        <div className="flex border border-black mb-1">
           {/* Left Column: Customer */}
           <div className="w-[60%] border-r border-black p-2 relative">
               <table className="w-full text-[12px] leading-tight">
                  <tbody>
                     <tr>
                        <td className="w-[85px] align-top font-bold py-0.5">เรียน</td>
                        <td className="align-top py-0.5">{customer.contactName}</td>
                     </tr>
                     <tr>
                        <td className="align-top font-bold py-0.5">ชื่อบริษัท</td>
                        <td className="align-top py-0.5">{customer.companyName}</td>
                     </tr>
                     <tr>
                         <td className="align-top font-bold py-0.5">หน่วยงาน</td>
                         <td className="align-top py-0.5"></td>
                     </tr>
                     <tr>
                        <td className="align-top font-bold py-0.5">ที่อยู่</td>
                        <td className="align-top py-0.5">{customer.address}</td>
                     </tr>
                     <tr>
                        <td className="align-top font-bold py-0.5">เบอร์ติดต่อ</td>
                        <td className="align-top py-0.5">{customer.phone}</td>
                     </tr>
                     {customer.taxId && (
                        <tr>
                            <td className="align-top font-bold py-0.5">เลขผู้เสียภาษี</td>
                            <td className="align-top py-0.5">{customer.taxId}</td>
                        </tr>
                     )}
                  </tbody>
               </table>
           </div>
           
           {/* Right Column: Doc Info */}
           <div className="w-[40%] p-2">
              <table className="w-full text-[12px] leading-tight">
                  <tbody>
                     <tr>
                         <td className="w-[110px] align-top font-bold py-0.5">วันที่</td>
                         <td className="align-top py-0.5">{document.date}</td>
                     </tr>
                     {document.deliveryDate && (
                         <tr>
                            <td className="align-top font-bold py-0.5">วันที่ส่งสินค้า</td>
                            <td className="align-top py-0.5">{document.deliveryDate}</td>
                         </tr>
                     )}
                     <tr>
                        <td className="align-top font-bold py-0.5">ยืนราคา (วัน)</td>
                        <td className="align-top py-0.5">{document.validDays}</td>
                     </tr>
                     <tr>
                        <td className="align-top font-bold py-0.5">ยืนราคาถึงวันที่</td>
                        <td className="align-top py-0.5">{document.dueDate}</td>
                     </tr>
                     <tr>
                        <td className="align-top font-bold py-0.5">ผู้เสนอราคา</td>
                        <td className="align-top py-0.5">{document.preparedBy}</td>
                     </tr>
                     <tr>
                        <td className="align-top font-bold py-0.5">เงื่อนไขการชำระเงิน</td>
                        <td className="align-top py-0.5">{document.paymentTerms}</td>
                     </tr>
                  </tbody>
              </table>
           </div>
        </div>

        <div className="text-black mb-1 text-[12px]">
            ทางห้างฯ มีความยินดีที่จะเสนอราคาสินค้า ดังรายการต่อไปนี้
        </div>

        {/* Table */}
        <div className="flex-grow">
           <table className="w-full border-collapse border border-black text-[12px] table-fixed">
              <thead>
                 <tr className="text-center font-bold">
                    <th className="border border-black p-1 w-[6%]">ลำดับ</th>
                    <th className="border border-black p-1 w-[10%]">รูปภาพ</th>
                    <th className="border border-black p-1">รายละเอียดสินค้า</th>
                    <th className="border border-black p-1 w-[8%]">จำนวน</th>
                    <th className="border border-black p-1 w-[8%]">หน่วยนับ</th>
                    <th className="border border-black p-1 w-[12%]">ราคาต่อหน่วย</th>
                    <th className="border border-black p-1 w-[10%]">ส่วนลด</th>
                    <th className="border border-black p-1 w-[15%]">ราคารวม</th>
                 </tr>
              </thead>
              <tbody>
                 {items.map((item, index) => {
                     const { totalLinePrice } = calculateLineItem(item);
                     
                     return (
                        <tr key={item.id} className="align-top">
                           <td className="border-x border-black p-1 text-center">{index + 1}</td>
                           <td className="border-x border-black p-1 text-center align-middle">
                               {item.imageUrl ? (
                                    <img 
                                        src={item.imageUrl} 
                                        alt="Product" 
                                        style={{ height: (item.imageHeight || 100) * 0.6 }}
                                        className="object-contain inline-block max-w-full print:filter-none"
                                    />
                                ) : null}
                           </td>
                           <td className="border-x border-black p-1">
                               <div className="whitespace-pre-wrap">{item.description}</div>
                           </td>
                           <td className="border-x border-black p-1 text-center">{formatNumber(item.qty)}</td>
                           <td className="border-x border-black p-1 text-center">{item.unit}</td>
                           <td className="border-x border-black p-1 text-right">{formatCurrency(item.pricePerUnit)}</td>
                           <td className="border-x border-black p-1 text-center">
                                {item.discountValue > 0 ? (
                                    <span className="text-[11px]">
                                        {item.discountType === 'percent' ? `${item.discountValue}%` : formatNumber(item.discountValue)}
                                    </span>
                                ) : '-'}
                           </td>
                           <td className="border-x border-black p-1 text-right">{formatCurrency(totalLinePrice)}</td>
                        </tr>
                     );
                 })}
                 
                 <tr className="border-t border-black"><td colSpan={8}></td></tr>
              </tbody>
           </table>
        </div>

        {/* Footer Zone sticking to bottom */}
        <div className="mt-auto">
            {/* Baht Text Bar */}
            <div className="border border-black border-t-0 p-1 text-center font-bold bg-gray-100 text-[12px] print:bg-gray-100">
                {totals.grandTotalText}
            </div>

            {/* Footer Section */}
            <div className="flex mt-2 items-start">
                {/* Left: Remarks & Bank */}
                <div className="flex-1 pr-4">
                    <div className="mb-2">
                        <span className="font-bold underline text-[12px]">หมายเหตุ</span>
                        <div className="ml-4 whitespace-pre-wrap text-[11px] leading-snug">{document.remarks}</div>
                    </div>
                    <div className="mb-2">
                        <span className="font-bold underline text-[12px]">ข้อมูลการชำระเงิน</span>
                        <div className="ml-4 text-[11px] leading-snug">
                            ธนาคาร: {company.bankName} สาขา: {company.bankBranch} <br/>
                            ชื่อบัญชี: {company.name} <br/>
                            เลขที่บัญชี: {company.bankAccount}
                        </div>
                    </div>
                </div>

                {/* Right: Totals */}
                <div className="w-[280px]">
                    <div className="border border-black text-[12px]">
                        
                        {/* IF Price includes VAT: Show Extract Breakdown */}
                        {totals.priceIncludeVat && document.vatEnabled ? (
                            <>
                                <div className="flex justify-between p-1 border-b border-black">
                                    <span>ราคารวม</span>
                                    {/* Shows the Gross Sum (e.g. 100) */}
                                    <span>{formatCurrency(totals.totalExVat)}</span> 
                                </div>
                                {totals.totalDiscount > 0 && (
                                    <div className="flex justify-between p-1 border-b border-black text-red-600">
                                        <span>ส่วนลด</span>
                                        <span>-{formatCurrency(totals.totalDiscount)}</span>
                                    </div>
                                )}
                                
                                <div className="flex justify-between p-1 border-b border-black">
                                    <span>หลังหักส่วนลด (รวมภาษี)</span>
                                    <span>{formatCurrency(totals.grandTotal)}</span>
                                </div>

                                <div className="flex justify-between p-1 border-b border-black text-gray-700 italic">
                                    <span>ถอดภาษีมูลค่าเพิ่ม {document.vatRate}%</span>
                                    <span>{formatCurrency(totals.vatAmount)}</span>
                                </div>

                                <div className="flex justify-between p-1 border-b border-black text-gray-700 italic">
                                    <span>มูลค่าสินค้าก่อนภาษี</span>
                                    <span>{formatCurrency(totals.preVatTotal)}</span>
                                </div>

                                <div className="flex justify-between p-1 font-bold bg-gray-200 print:bg-gray-200">
                                    <span>ราคารวมทั้งสิ้น</span>
                                    <span>{formatCurrency(totals.grandTotal)}</span>
                                </div>
                            </>
                        ) : (
                            /* Standard Add-On VAT Logic */
                            <>
                                <div className="flex justify-between p-1 border-b border-black">
                                    <span>ราคารวม</span>
                                    <span>{formatCurrency(totals.totalExVat)}</span>
                                </div>
                                {totals.totalDiscount > 0 && (
                                    <div className="flex justify-between p-1 border-b border-black text-red-600">
                                        <span>ส่วนลด</span>
                                        <span>-{formatCurrency(totals.totalDiscount)}</span>
                                    </div>
                                )}
                                {/* Subtotal after discount if discount exists */}
                                {totals.totalDiscount > 0 && (
                                    <div className="flex justify-between p-1 border-b border-black">
                                        <span>ราคาสุทธิ</span>
                                        <span>{formatCurrency(totals.subtotalAfterDiscount)}</span>
                                    </div>
                                )}
                                
                                <div className="flex justify-between p-1 border-b border-black">
                                    <span>ภาษีมูลค่าเพิ่ม {document.vatRate}%</span>
                                    <span>{document.vatEnabled ? formatCurrency(totals.vatAmount) : '-'}</span>
                                </div>
                                <div className="flex justify-between p-1 font-bold bg-gray-200 print:bg-gray-200">
                                    <span>ราคารวมทั้งสิ้น</span>
                                    <span>{formatCurrency(totals.grandTotal)}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Signatures */}
            <div className="flex justify-between mt-6 px-8 pb-4">
                {/* Buyer */}
                <div className="text-center relative w-1/3">
                    <div className="border-b border-black mb-1 mx-auto w-4/5"></div>
                    <div className="text-left text-[11px] ml-[10%] mb-2">
                        ประทับตรา_<br/>
                        ตัวบรรจง (...........................................)
                    </div>
                    <p className="font-bold text-[12px]">ผู้สั่งซื้อสินค้า</p>
                    <div className="mt-2 text-[11px] text-left ml-[10%]">
                        ตำแหน่ง...........................................
                    </div>
                </div>

                {/* Seller / Approver */}
                <div className="text-center relative w-1/3">
                    <div className="border-b border-black mb-1 mx-auto w-4/5"></div>
                    <p className="text-[12px] font-bold mb-1">({document.signerName || '...........................................'})</p>
                    <p className="font-bold text-[12px]">{document.signerPosition || 'ผู้มีอำนาจลงนาม'}</p>
                    <div className="mt-2 text-[11px]">
                        วันที่ ________/________/________
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
