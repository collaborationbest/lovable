
import React from "react";
import { InventoryItem, InventoryCategory, StockStatus } from "@/types/Inventory";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Package } from "lucide-react";

interface StockItemsListProps {
  items: InventoryItem[];
  categories: InventoryCategory[];
  onItemSelect: (item: InventoryItem) => void;
}

const StockItemsList: React.FC<StockItemsListProps> = ({ 
  items, 
  categories,
  onItemSelect 
}) => {
  const getCategoryColor = (categoryName: string): string => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.color || "#B88E23";
  };
  
  const getStockStatus = (item: InventoryItem): StockStatus => {
    if (item.current_stock <= (item.alert_threshold || 0)) {
      return 'low';
    } else if (
      item.optimal_stock !== undefined && 
      item.optimal_stock > 0 && 
      item.current_stock >= item.optimal_stock
    ) {
      return 'optimal';
    }
    return 'normal';
  };
  
  const getStockStatusDisplay = (status: StockStatus) => {
    switch (status) {
      case 'low':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
          badge: <Badge variant="outline" className="border-red-500 text-red-500 bg-red-50">Stock bas</Badge>
        };
      case 'optimal':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          badge: <Badge variant="outline" className="border-green-500 text-green-500 bg-green-50">Optimal</Badge>
        };
      default:
        return {
          icon: <Package className="h-4 w-4 text-[#B88E23]" />,
          badge: <Badge variant="outline" className="border-[#B88E23] text-[#B88E23] bg-[#F5F2EE]">Normal</Badge>
        };
    }
  };
  
  const formatCurrency = (price?: number) => {
    if (price === undefined) return "-";
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#B88E23]/10 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Référence</TableHead>
              <TableHead>Fabricant</TableHead>
              <TableHead className="text-right">Stock actuel</TableHead>
              <TableHead className="text-right">Stock minimum</TableHead>
              <TableHead className="text-center">Statut</TableHead>
              <TableHead className="text-right">Prix unitaire</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-[#5C4E3D]/50">
                  Aucun produit trouvé
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const status = getStockStatus(item);
                const statusDisplay = getStockStatusDisplay(status);
                
                return (
                  <TableRow 
                    key={item.id}
                    className="cursor-pointer hover:bg-[#F5F2EE]"
                    onClick={() => onItemSelect(item)}
                  >
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <div 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs"
                        style={{ 
                          backgroundColor: `${getCategoryColor(item.category)}20`,
                          color: getCategoryColor(item.category)
                        }}
                      >
                        {item.category}
                      </div>
                    </TableCell>
                    <TableCell>{item.reference || "-"}</TableCell>
                    <TableCell>{item.manufacturer || "-"}</TableCell>
                    <TableCell className="text-right font-medium">
                      {item.current_stock} {item.unit && <span className="text-xs text-[#5C4E3D]/50">{item.unit}</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.minimum_stock !== undefined ? item.minimum_stock : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {statusDisplay.badge}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.price)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StockItemsList;
