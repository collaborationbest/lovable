
import React from "react";
import { FileText, Download, MapPin, BarChart, Navigation, Users, Target, DollarSign, Calendar, Building, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ScoringChart from "./ScoringChart";

interface LocalData {
  id: number;
  address: string;
  price: number;
  size: number;
  score: number;
  potentialRevenue: number;
  patientFlow: number;
  roi: number;
  competition: string;
  accessibility: string;
  growthPotential: string;
  nearbyFacilities: string[];
  populationDensity: string;
  avgIncome: number;
  transportations: string[];
  demographicData: {
    ageGroups: {
      under18: number;
      adults: number;
      seniors: number;
    };
    insuranceCoverage: number;
  };
  competitorAnalysis: {
    totalCompetitors: number;
    radius1km: number;
    radius3km: number;
    radius5km: number;
    marketSaturation: number;
  };
  financialMetrics: {
    squareMeterPrice: number;
    estimatedMonthlyRevenue: number;
    estimatedSetupCosts: number;
    breakEvenMonths: number;
    operationalCosts: number;
  };
  localAttributes: {
    renovationNeeded: string;
    accessibilityScore: number;
    parkingAvailability: string;
    publicTransitScore: number;
    medicalStandardsCompliance: number;
  };
  detailedScores: {
    location: number;
    competition: number;
    financial: number;
    potential: number;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface LocalDetailReportProps {
  local: LocalData;
  onExport: () => void;
  onCompare: () => void;
}

const LocalDetailReport = ({ local, onExport, onCompare }: LocalDetailReportProps) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-medium text-[#5C4E3D]">Rapport Détaillé</h2>
          <p className="text-sm text-[#454240]">
            {local.address}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="text-[#5C4E3D] border-[#B88E23]/20 hover:bg-[#B88E23]/10"
            onClick={onCompare}
          >
            <BarChart className="h-4 w-4 mr-1" />
            Ajouter à la comparaison
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="text-[#5C4E3D] border-[#B88E23]/20 hover:bg-[#B88E23]/10"
            onClick={onExport}
          >
            <Download className="h-4 w-4 mr-1" />
            Exporter PDF
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium text-[#5C4E3D]">
                  Score Global IA
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-[#B88E23] text-white flex items-center justify-center font-semibold">
                  {local.score}
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ScoringChart 
                local={local}
                type="scores"
              />
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#5C4E3D]">
                  Caractéristiques du Local
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-[#B88E23]/10">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-[#B88E23]" />
                      <span className="text-sm text-[#454240]">Surface</span>
                    </div>
                    <span className="font-medium">{local.size} m²</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-[#B88E23]/10">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-[#B88E23]" />
                      <span className="text-sm text-[#454240]">Prix</span>
                    </div>
                    <span className="font-medium">{local.price.toLocaleString()} €</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-[#B88E23]/10">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#B88E23]" />
                      <span className="text-sm text-[#454240]">Localisation</span>
                    </div>
                    <Badge className="bg-[#B88E23]/10 text-[#B88E23] hover:bg-[#B88E23]/20">
                      {local.detailedScores.location}/100
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-[#B88E23]/10">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-[#B88E23]" />
                      <span className="text-sm text-[#454240]">Croissance</span>
                    </div>
                    <span className="font-medium">{local.growthPotential}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#B88E23]" />
                      <span className="text-sm text-[#454240]">Délai de rentabilité</span>
                    </div>
                    <span className="font-medium">{local.financialMetrics.breakEvenMonths} mois</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#5C4E3D]">
                  Analyse de la Concurrence
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[240px]">
                <ScoringChart 
                  local={local}
                  type="competition"
                />
                <div className="mt-4 pt-4 border-t border-[#B88E23]/10">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#454240]">Saturation du marché</span>
                    <span className="font-medium">
                      {(local.competitorAnalysis.marketSaturation * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#5C4E3D]">
                Informations Démographiques
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[240px]">
              <ScoringChart 
                local={local}
                type="demographics"
              />
              <div className="mt-4 pt-4 border-t border-[#B88E23]/10">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#454240]">Couverture assurance</span>
                  <span className="font-medium">{local.demographicData.insuranceCoverage}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#5C4E3D]">
                Accessibilité et Transport
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-[#B88E23]/10">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-[#B88E23]" />
                    <span className="text-sm text-[#454240]">Accessibilité globale</span>
                  </div>
                  <span className="font-medium">{local.accessibility}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-[#B88E23]/10">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#B88E23]" />
                    <span className="text-sm text-[#454240]">Accessibilité PMR</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-[#f5f2ee] h-1.5 rounded-full mr-2">
                      <div 
                        className="h-full rounded-full bg-[#B88E23]" 
                        style={{ width: `${(local.localAttributes.accessibilityScore / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span>{local.localAttributes.accessibilityScore}/10</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-[#B88E23]/10">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-[#B88E23]" />
                    <span className="text-sm text-[#454240]">Transport public</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-[#f5f2ee] h-1.5 rounded-full mr-2">
                      <div 
                        className="h-full rounded-full bg-[#B88E23]" 
                        style={{ width: `${(local.localAttributes.publicTransitScore / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span>{local.localAttributes.publicTransitScore}/10</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#B88E23]" />
                    <span className="text-sm text-[#454240]">Parking disponible</span>
                  </div>
                  <span className="font-medium">{local.localAttributes.parkingAvailability}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#5C4E3D]">
                Équipements à Proximité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {local.nearbyFacilities.map((facility, index) => (
                  <Badge key={index} variant="outline" className="bg-[#f5f2ee]">
                    {facility}
                  </Badge>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[#B88E23]/10">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#454240]">Revenus moyens</span>
                  <span className="font-medium">{local.avgIncome.toLocaleString()} €/an</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LocalDetailReport;
