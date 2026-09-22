import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  fileName?: string;
  onProgress?: (progress: number) => void;
}

export async function generateQuotePDF(
  elementId: string,
  options: PDFExportOptions = {}
): Promise<{ success: boolean; blob?: Blob; error?: string }> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found.`);
    }

    // Temporary styling adjustments for crisp render
    const canvas = await html2canvas(element, {
      scale: 2.5, // High resolution for crisp text & logo
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 800, // Standardize width for consistency
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    
    // Create A4 PDF (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate aspect ratio
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    // Extra pages if long document
    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    const defaultFileName = options.fileName || `Devis_${new Date().toISOString().slice(0, 10)}.pdf`;
    
    // Save to user
    pdf.save(defaultFileName);

    const blob = pdf.output('blob');
    return { success: true, blob };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur lors de la génération du PDF' 
    };
  }
}
