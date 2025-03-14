import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, FileText, DollarSign, Users, Navigation, Target, TrendingUp } from "lucide-react";

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
  detailedScores: {
    location: number;
    competition: number;
    financial: number;
    potential: number;
  };
  competitorAnalysis: {
    totalCompetitors: number;
  };
}

interface LocalComparisonTableProps {
  locals: LocalData[];
  onRemove: (id: number) => void;
  onSelect: (local: LocalData) => void;
}

const LocalComparisonTable = ({ locals, onRemove, onSelect }: LocalComparisonTableProps) => {
  // Identifier le meilleur pour chaque catégorie
  const getBestInCategory = (category: keyof LocalData) => {
    if (locals.length === 0) return -1;
    
    let bestIndex = 0;
    let bestValue: number = 0;
    
    // Initialize bestValue based on category type
    if (typeof locals[0][category] === 'number') {
      bestValue = locals[0][category] as number;
    }
    
    locals.forEach((local, index) => {
      const currentValue = local[category];
      
      // Skip if not a number
      if (typeof currentValue !== 'number') return;
      
      if (category === 'score' || category === 'potentialRevenue' || category === 'patientFlow') {
        // Pour ces catégories, la valeur la plus élevée est la meilleure
        if (currentValue > bestValue) {
          bestValue = currentValue;
          bestIndex = index;
        }
      } else if (category === 'price') {
        // Pour le prix, la valeur la plus basse est la meilleure
        if (currentValue < bestValue) {
          bestValue = currentValue;
          bestIndex = index;
        }
      } else if (category === 'roi') {
        // Pour le ROI, la valeur la plus basse est la meilleure
        if (currentValue < bestValue) {
          bestValue = currentValue;
          bestIndex = index;
        }
      }
    });
    
    return bestIndex;
  };
  
  const getBestDetailed = (category: keyof LocalData['detailedScores']) => {
    if (locals.length === 0) return -1;
    
    let bestIndex = 0;
    let bestValue = locals[0].detailedScores[category];
    
    locals.forEach((local, index) => {
      if (local.detailedScores[category] > bestValue) {
        bestValue = local.detailedScores[category];
        bestIndex = index;
      }
    });
    
    return bestIndex;
  };

  const bestScore = getBestInCategory('score');
  const bestLocation = getBestDetailed('location');
  const bestCompetition = getBestDetailed('competition');
  const bestFinancial = getBestDetailed('financial');
  const bestPotential = getBestDetailed('potential');
  const bestPrice = getBestInCategory('price');
  const bestRoi = getBestInCategory('roi');
  const bestPatientFlow = getBestInCategory('patientFlow');

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-[#5C4E3D]">
              Comparaison détaillée des locaux
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Adresse</TableHead>
                  <TableHead>Score IA</TableHead>
                  <TableHead>Surface/Prix</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Concurrence</TableHead>
                  <TableHead>Finances</TableHead>
                  <TableHead>Potentiel</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locals.map((local, index) => (
                  <TableRow key={local.id}>
                    <TableCell className="font-medium text-[#5C4E3D]">
                      {local.address.split(',')[0]}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className={`h-8 w-8 rounded-full ${index === bestScore ? 'bg-[#B88E23]' : 'bg-[#B88E23]/60'} text-white flex items-center justify-center font-semibold`}>
                          {local.score}
                        </div>
                        {index === bestScore && (
                          <Badge variant="outline" className="bg-[#B88E23]/10 text-[#B88E23] text-xs">
                            Top
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <span>{local.size} m²</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign className="h-3 w-3 text-[#B88E23]" />
                          <span className={index === bestPrice ? 'font-medium text-[#B88E23]' : ''}>
                            {local.price.toLocaleString()} €
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`text-sm ${index === bestLocation ? 'font-medium text-[#B88E23]' : ''}`}>
                        {local.detailedScores.location}/100
                      </div>
                      <div className="w-full bg-[#f5f2ee] h-1.5 rounded-full mt-1">
                        <div 
                          className={`h-full rounded-full ${index === bestLocation ? 'bg-[#B88E23]' : 'bg-[#B88E23]/60'}`} 
                          style={{ width: `${local.detailedScores.location}%` }}
                        ></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`text-sm ${index === bestCompetition ? 'font-medium text-[#B88E23]' : ''}`}>
                        {local.detailedScores.competition}/100
                      </div>
                      <div className="w-full bg-[#f5f2ee] h-1.5 rounded-full mt-1">
                        <div 
                          className={`h-full rounded-full ${index === bestCompetition ? 'bg-[#B88E23]' : 'bg-[#B88E23]/60'}`} 
                          style={{ width: `${local.detailedScores.competition}%` }}
                        ></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`text-sm ${index === bestFinancial ? 'font-medium text-[#B88E23]' : ''}`}>
                        {local.detailedScores.financial}/100
                      </div>
                      <div className="w-full bg-[#f5f2ee] h-1.5 rounded-full mt-1">
                        <div 
                          className={`h-full rounded-full ${index === bestFinancial ? 'bg-[#B88E23]' : 'bg-[#B88E23]/60'}`} 
                          style={{ width: `${local.detailedScores.financial}%` }}
                        ></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`text-sm ${index === bestPotential ? 'font-medium text-[#B88E23]' : ''}`}>
                        {local.detailedScores.potential}/100
                      </div>
                      <div className="w-full bg-[#f5f2ee] h-1.5 rounded-full mt-1">
                        <div 
                          className={`h-full rounded-full ${index === bestPotential ? 'bg-[#B88E23]' : 'bg-[#B88E23]/60'}`} 
                          style={{ width: `${local.detailedScores.potential}%` }}
                        ></div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onSelect(local)}
                          className="h-8 w-8"
                        >
                          <FileText className="h-4 w-4 text-[#5C4E3D]" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onRemove(local.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4 text-[#5C4E3D]" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-[#5C4E3D]">
            Indicateurs clés de performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {locals.map((local, index) => (
              <div key={local.id} className="space-y-3 border rounded-lg p-3 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-[#5C4E3D]">{local.address.split(',')[0]}</h4>
                  <div className={`h-6 w-6 rounded-full ${index === bestScore ? 'bg-[#B88E23]' : 'bg-[#B88E23]/60'} text-white flex items-center justify-center text-xs font-semibold`}>
                    {local.score}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-[#B88E23]" />
                      <span className="text-xs font-medium text-[#5C4E3D]">ROI</span>
                    </div>
                    <p className={`text-xs ${index === bestRoi ? 'font-medium text-[#B88E23]' : 'text-[#454240]'}`}>
                      {local.roi.toFixed(1)} ans
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-[#B88E23]" />
                      <span className="text-xs font-medium text-[#5C4E3D]">Patients</span>
                    </div>
                    <p className={`text-xs ${index === bestPatientFlow ? 'font-medium text-[#B88E23]' : 'text-[#454240]'}`}>
                      {local.patientFlow}/jour
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-[#B88E23]" />
                      <span className="text-xs font-medium text-[#5C4E3D]">Concurrence</span>
                    </div>
                    <p className="text-xs text-[#454240]">
                      {local.competitorAnalysis.totalCompetitors} cabinets
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-[#B88E23]" />
                      <span className="text-xs font-medium text-[#5C4E3D]">Potentiel</span>
                    </div>
                    <p className="text-xs text-[#454240]">
                      {local.growthPotential}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocalComparisonTable;
