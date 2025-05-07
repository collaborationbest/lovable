
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InventoryItem, InventoryCategory } from "@/types/Inventory";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash, Save, Package, AlertTriangle } from "lucide-react";

interface StockItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: InventoryItem | Omit<InventoryItem, 'id'>) => void;
  onDelete?: (id: string) => void;
  item: InventoryItem | null;
  categories: InventoryCategory[];
}

const StockItemDialog: React.FC<StockItemDialogProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  item,
  categories
}) => {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    category: categories.length > 0 ? categories[0].name : '',
    current_stock: 0,
    minimum_stock: 0,
    optimal_stock: 0,
    alert_threshold: 0
  });

  useEffect(() => {
    if (item) {
      setFormData({
        ...item
      });
    } else {
      setFormData({
        name: '',
        category: categories.length > 0 ? categories[0].name : '',
        current_stock: 0,
        minimum_stock: 0,
        optimal_stock: 0,
        alert_threshold: 0
      });
    }
  }, [item, categories]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Handle number inputs
    if (['current_stock', 'minimum_stock', 'optimal_stock', 'alert_threshold', 'price'].includes(name)) {
      setFormData({
        ...formData,
        [name]: name === 'price' ? parseFloat(value) : parseInt(value, 10)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.category) {
      return;
    }
    
    if (item) {
      // Update existing item
      onSave({
        ...item,
        ...formData
      } as InventoryItem);
    } else {
      // Create new item
      onSave({
        ...formData,
        current_stock: formData.current_stock || 0
      } as Omit<InventoryItem, 'id'>);
    }
  };

  const handleDelete = () => {
    if (item && onDelete) {
      onDelete(item.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2 text-[#B88E23]" />
            {item ? 'Modifier le produit' : 'Ajouter un produit'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#5C4E3D]">
                Nom du produit *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                required
                className="border-[#B88E23]/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="text-[#5C4E3D]">
                Catégorie *
              </Label>
              <select
                id="category"
                name="category"
                value={formData.category || ''}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-[#B88E23]/30 px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B88E23]/20"
              >
                {categories.length === 0 ? (
                  <option value="">Aucune catégorie disponible</option>
                ) : (
                  categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reference" className="text-[#5C4E3D]">
                Référence
              </Label>
              <Input
                id="reference"
                name="reference"
                value={formData.reference || ''}
                onChange={handleChange}
                className="border-[#B88E23]/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manufacturer" className="text-[#5C4E3D]">
                Fabricant
              </Label>
              <Input
                id="manufacturer"
                name="manufacturer"
                value={formData.manufacturer || ''}
                onChange={handleChange}
                className="border-[#B88E23]/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="distributor" className="text-[#5C4E3D]">
                Distributeur
              </Label>
              <Input
                id="distributor"
                name="distributor"
                value={formData.distributor || ''}
                onChange={handleChange}
                className="border-[#B88E23]/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-[#5C4E3D]">
                Unité
              </Label>
              <Input
                id="unit"
                name="unit"
                value={formData.unit || ''}
                onChange={handleChange}
                placeholder="Ex: pcs, boîtes, ml..."
                className="border-[#B88E23]/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="current_stock" className="text-[#5C4E3D]">
                Stock actuel *
              </Label>
              <Input
                id="current_stock"
                name="current_stock"
                type="number"
                min="0"
                value={formData.current_stock}
                onChange={handleChange}
                required
                className="border-[#B88E23]/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minimum_stock" className="text-[#5C4E3D]">
                Stock minimum
              </Label>
              <Input
                id="minimum_stock"
                name="minimum_stock"
                type="number"
                min="0"
                value={formData.minimum_stock || ''}
                onChange={handleChange}
                className="border-[#B88E23]/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="optimal_stock" className="text-[#5C4E3D]">
                Stock optimal
              </Label>
              <Input
                id="optimal_stock"
                name="optimal_stock"
                type="number"
                min="0"
                value={formData.optimal_stock || ''}
                onChange={handleChange}
                className="border-[#B88E23]/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alert_threshold" className="text-[#5C4E3D]">
                Seuil d'alerte
              </Label>
              <Input
                id="alert_threshold"
                name="alert_threshold"
                type="number"
                min="0"
                value={formData.alert_threshold || ''}
                onChange={handleChange}
                className="border-[#B88E23]/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price" className="text-[#5C4E3D]">
                Prix unitaire (€)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price || ''}
                onChange={handleChange}
                className="border-[#B88E23]/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expiry_date" className="text-[#5C4E3D]">
                Date d'expiration
              </Label>
              <Input
                id="expiry_date"
                name="expiry_date"
                type="date"
                value={formData.expiry_date || ''}
                onChange={handleChange}
                className="border-[#B88E23]/30"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-[#5C4E3D]">
              Notes
            </Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={3}
              className="border-[#B88E23]/30"
            />
          </div>
          
          <DialogFooter className="flex items-center justify-between">
            {item && onDelete ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    className="mr-auto"
                  >
                    <Trash className="h-4 w-4 mr-1" /> Supprimer
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                      Supprimer le produit
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <div></div>
            )}
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-[#B88E23]/30"
              >
                Annuler
              </Button>
              <Button type="submit" className="bg-[#B88E23] hover:bg-[#A17D1F]">
                <Save className="h-4 w-4 mr-1" /> Enregistrer
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StockItemDialog;
