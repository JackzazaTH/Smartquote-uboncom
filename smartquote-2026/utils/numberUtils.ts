
import { LineItem } from '../types';

// Format number with commas and 2 decimal places
export const formatCurrency = (num: number): string => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('th-TH').format(num);
};

// Simplified but robust Thai Baht Text converter
export const toThaiBahtText = (num: number): string => {
  if (!num) return 'ศูนย์บาทถ้วน';
  
  num = parseFloat(num.toFixed(2));
  const textNum = num.toFixed(2);
  const [bahtPart, satangPart] = textNum.split('.');

  const thaiNumbers = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  const convertGroup = (nStr: string): string => {
    let result = '';
    const len = nStr.length;
    
    for (let i = 0; i < len; i++) {
      const digit = parseInt(nStr[i]);
      const pos = len - i - 1;
      
      if (digit !== 0) {
        if (pos === 0 && digit === 1 && len > 1) {
          result += 'เอ็ด';
        } else if (pos === 1 && digit === 2) {
          result += 'ยี่';
        } else if (pos === 1 && digit === 1) {
          // Do nothing for 'sips'
        } else {
          result += thaiNumbers[digit];
        }

        if (pos === 1 && digit === 1) {
          result += 'สิบ';
        } else if (pos !== 0 || len === 1) {
          result += units[pos % 6];
        }
      }
    }
    return result;
  };

  const convertInteger = (nStr: string): string => {
    if (nStr.length > 6) {
        const firstPart = nStr.substring(0, nStr.length - 6);
        const lastPart = nStr.substring(nStr.length - 6);
        return convertInteger(firstPart) + 'ล้าน' + convertInteger(lastPart).replace(/^ศูนย์/, '');
    }
    
    let result = '';
    const len = nStr.length;
    for (let i = 0; i < len; i++) {
        const digit = parseInt(nStr[i]);
        const pos = len - i - 1;
        
        if (digit !== 0) {
            if (pos === 0 && digit === 1 && len > 1) result += 'เอ็ด';
            else if (pos === 1 && digit === 2) result += 'ยี่';
            else if (pos === 1 && digit === 1) { /* nothing */ }
            else result += thaiNumbers[digit];
            
            if (pos === 1) result += 'สิบ';
            else if (pos > 0) result += units[pos];
        }
    }
    return result;
  }

  let bahtText = convertInteger(bahtPart);
  
  const reader = (numStr: string): string => {
      let temp = "";
      const len = numStr.length;
      for (let i = 0; i < len; i++) {
          const digit = parseInt(numStr[i]);
          const pos = len - i - 1;
          if (digit === 0) continue;
          
          if (pos === 1 && digit === 2) temp += "ยี่";
          else if (pos === 1 && digit === 1) { /* skip */ }
          else if (pos === 0 && digit === 1 && len > 1) temp += "เอ็ด";
          else temp += thaiNumbers[digit];
          
          if (pos > 0) temp += units[pos];
          else if (pos === 1) temp += "สิบ";
      }
      return temp;
  }

  if (bahtPart.length > 6) {
      const millions = bahtPart.substring(0, bahtPart.length - 6);
      const remainder = bahtPart.substring(bahtPart.length - 6);
      bahtText = reader(millions) + 'ล้าน' + reader(remainder);
  } else {
      bahtText = reader(bahtPart);
  }

  if (!bahtText) bahtText = 'ศูนย์';

  let satangText = '';
  if (parseInt(satangPart) > 0) {
    satangText = reader(satangPart) + 'สตางค์';
  }

  return bahtText + 'บาท' + (satangText ? satangText : 'ถ้วน');
};

export const calculateLineItem = (item: LineItem) => {
    const totalLinePrice = item.qty * item.pricePerUnit;
    let discountAmount = 0;

    if (item.discountType === 'percent') {
        discountAmount = totalLinePrice * (item.discountValue / 100);
    } else {
        discountAmount = item.discountValue;
    }
    
    // Ensure discount doesn't exceed total
    discountAmount = Math.min(discountAmount, totalLinePrice);
    
    return {
        totalLinePrice,
        discountAmount,
        netAmount: totalLinePrice - discountAmount
    };
};

export const calculateTotals = (items: LineItem[], vatEnabled: boolean = true, vatRate: number = 7, priceIncludeVat: boolean = false) => {
    let totalGross = 0; // Sum of Line Totals
    let totalDiscount = 0;
    
    items.forEach(item => {
        const { totalLinePrice, discountAmount } = calculateLineItem(item);
        totalGross += totalLinePrice;
        totalDiscount += discountAmount;
    });

    // Net Amount (The final price user expects if Inc VAT, or base if Ex VAT)
    const netAmount = totalGross - totalDiscount;

    let totalExVat = 0;
    let vatAmount = 0;
    let grandTotal = 0;
    let preVatTotal = 0; // For Inc VAT display breakdown

    if (vatEnabled) {
        if (priceIncludeVat) {
            // Case: Prices INCLUDE VAT. Extract VAT.
            // Grand Total is what the user typed/calculated.
            grandTotal = netAmount;
            
            // Calculate Base: Base * 1.07 = GrandTotal
            const baseAmount = grandTotal / (1 + vatRate / 100);
            
            vatAmount = grandTotal - baseAmount;
            
            // For Inc VAT mode, totalExVat (usually used for 'Total' line) 
            // is technically the Gross Input Sum.
            // We'll return logic to support specific display.
            totalExVat = totalGross; 
            preVatTotal = baseAmount; // This is the true tax base
            
        } else {
            // Case: Prices EXCLUDE VAT. Add VAT.
            totalExVat = totalGross;
            // netAmount is taxable base
            vatAmount = netAmount * (vatRate / 100);
            grandTotal = netAmount + vatAmount;
            preVatTotal = netAmount;
        }
    } else {
        totalExVat = totalGross;
        vatAmount = 0;
        grandTotal = netAmount;
        preVatTotal = netAmount;
    }
    
    return {
        totalExVat, 
        totalDiscount,
        subtotalAfterDiscount: netAmount, // This is the Net before/including VAT depending on mode
        vatAmount,
        grandTotal,
        grandTotalText: toThaiBahtText(grandTotal),
        priceIncludeVat,
        preVatTotal
    }
}