import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GiftcardStatus, Giftcard } from '../types';

// Combine Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format dates with localization
export function formatDate(date: string | Date, formatStr = 'dd/MM/yyyy', locale = 'es'): string {
  try {
    let dateObj: Date;
    
    if (typeof date?.toDate === 'function') {
      // Es un Timestamp de Firestore
      dateObj = date.toDate();
    } else if (typeof date === 'string') {
      // Es una cadena de fecha
      dateObj = parseISO(date);
      // Verificar si la fecha es válida
      if (isNaN(dateObj.getTime())) {
        console.warn('⚠️ Fecha inválida recibida:', date);
        return 'Fecha inválida';
      }
    } else if (date instanceof Date) {
      // Ya es un objeto Date
      dateObj = date;
      if (isNaN(dateObj.getTime())) {
        console.warn('⚠️ Objeto Date inválido:', date);
        return 'Fecha inválida';
      }
    } else {
      console.warn('⚠️ Tipo de fecha no reconocido:', typeof date, date);
      return 'Fecha inválida';
    }

    return format(dateObj, formatStr, { locale: locale === 'es' ? es : enUS });
  } catch (error) {
    console.error('❌ Error formateando fecha:', error, 'Fecha original:', date);
    return 'Error en fecha';
  }
}

// Format currency for Chilean pesos
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(amount);
}

// Calculate days left until expiration
export function daysUntilExpiration(expirationDate: string | undefined): number | null {
  if (!expirationDate) return null;
  
  const expDate = parseISO(expirationDate);
  const today = new Date();
  
  return differenceInDays(expDate, today);
}

// Check if a giftcard is about to expire (within the next n days)
export function isAboutToExpire(expirationDate: string | undefined, days = 15): boolean {
  const daysLeft = daysUntilExpiration(expirationDate);
  if (daysLeft === null) return false;
  
  return daysLeft >= 0 && daysLeft <= days;
}

// Translate status to Spanish
export function translateStatus(status: GiftcardStatus, locale = 'es'): string {
  if (locale === 'es') {
    const statusMap: Record<GiftcardStatus, string> = {
      created_not_delivered: 'Creada pero no Entregada',
      delivered: 'Entregada',
      redeemed: 'Cobrada',
      cancelled: 'Anulada'
    };
    return statusMap[status];
  } else {
    const statusMap: Record<GiftcardStatus, string> = {
      created_not_delivered: 'Created but not Delivered',
      delivered: 'Delivered',
      redeemed: 'Redeemed',
      cancelled: 'Cancelled'
    };
    return statusMap[status];
  }
}

// Generate a random unique numeric code
export function generateGiftcardNumber(existingNumbers: string[]): string {
  let number: string;
  let attempts = 0;
  const maxAttempts = 100;
  
  console.log('🎲 Generando número único, números existentes:', existingNumbers.length);
  
  do {
    attempts++;
    
    // Generar un número aleatorio entre 10000000 y 99999999 (8 dígitos)
    const randomNum = Math.floor(Math.random() * 90000000) + 10000000;
    number = String(randomNum);
    
    console.log(`🎲 Intento ${attempts}: ${number}`);
    
    // Si no hay números existentes o después de muchos intentos, usar el número generado
    if (existingNumbers.length === 0 || attempts >= maxAttempts) {
      console.log('✅ Número aceptado (sin conflictos o máximo intentos alcanzado)');
      break;
    }
    
    if (existingNumbers.includes(number)) {
      console.log('⚠️ Número ya existe, generando otro...');
    }
    
  } while (existingNumbers.includes(number));
  
  if (attempts >= maxAttempts) {
    console.warn('⚠️ Se alcanzó el máximo de intentos para generar número único, usando:', number);
  }
  
  console.log('🎯 Número final generado:', number);
  return number;
}

// Export giftcards to PDF
export function exportToPDF(giftcards: Giftcard[], locale = 'es'): void {
  const doc = new jsPDF();
  
  // Add title
  const title = locale === 'es' ? 'Reporte de Giftcards' : 'Giftcard Report';
  doc.setFontSize(16);
  doc.text(title, 14, 15);
  
  // Add subtitle with date
  const dateStr = formatDate(new Date(), 'dd/MM/yyyy HH:mm', locale);
  const subtitle = locale === 'es' ? `Generado el ${dateStr}` : `Generated on ${dateStr}`;
  doc.setFontSize(10);
  doc.text(subtitle, 14, 22);
  
  // Define table headers
  const headers = locale === 'es' 
    ? [['Número', 'Estado', 'Comprador', 'Destinatario', 'Monto', 'Fecha creación', 'Fecha vencimiento']]
    : [['Number', 'Status', 'Buyer', 'Recipient', 'Amount', 'Creation Date', 'Expiration Date']];
  
  // Prepare data
  const data = giftcards.map(g => [
    g.number,
    translateStatus(g.status, locale),
    g.buyer.name,
    g.recipient.name,
    formatCurrency(g.amount),
    formatDate(g.createdAt, 'dd/MM/yyyy', locale),
    g.expiresAt ? formatDate(g.expiresAt, 'dd/MM/yyyy', locale) : '-'
  ]);
  
  // Create table
  autoTable(doc, {
    head: headers,
    body: data,
    startY: 25,
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    }
  });
  
  // Save the PDF
  const filename = locale === 'es' ? 'reporte-giftcards.pdf' : 'giftcard-report.pdf';
  doc.save(filename);
}

// Export giftcards to CSV
export function exportToCSV(giftcards: Giftcard[], locale = 'es'): void {
  // Define headers
  const headers = locale === 'es'
    ? ['Número', 'Estado', 'Comprador', 'Destinatario', 'Monto', 'Fecha creación', 'Fecha vencimiento']
    : ['Number', 'Status', 'Buyer', 'Recipient', 'Amount', 'Creation Date', 'Expiration Date'];
  
  // Prepare data
  const data = giftcards.map(g => [
    g.number,
    translateStatus(g.status, locale),
    g.buyer.name,
    g.recipient.name,
    g.amount,
    formatDate(g.createdAt, 'dd/MM/yyyy', locale),
    g.expiresAt ? formatDate(g.expiresAt, 'dd/MM/yyyy', locale) : ''
  ]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  // Create download link
  const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', locale === 'es' ? 'giftcards.csv' : 'giftcards.csv');
  document.body.appendChild(link);
  
  // Trigger download and remove link
  link.click();
  document.body.removeChild(link);
}