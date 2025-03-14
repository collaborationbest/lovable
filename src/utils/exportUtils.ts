import { jsPDF } from "jspdf";

export interface ExportPDFData {
  localInfo?: {
    address: string;
    size: string;
    price: string;
    score: number;
  };
  analysisDetails?: {
    location: number;
    competition: number;
    financial: number;
    potential: number;
  };
  financialProjection?: {
    estimatedRevenue: string;
    setupCosts: string;
    breakEven: string;
    roi: string;
  };
  marketAnalysis?: {
    competition: string;
    patientFlow: string;
    competitorsNearby: string;
    marketSaturation: string;
  };
  doctors?: any[];
  city?: string;
  openingDate?: string;
  checklist?: any[];
  financialData?: {
    initialInvestment: number;
    yearlyRevenue: number;
    yearlyNetProfit: number;
    breakEvenPatientsPerDay: number;
    paybackPeriod: string | number;
  };
}

export const exportToPDF = (data: ExportPDFData, filename: string = "export") => {
  const doc = new jsPDF();
  
  doc.setFontSize(22);
  doc.setTextColor(92, 78, 61);
  
  if (data.localInfo) {
    doc.text("Analyse du Local Professionnel", 105, 20, { align: "center" });
    
    doc.setFontSize(16);
    doc.text("Informations générales", 20, 40);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Adresse: ${data.localInfo.address}`, 20, 50);
    doc.text(`Superficie: ${data.localInfo.size}`, 20, 60);
    doc.text(`Prix: ${data.localInfo.price}`, 20, 70);
    doc.text(`Score global: ${data.localInfo.score}/100`, 20, 80);
    
    if (data.analysisDetails) {
      doc.setFontSize(16);
      doc.setTextColor(92, 78, 61);
      doc.text("Analyse détaillée", 20, 100);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Localisation: ${data.analysisDetails.location}/100`, 20, 110);
      doc.text(`Concurrence: ${data.analysisDetails.competition}/100`, 20, 120);
      doc.text(`Finances: ${data.analysisDetails.financial}/100`, 20, 130);
      doc.text(`Potentiel: ${data.analysisDetails.potential}/100`, 20, 140);
    }
    
    if (data.financialProjection) {
      doc.setFontSize(16);
      doc.setTextColor(92, 78, 61);
      doc.text("Projection financière", 20, 160);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Revenus estimés: ${data.financialProjection.estimatedRevenue}`, 20, 170);
      doc.text(`Coûts d'installation: ${data.financialProjection.setupCosts}`, 20, 180);
      doc.text(`Seuil de rentabilité: ${data.financialProjection.breakEven}`, 20, 190);
      doc.text(`Retour sur investissement: ${data.financialProjection.roi}`, 20, 200);
    }
    
    if (data.marketAnalysis) {
      doc.setFontSize(16);
      doc.setTextColor(92, 78, 61);
      doc.text("Analyse du marché", 20, 220);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Niveau de concurrence: ${data.marketAnalysis.competition}`, 20, 230);
      doc.text(`Flux patient potentiel: ${data.marketAnalysis.patientFlow}`, 20, 240);
      doc.text(`Cabinets à proximité: ${data.marketAnalysis.competitorsNearby}`, 20, 250);
      doc.text(`Saturation du marché: ${data.marketAnalysis.marketSaturation}`, 20, 260);
    }
  } else if (data.doctors) {
    doc.text("Projet de Cabinet", 105, 20, { align: "center" });
    
    doc.setFontSize(16);
    doc.text("Informations générales", 20, 40);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Ville: ${data.city || "Non spécifiée"}`, 20, 50);
    doc.text(`Date d'ouverture: ${data.openingDate || "Non spécifiée"}`, 20, 60);
    doc.text(`Nombre de médecins: ${data.doctors.length}`, 20, 70);
    
    if (data.doctors && data.doctors.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(92, 78, 61);
      doc.text("Équipe médicale", 20, 90);
      
      let yPos = 100;
      data.doctors.forEach((doctor, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}. ${doctor.firstName} ${doctor.lastName} - ${doctor.speciality}`, 20, yPos);
        yPos += 10;
      });
    }
    
    if (data.checklist && data.checklist.length > 0) {
      doc.addPage();
      
      doc.setFontSize(16);
      doc.setTextColor(92, 78, 61);
      doc.text("Feuille de route", 20, 20);
      
      let yPos = 30;
      data.checklist.forEach((item, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}. ${item.title} - ${item.completed ? "Terminé" : "En cours"}`, 20, yPos);
        yPos += 10;
      });
    }
  } else if (data.financialData) {
    doc.text("Business Plan", 105, 20, { align: "center" });
    
    doc.setFontSize(16);
    doc.text("Données financières", 20, 40);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Investissement initial: ${data.financialData.initialInvestment.toLocaleString()} €`, 20, 60);
    doc.text(`Revenu annuel: ${data.financialData.yearlyRevenue.toLocaleString()} €`, 20, 70);
    doc.text(`Bénéfice net annuel: ${data.financialData.yearlyNetProfit.toLocaleString()} €`, 20, 80);
    doc.text(`Seuil de rentabilité (patients/jour): ${String(data.financialData.breakEvenPatientsPerDay)}`, 20, 90);
    doc.text(`Période de remboursement: ${String(data.financialData.paybackPeriod)} ${typeof data.financialData.paybackPeriod === 'number' ? 'années' : ''}`, 20, 100);
  }
  
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Rapport généré le ${new Date().toLocaleDateString()} - Page ${i} sur ${pageCount}`,
      105,
      285,
      { align: "center" }
    );
  }
  
  doc.save(`${filename}.pdf`);
};

export const exportToJSON = (data: any, filename: string = "export") => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  
  const exportFileDefaultName = `${filename}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};
