import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Settings, Search } from "lucide-react";
import VendorSettingsDialog, { Vendor } from "./VendorSettingsDialog";

interface Order {
  id: string;
  supplierName: string;
  productName: string;
  quantity: number;
  urgency: "standard" | "urgent" | "critical";
  orderDate: string;
  notes: string;
  status: "pending" | "ordered" | "received";
}

interface OrderManagementProps {
  searchQuery?: string;
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isVendorSettingsOpen, setIsVendorSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [vendors] = useLocalStorage<Vendor[]>("supplyVendors", []);
  const [newOrder, setNewOrder] = useState<Omit<Order, "id">>({
    supplierName: "",
    productName: "",
    quantity: 1,
    urgency: "standard",
    orderDate: new Date().toISOString().split("T")[0],
    notes: "",
    status: "pending"
  });

  const handleAddOrder = () => {
    if (!newOrder.supplierName || !newOrder.productName) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    
    const order: Order = {
      ...newOrder,
      id: Date.now().toString()
    };
    
    setOrders([...orders, order]);
    setNewOrder({
      supplierName: "",
      productName: "",
      quantity: 1,
      urgency: "standard",
      orderDate: new Date().toISOString().split("T")[0],
      notes: "",
      status: "pending"
    });
    setIsDialogOpen(false);
    
    toast.success(`La commande de ${order.productName} a été ajoutée.`);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "À commander";
      case "ordered": return "Commandée";
      case "received": return "Reçue";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "ordered": return "bg-blue-100 text-blue-800";
      case "received": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "standard": return "Standard";
      case "urgent": return "Urgent";
      case "critical": return "Critique";
      default: return urgency;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "standard": return "bg-gray-100 text-gray-800";
      case "urgent": return "bg-orange-100 text-orange-800";
      case "critical": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.name : vendorId;
  };

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const vendorName = getVendorName(order.supplierName).toLowerCase();
    
    return (
      order.productName.toLowerCase().includes(searchLower) ||
      vendorName.includes(searchLower) ||
      order.notes.toLowerCase().includes(searchLower) ||
      getStatusLabel(order.status).toLowerCase().includes(searchLower) ||
      getUrgencyLabel(order.urgency).toLowerCase().includes(searchLower) ||
      order.quantity.toString().includes(searchLower)
    );
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Gestion des commandes</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setIsVendorSettingsOpen(true)} title="Paramètres des fournisseurs">
            <Settings className="h-4 w-4" />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Ajouter une commande</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvelle commande</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="supplierName" className="text-right">
                    Fournisseur
                  </Label>
                  <Select 
                    onValueChange={(value) => setNewOrder({ ...newOrder, supplierName: value })}
                    value={newOrder.supplierName}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner un fournisseur" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.length > 0 ? (
                        vendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-vendors" disabled>
                          Aucun fournisseur disponible
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="productName" className="text-right">
                    Produit
                  </Label>
                  <Input
                    id="productName"
                    value={newOrder.productName}
                    onChange={(e) => setNewOrder({ ...newOrder, productName: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">
                    Quantité
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder({ ...newOrder, quantity: parseInt(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="urgency" className="text-right">
                    Urgence
                  </Label>
                  <Select
                    value={newOrder.urgency}
                    onValueChange={(value) => setNewOrder({ ...newOrder, urgency: value as "standard" | "urgent" | "critical" })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionnez le niveau d'urgence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="critical">Critique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Informations complémentaires"
                    value={newOrder.notes}
                    onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddOrder}>
                  Ajouter
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher des commandes..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <VendorSettingsDialog 
        open={isVendorSettingsOpen} 
        onOpenChange={setIsVendorSettingsOpen} 
      />

      {filteredOrders.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-md">
          <p className="text-muted-foreground">
            {orders.length === 0 
              ? "Aucune commande enregistrée. Commencez par en ajouter une." 
              : "Aucune commande ne correspond à votre recherche."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{order.productName}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center">
                    <span className="text-sm font-medium w-28">Fournisseur:</span>
                    <span className="text-sm">{getVendorName(order.supplierName)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium w-28">Quantité:</span>
                    <span className="text-sm">{order.quantity}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium w-28">Date:</span>
                    <span className="text-sm">{new Date(order.orderDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium w-28">Urgence:</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(order.urgency)}`}>
                      {getUrgencyLabel(order.urgency)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium w-28">Statut:</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  {order.notes && (
                    <div className="mt-2">
                      <span className="text-sm font-medium">Notes:</span>
                      <p className="text-sm text-muted-foreground mt-1">{order.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Select
                  value={order.status}
                  onValueChange={(value) => {
                    setOrders(orders.map(o => 
                      o.id === order.id ? { ...o, status: value as "pending" | "ordered" | "received" } : o
                    ));
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Changer le statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">À commander</SelectItem>
                    <SelectItem value="ordered">Commandée</SelectItem>
                    <SelectItem value="received">Reçue</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setOrders(orders.filter(o => o.id !== order.id));
                    toast(`La commande de ${order.productName} a été supprimée.`);
                  }}
                >
                  Supprimer
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
