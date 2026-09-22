import { Quote, CompanyProfile } from '../types';
import { formatFCFA, formatDateFR, cleanPhoneForWhatsApp } from './formatters';
import { calculateQuoteFinancials } from './formatters';

// Generate a professional WhatsApp message in French
export function generateWhatsAppMessage(quote: Quote, company: CompanyProfile): string {
  const financials = calculateQuoteFinancials(quote);
  const clientName = quote.client.name || 'Client';
  const companyName = company.name || 'Notre Entreprise';

  let message = `*DEVIS N° ${quote.quoteNumber}*\n`;
  message += `🏢 *${companyName}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `Bonjour *${clientName}*,\n\n`;
  message += `Veuillez trouver ci-dessous l'estimation pour votre demande :\n\n`;

  // Items list
  message += `📋 *DÉTAIL DES PRESTATIONS :*\n`;
  quote.items.forEach((item, index) => {
    const totalLine = item.quantity * item.unitPrice;
    message += `${index + 1}. *${item.description}*\n`;
    if (item.details) {
      message += `   _${item.details}_\n`;
    }
    message += `   Quantité : ${item.quantity} ${item.unit} | Prix unitaire : ${formatFCFA(item.unitPrice)}\n`;
    message += `   Sous-total : *${formatFCFA(totalLine)}*\n\n`;
  });

  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *RÉCAPITULATIF FINANCIER :*\n`;
  message += `• Montant Total : *${formatFCFA(financials.totalAmount)}*\n`;
  
  if (quote.depositPercent > 0) {
    message += `• Acompte demandé (${quote.depositPercent}%) : *${formatFCFA(financials.depositAmount)}*\n`;
    message += `• Solde restant : *${formatFCFA(financials.remainingBalance)}*\n`;
  }

  message += `• Validité de l'offre : jusqu'au *${formatDateFR(quote.validUntil)}*\n\n`;

  // Active Payment Methods (Wave, Orange Money, etc.)
  const activePayments = (company.payments || []).filter(p => p.active && p.numberOrRib);
  if (activePayments.length > 0) {
    message += `💳 *MODES DE PAIEMENT ACCEPTÉS :*\n`;
    activePayments.forEach(p => {
      let icon = '📱';
      if (p.type === 'wave') icon = '🌊 Wave :';
      else if (p.type === 'orange_money') icon = '🍊 Orange Money :';
      else if (p.type === 'free_money') icon = '🟢 Free Money :';
      else if (p.type === 'bank_transfer') icon = '🏦 Virement Bancaire :';
      else icon = '💵';
      
      message += `${icon} *${p.numberOrRib}* ${p.holderName ? `(${p.holderName})` : ''}\n`;
    });
    message += `\n`;
  }

  if (quote.notes) {
    message += `📝 *Notes :* ${quote.notes}\n\n`;
  }

  message += `Pour confirmer ce devis ou pour toute question, n'hésitez pas à nous répondre directement sur ce numéro.\n\n`;
  message += `Merci de votre confiance ! ✨\n`;
  message += `_${companyName}_ | ${company.phone}`;

  return message;
}

// Generate WhatsApp Direct URL
export function getWhatsAppShareUrl(quote: Quote, company: CompanyProfile, targetPhone?: string): string {
  const rawPhone = targetPhone || quote.client.phone || '';
  const cleanedPhone = cleanPhoneForWhatsApp(rawPhone);
  const text = encodeURIComponent(generateWhatsAppMessage(quote, company));

  if (cleanedPhone) {
    return `https://wa.me/${cleanedPhone}?text=${text}`;
  }
  return `https://wa.me/?text=${text}`;
}

// Generate Email Mailto URL
export function getEmailShareUrl(quote: Quote, company: CompanyProfile): string {
  const financials = calculateQuoteFinancials(quote);
  const clientEmail = quote.client.email || '';
  const subject = encodeURIComponent(`Devis ${quote.quoteNumber} - ${company.name || 'Devis'}`);
  
  const bodyText = generateWhatsAppMessage(quote, company)
    .replace(/\*/g, '') // remove markdown bold for standard text
    .replace(/_/g, '');

  const body = encodeURIComponent(bodyText);

  return `mailto:${clientEmail}?subject=${subject}&body=${body}`;
}

// Open Native Web Share API if supported
export async function shareNativeQuote(quote: Quote, company: CompanyProfile, pdfBlob?: Blob) {
  const text = generateWhatsAppMessage(quote, company);
  const title = `Devis ${quote.quoteNumber} - ${company.name}`;

  if (navigator.share) {
    try {
      const shareData: ShareData = {
        title,
        text,
      };

      if (pdfBlob && navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], `Devis_${quote.quoteNumber}.pdf`, { type: 'application/pdf' })] })) {
        shareData.files = [new File([pdfBlob], `Devis_${quote.quoteNumber}.pdf`, { type: 'application/pdf' })];
      }

      await navigator.share(shareData);
      return true;
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Share error', err);
      }
      return false;
    }
  }
  return false;
}
