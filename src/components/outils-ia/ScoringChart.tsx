
import { useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";

interface LocalData {
  id: number;
  address: string;
  detailedScores: {
    location: number;
    competition: number;
    financial: number;
    potential: number;
  };
  financialMetrics: {
    estimatedMonthlyRevenue: number;
    operationalCosts: number;
    estimatedSetupCosts: number;
  };
  competitorAnalysis: {
    radius1km: number;
    radius3km: number;
    radius5km: number;
  };
  demographicData: {
    ageGroups: {
      under18: number;
      adults: number;
      seniors: number;
    };
    insuranceCoverage: number;
  };
}

interface ScoringChartProps {
  local: LocalData;
  type: "scores" | "financial" | "competition" | "demographics";
}

const ScoringChart = ({ local, type }: ScoringChartProps) => {
  const chartData = useMemo(() => {
    switch (type) {
      case "scores":
        // Préparer les données pour le graphique de scores
        return [
          { 
            name: "Localisation", 
            score: local.detailedScores.location,
            fill: "#B88E23"
          },
          { 
            name: "Concurrence", 
            score: local.detailedScores.competition,
            fill: "#5C4E3D"
          },
          { 
            name: "Finances", 
            score: local.detailedScores.financial,
            fill: "#8B6B42"
          },
          { 
            name: "Potentiel", 
            score: local.detailedScores.potential,
            fill: "#D4AC63"
          }
        ];
        
      case "financial":
        // Simuler des projections financières sur 5 ans
        const monthlyRevenue = local.financialMetrics.estimatedMonthlyRevenue;
        const monthlyCosts = local.financialMetrics.operationalCosts;
        const initialInvestment = local.financialMetrics.estimatedSetupCosts;
        
        // Simuler une croissance annuelle
        return [
          { 
            name: "Année 1", 
            revenue: monthlyRevenue * 12, 
            costs: monthlyCosts * 12,
            profit: monthlyRevenue * 12 - monthlyCosts * 12,
            investment: initialInvestment
          },
          { 
            name: "Année 2", 
            revenue: monthlyRevenue * 12 * 1.15, 
            costs: monthlyCosts * 12 * 1.05,
            profit: monthlyRevenue * 12 * 1.15 - monthlyCosts * 12 * 1.05,
            investment: 0
          },
          { 
            name: "Année 3", 
            revenue: monthlyRevenue * 12 * 1.25, 
            costs: monthlyCosts * 12 * 1.1,
            profit: monthlyRevenue * 12 * 1.25 - monthlyCosts * 12 * 1.1,
            investment: initialInvestment * 0.2 // Réinvestissement partiel
          },
          { 
            name: "Année 4", 
            revenue: monthlyRevenue * 12 * 1.35, 
            costs: monthlyCosts * 12 * 1.15,
            profit: monthlyRevenue * 12 * 1.35 - monthlyCosts * 12 * 1.15,
            investment: 0
          },
          { 
            name: "Année 5", 
            revenue: monthlyRevenue * 12 * 1.5, 
            costs: monthlyCosts * 12 * 1.2,
            profit: monthlyRevenue * 12 * 1.5 - monthlyCosts * 12 * 1.2,
            investment: initialInvestment * 0.3 // Réinvestissement partiel
          }
        ];
        
      case "competition":
        // Données sur la concurrence par distance
        return [
          { name: "1 km", competitors: local.competitorAnalysis.radius1km },
          { name: "3 km", competitors: local.competitorAnalysis.radius3km },
          { name: "5 km", competitors: local.competitorAnalysis.radius5km }
        ];
        
      case "demographics":
        // Données démographiques
        return [
          { name: "< 18 ans", value: local.demographicData.ageGroups.under18 },
          { name: "Adultes", value: local.demographicData.ageGroups.adults },
          { name: "Seniors", value: local.demographicData.ageGroups.seniors }
        ];
        
      default:
        return [];
    }
  }, [local, type]);

  const COLORS = ["#B88E23", "#5C4E3D", "#8B6B42", "#D4AC63"];

  const renderChart = () => {
    switch (type) {
      case "scores":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5DED3" />
              <XAxis dataKey="name" stroke="#5C4E3D" />
              <YAxis domain={[0, 100]} stroke="#5C4E3D" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#f5f2ee", 
                  border: "1px solid #B88E23",
                  borderRadius: "4px"
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <Bar dataKey="score" fill="#B88E23" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case "financial":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5DED3" />
              <XAxis dataKey="name" stroke="#5C4E3D" />
              <YAxis stroke="#5C4E3D" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#f5f2ee", 
                  border: "1px solid #B88E23",
                  borderRadius: "4px"
                }}
                formatter={(value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)}
              />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <Area type="monotone" dataKey="revenue" stroke="#B88E23" fill="#B88E23" fillOpacity={0.2} />
              <Area type="monotone" dataKey="costs" stroke="#5C4E3D" fill="#5C4E3D" fillOpacity={0.2} />
              <Area type="monotone" dataKey="profit" stroke="#3D8C5C" fill="#3D8C5C" fillOpacity={0.2} />
              <Area type="monotone" dataKey="investment" stroke="#D4756B" fill="#D4756B" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case "competition":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5DED3" />
              <XAxis dataKey="name" stroke="#5C4E3D" />
              <YAxis stroke="#5C4E3D" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#f5f2ee", 
                  border: "1px solid #B88E23",
                  borderRadius: "4px"
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <Bar dataKey="competitors" fill="#5C4E3D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case "demographics":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#f5f2ee", 
                  border: "1px solid #B88E23",
                  borderRadius: "4px"
                }}
                formatter={(value: number) => `${value}%`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      default:
        return null;
    }
  };

  return renderChart();
};

export default ScoringChart;
