
import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { InventoryItem } from "@/types/Inventory";
import { AlertTriangle, Package, CheckCircle, PieChart as PieChartIcon } from "lucide-react";

interface StockOverviewProps {
  inventoryItems: InventoryItem[];
}

const StockOverview: React.FC<StockOverviewProps> = ({ inventoryItems }) => {
  const stockStats = useMemo(() => {
    const lowStockCount = inventoryItems.filter(
      item => item.current_stock <= (item.alert_threshold || 0)
    ).length;
    
    const optimalStockCount = inventoryItems.filter(
      item => item.current_stock >= (item.optimal_stock || 0) && item.optimal_stock !== undefined && item.optimal_stock > 0
    ).length;
    
    const normalStockCount = inventoryItems.length - lowStockCount - optimalStockCount;
    
    return { lowStockCount, normalStockCount, optimalStockCount, total: inventoryItems.length };
  }, [inventoryItems]);
  
  const pieData = [
    { name: "Stock optimal", value: stockStats.optimalStockCount, color: "#10B981" },
    { name: "Stock normal", value: stockStats.normalStockCount, color: "#B88E23" },
    { name: "Stock bas", value: stockStats.lowStockCount, color: "#EF4444" },
  ];
  
  const stats = [
    {
      title: "Stock bas",
      value: stockStats.lowStockCount,
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      color: "text-red-500",
      bgColor: "bg-red-50"
    },
    {
      title: "Total produits",
      value: stockStats.total,
      icon: <Package className="h-5 w-5 text-[#B88E23]" />,
      color: "text-[#B88E23]",
      bgColor: "bg-[#F5F2EE]"
    },
    {
      title: "Stock optimal",
      value: stockStats.optimalStockCount,
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#B88E23]/10 overflow-hidden">
      <div className="p-4 border-b border-[#B88E23]/10">
        <h3 className="text-lg font-medium text-[#5C4E3D] flex items-center">
          <PieChartIcon className="h-5 w-5 mr-2 text-[#B88E23]" />
          Aperçu du stock
        </h3>
      </div>
      
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 flex flex-col space-y-4">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={`flex items-center p-3 rounded-lg ${stat.bgColor}`}
            >
              <div className="mr-3">
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-[#5C4E3D]/70">{stat.title}</p>
                <p className={`text-xl font-semibold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="col-span-1 md:col-span-2 h-64">
          {stockStats.total > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => 
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-[#5C4E3D]/50">Aucune donnée disponible</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockOverview;
