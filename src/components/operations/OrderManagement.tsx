
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Settings, Search, Plus, Trash2, Mail, PenSquare } from "lucide-react";
import VendorSettingsDialog, { Vendor } from "./VendorSettingsDialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/access-control/useAuthState";
import { OrderData, OrderProduct } from "@/integrations/supabase/utils/dbTypes";
import { LoadingButton } from "@/components/ui/loading-button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Order {
  id: string;
  supplierName: string;
  products: OrderProduct[];
  urgency: "standard" | "urgent" | "critical";
  orderDate: string;
  notes: string;
  status: "pending" | "ordered" | "received";
}

interface OrderManagementProps {
  searchQuery?: string;
}

const transformSalesRep = (data: any) => {
  if (!data) return null;
  
  if (typeof data === 'object' && !Array.isArray(data)) {
    return {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phone: data.phone || ''
    };
  }
  
  return null;
};

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isVendorSettingsOpen, setIsVendorSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [isSendingOrder, setIsSendingOrder] = useState(false);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);
  const { state } = useAuthState();
  const cabinetId = state.cabinetOwnerId;
  const [newOrder, setNewOrder] = useState<Omit<Order, "id">>({
    supplierName: "",
    products: [{ id: Date.now().toString(), productName: "", quantity: 1 }],
    urgency: "standard",
    orderDate: new Date().toISOString().split("T")[0],
    notes: "",
    status: "pending"
  });
  
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [emailPreview, setEmailPreview] = useState({
    to: "",
    subject: "",
    message: "",
  });
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (cabinetId) {
      fetchVendors();
    }
  }, [cabinetId, isVendorSettingsOpen]);
  
  useEffect(() => {
    if (cabinetId) {
      fetchOrders();
    }
  }, [cabinetId]);

  const fetchOrders = async () => {
    if (!cabinetId) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('cabinet_id', cabinetId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const formattedOrders: Order[] = data.map((order: any) => {
          let products: OrderProduct[] = [];
          try {
            if (Array.isArray(order.products)) {
              products = order.products.map((p: any) => ({
                id: p.id.toString(),
                productName: p.productName || "",
                quantity: p.quantity || 0
              }));
            }
          } catch (e) {
            console.error("Error parsing products:", e);
          }

          return {
            id: order.id,
            supplierName: order.supplier_name,
            products: products,
            urgency: order.urgency as "standard" | "urgent" | "critical",
            orderDate: new Date(order.order_date).toISOString().split('T')[0],
            notes: order.notes || "",
            status: order.status as "pending" | "ordered" | "received"
          };
        });
        
        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Impossible de récupérer les commandes");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVendors = async () => {
    if (!cabinetId) return;

    try {
      console.log("Fetching vendors for cabinet ID:", cabinetId);
      
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('cabinet_id', cabinetId);
      
      if (error) {
        throw error;
      }
      
      console.log("Vendors data from database:", data);
      
      if (!data || data.length === 0) {
        console.log("No vendors found for this cabinet");
        setVendors([]);
        return;
      }
      
      const transformedVendors: Vendor[] = data.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        phone: vendor.phone || "",
        email: vendor.email || "",
        salesRep: transformSalesRep(vendor.sales_rep),
        customerAccount: vendor.sales_rep && 
                       typeof vendor.sales_rep === 'object' && 
                       'customerAccount' in vendor.sales_rep ? 
                       String(vendor.sales_rep.customerAccount || '') : ''
      }));
      
      console.log("Transformed vendors:", transformedVendors);
      setVendors(transformedVendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast.error("Impossible de récupérer la liste des fournisseurs");
    }
  };

  const handleAddProduct = () => {
    setNewOrder({
      ...newOrder,
      products: [
        ...newOrder.products,
        { id: Date.now().toString(), productName: "", quantity: 1 }
      ]
    });
  };

  const handleRemoveProduct = (productId: string) => {
    if (newOrder.products.length <= 1) {
      toast.error("Une commande doit contenir au moins un produit.");
      return;
    }
    
    setNewOrder({
      ...newOrder,
      products: newOrder.products.filter(product => product.id !== productId)
    });
  };

  const handleProductChange = (productId: string, field: keyof OrderProduct, value: string | number) => {
    setNewOrder({
      ...newOrder,
      products: newOrder.products.map(product => 
        product.id === productId ? { ...product, [field]: value } : product
      )
    });
  };

  const handleAddOrder = async () => {
    if (!cabinetId) {
      toast.error("Vous devez être connecté pour ajouter une commande.");
      return;
    }

    if (!newOrder.supplierName) {
      toast.error("Veuillez sélectionner un fournisseur.");
      return;
    }
    
    if (newOrder.products.some(product => !product.productName)) {
      toast.error("Veuillez remplir le nom de tous les produits.");
      return;
    }
    
    try {
      setIsAddingOrder(true);
      
      // Get current user session to get the correct UUID
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      const { data, error } = await supabase
        .from('orders')
        .insert({
          cabinet_id: cabinetId,
          user_id: userId, // Use the UUID from the session instead of email
          supplier_name: newOrder.supplierName,
          products: JSON.parse(JSON.stringify(newOrder.products)),
          urgency: newOrder.urgency,
          order_date: newOrder.orderDate,
          notes: newOrder.notes,
          status: newOrder.status
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        let products: OrderProduct[] = [];
        try {
          if (Array.isArray(data.products)) {
            products = data.products.map((p: any) => ({
              id: p.id.toString(),
              productName: p.productName || "",
              quantity: p.quantity || 0
            }));
          }
        } catch (e) {
          console.error("Error parsing products:", e);
        }
        
        const newFormattedOrder: Order = {
          id: data.id,
          supplierName: data.supplier_name,
          products: products,
          urgency: data.urgency as "standard" | "urgent" | "critical",
          orderDate: new Date(data.order_date).toISOString().split('T')[0],
          notes: data.notes || "",
          status: data.status as "pending" | "ordered" | "received"
        };
        
        setOrders([newFormattedOrder, ...orders]);
        setNewOrder({
          supplierName: "",
          products: [{ id: Date.now().toString(), productName: "", quantity: 1 }],
          urgency: "standard",
          orderDate: new Date().toISOString().split("T")[0],
          notes: "",
          status: "pending"
        });
        setIsDialogOpen(false);
        
        toast.success(`La commande a été ajoutée avec ${newFormattedOrder.products.length} produit(s).`);
      }
    } catch (error) {
      console.error("Error adding order:", error);
      toast.error("Erreur lors de l'ajout de la commande.");
    } finally {
      setIsAddingOrder(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: "pending" | "ordered" | "received") => {
    try {
      setIsUpdatingOrder(true);
      
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (error) {
        throw error;
      }
      
      setOrders(orders.map(o => 
        o.id === orderId ? { ...o, status } : o
      ));
      
      toast.success(`Statut de la commande mis à jour.`);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Erreur lors de la mise à jour du statut de la commande.");
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      setIsDeletingOrder(true);
      
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
      
      if (error) {
        throw error;
      }
      
      setOrders(orders.filter(o => o.id !== orderId));
      toast.success("La commande a été supprimée.");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Erreur lors de la suppression de la commande.");
    } finally {
      setIsDeletingOrder(false);
    }
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

  const getVendor = (vendorId: string): Vendor | undefined => {
    return vendors.find(v => v.id === vendorId);
  };

  const handleOpenEmailPreview = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const vendor = getVendor(order.supplierName);
    if (!vendor) {
      toast.error("Fournisseur introuvable");
      return;
    }

    const recipientEmail = vendor.salesRep?.email || vendor.email || "";
    
    if (!recipientEmail) {
      toast.error("Aucun email trouvé pour ce fournisseur");
      return;
    }

    const customerAccount = vendor.customerAccount || "";
    const urgencyText = getUrgencyLabel(order.urgency);
    const vendorName = vendor.name;
    
    const productsList = order.products.map(product => 
      `• ${product.productName} - Quantité: ${product.quantity}`
    ).join('\n');

    const subject = `Commande pour ${vendorName}${customerAccount ? ` "${customerAccount}"` : ''}`;
    
    const message = `Bonjour,

Nous souhaitons passer la commande suivante ${urgencyText !== 'Standard' ? `(${urgencyText})` : ''}:

${productsList}

${order.notes ? `\nNotes supplémentaires:\n${order.notes}` : ''}

Merci de confirmer la réception de cette commande.

Cordialement,
${vendor.name}`;

    setEmailPreview({
      to: recipientEmail,
      subject,
      message
    });

    setCurrentOrderId(orderId);
    setIsEmailPreviewOpen(true);
  };

  const handleSendOrder = async () => {
    if (!currentOrderId) return;
    
    try {
      setIsSendingOrder(true);
      
      const order = orders.find(o => o.id === currentOrderId);
      if (!order) {
        toast.error("Commande introuvable");
        return;
      }
      
      const vendor = getVendor(order.supplierName);
      if (!vendor) {
        toast.error("Fournisseur introuvable");
        return;
      }
      
      // Get the user's email from the auth session
      const { data: sessionData } = await supabase.auth.getSession();
      const userEmail = sessionData?.session?.user?.email;
      
      const { data, error } = await supabase.functions.invoke('send-order-email', {
        body: {
          to: emailPreview.to,
          subject: emailPreview.subject,
          message: emailPreview.message,
          vendorName: vendor.name,
          cc: userEmail // Add the user's email as CC
        }
      });
      
      if (error) {
        console.error("Error calling send-order-email function:", error);
        toast.error("Erreur lors de l'envoi de l'email: " + error.message);
        return;
      }
      
      if (!data.success) {
        console.error("Email sending failed:", data.error);
        toast.error("Échec de l'envoi: " + data.error);
        return;
      }
      
      await updateOrderStatus(currentOrderId, 'ordered');
      
      setIsEmailPreviewOpen(false);
      setCurrentOrderId(null);
      
      toast.success("Commande envoyée avec succès.");
    } catch (error) {
      console.error("Error sending order:", error);
      toast.error("Erreur lors de l'envoi de la commande: " + (error.message || "Erreur inconnue"));
    } finally {
      setIsSendingOrder(false);
    }
  };

  const handleEditOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    setEditingOrder(order);
    setIsEditDialogOpen(true);
  };
  
  const saveEditedOrder = async () => {
    if (!editingOrder || !cabinetId) return;
    
    try {
      setIsUpdatingOrder(true);
      
      const { error } = await supabase
        .from('orders')
        .update({
          supplier_name: editingOrder.supplierName,
          products: JSON.parse(JSON.stringify(editingOrder.products)),
          urgency: editingOrder.urgency,
          order_date: editingOrder.orderDate,
          notes: editingOrder.notes,
          status: editingOrder.status
        })
        .eq('id', editingOrder.id);
      
      if (error) {
        throw error;
      }
      
      setOrders(orders.map(o => 
        o.id === editingOrder.id ? editingOrder : o
      ));
      
      setIsEditDialogOpen(false);
      setEditingOrder(null);
      toast.success("Commande mise à jour");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Erreur lors de la mise à jour de la commande.");
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const vendorName = getVendorName(order.supplierName).toLowerCase();
    
    return (
      order.products.some(product => 
        product.productName.toLowerCase().includes(searchLower) ||
        product.quantity.toString().includes(searchLower)
      ) ||
      vendorName.includes(searchLower) ||
      order.notes.toLowerCase().includes(searchLower) ||
      getStatusLabel(order.status).toLowerCase().includes(searchLower) ||
      getUrgencyLabel(order.urgency).toLowerCase().includes(searchLower)
    );
  });

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    
    if (open && cabinetId) {
      console.log("Dialog opened, fetching vendors...");
      fetchVendors();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Gestion des commandes</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setIsVendorSettingsOpen(true)} title="Paramètres des fournisseurs">
            <Settings className="h-4 w-4" />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button>Ajouter une commande</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Nouvelle commande</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
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
                
                <div className="border-t pt-2">
                  <h3 className="text-sm font-medium mb-2">Produits</h3>
                  
                  {newOrder.products.map((product, index) => (
                    <div key={product.id} className="grid gap-3 mb-3 p-3 bg-gray-50 rounded-md relative">
                      <div className="absolute right-2 top-2">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor={`product-${index}`} className="text-right">
                          Produit {index + 1}
                        </Label>
                        <Input
                          id={`product-${index}`}
                          value={product.productName}
                          onChange={(e) => handleProductChange(product.id, "productName", e.target.value)}
                          className="col-span-3"
                          placeholder="Nom du produit"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor={`quantity-${index}`} className="text-right">
                          Quantité
                        </Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          min="1"
                          value={product.quantity}
                          onChange={(e) => handleProductChange(product.id, "quantity", parseInt(e.target.value))}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={handleAddProduct}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un produit
                  </Button>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4 mt-2">
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
                <LoadingButton 
                  onClick={handleAddOrder} 
                  isLoading={isAddingOrder}
                  loadingText="Ajout en cours..."
                >
                  Ajouter
                </LoadingButton>
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
        onOpenChange={(open) => {
          setIsVendorSettingsOpen(open);
          if (!open) {
            fetchVendors();
          }
        }} 
      />
      
      <Dialog open={isEmailPreviewOpen} onOpenChange={setIsEmailPreviewOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Aperçu de l'email de commande</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email-to">Destinataire</Label>
              <Input 
                id="email-to" 
                value={emailPreview.to} 
                onChange={(e) => setEmailPreview({...emailPreview, to: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="email-subject">Objet</Label>
              <Input 
                id="email-subject" 
                value={emailPreview.subject} 
                onChange={(e) => setEmailPreview({...emailPreview, subject: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="email-message">Message</Label>
              <Textarea 
                id="email-message" 
                value={emailPreview.message}
                onChange={(e) => setEmailPreview({...emailPreview, message: e.target.value})}
                className="min-h-[200px]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEmailPreviewOpen(false)}>
              Annuler
            </Button>
            <LoadingButton 
              onClick={handleSendOrder} 
              isLoading={isSendingOrder}
              loadingText="Envoi en cours..."
            >
              Envoyer la commande
            </LoadingButton>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Modifier la commande</DialogTitle>
          </DialogHeader>
          {editingOrder && (
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-supplier" className="text-right">
                  Fournisseur
                </Label>
                <Select 
                  value={editingOrder.supplierName}
                  onValueChange={(value) => setEditingOrder({...editingOrder, supplierName: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner un fournisseur" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="border-t pt-2">
                <h3 className="text-sm font-medium mb-2">Produits</h3>
                
                {editingOrder.products.map((product, index) => (
                  <div key={product.id} className="grid gap-3 mb-3 p-3 bg-gray-50 rounded-md relative">
                    <div className="absolute right-2 top-2">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-red-500 hover:text-red-700"
                        onClick={() => {
                          if (editingOrder.products.length <= 1) {
                            toast.error("Une commande doit contenir au moins un produit.");
                            return;
                          }
                          setEditingOrder({
                            ...editingOrder,
                            products: editingOrder.products.filter(p => p.id !== product.id)
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={`edit-product-${index}`} className="text-right">
                        Produit {index + 1}
                      </Label>
                      <Input
                        id={`edit-product-${index}`}
                        value={product.productName}
                        onChange={(e) => {
                          const updatedProducts = [...editingOrder.products];
                          updatedProducts[index] = {
                            ...updatedProducts[index],
                            productName: e.target.value
                          };
                          setEditingOrder({
                            ...editingOrder,
                            products: updatedProducts
                          });
                        }}
                        className="col-span-3"
                        placeholder="Nom du produit"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={`edit-quantity-${index}`} className="text-right">
                        Quantité
                      </Label>
                      <Input
                        id={`edit-quantity-${index}`}
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) => {
                          const updatedProducts = [...editingOrder.products];
                          updatedProducts[index] = {
                            ...updatedProducts[index],
                            quantity: parseInt(e.target.value)
                          };
                          setEditingOrder({
                            ...editingOrder,
                            products: updatedProducts
                          });
                        }}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                ))}
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => {
                    setEditingOrder({
                      ...editingOrder,
                      products: [
                        ...editingOrder.products,
                        { id: Date.now().toString(), productName: "", quantity: 1 }
                      ]
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un produit
                </Button>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4 mt-2">
                <Label htmlFor="edit-urgency" className="text-right">
                  Urgence
                </Label>
                <Select
                  value={editingOrder.urgency}
                  onValueChange={(value) => setEditingOrder({
                    ...editingOrder, 
                    urgency: value as "standard" | "urgent" | "critical"
                  })}
                >
                  <SelectTrigger className="w-[140px]">
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
                <Label htmlFor="edit-notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="edit-notes"
                  placeholder="Informations complémentaires"
                  value={editingOrder.notes}
                  onChange={(e) => setEditingOrder({
                    ...editingOrder,
                    notes: e.target.value
                  })}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <LoadingButton 
              onClick={saveEditedOrder} 
              isLoading={isUpdatingOrder}
              loadingText="Mise à jour..."
            >
              Enregistrer
            </LoadingButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* Display Orders */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-muted-foreground">Aucune commande trouvée.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <Card key={order.id} className="shadow-sm hover:shadow transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{getVendorName(order.supplierName)}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(order.urgency)}`}>
                        {getUrgencyLabel(order.urgency)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <PenSquare className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditOrder(order.id)}>
                        Modifier
                      </DropdownMenuItem>
                      {order.status === "pending" && (
                        <DropdownMenuItem onClick={() => handleOpenEmailPreview(order.id)}>
                          Envoyer
                        </DropdownMenuItem>
                      )}
                      {order.status === "ordered" && (
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "received")}>
                          Marquer comme reçue
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => deleteOrder(order.id)}
                      >
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.products.map((product, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{product.productName}</span>
                      <span>x{product.quantity}</span>
                    </div>
                  ))}
                </div>
                {order.notes && (
                  <div className="mt-4 pt-3 border-t text-sm text-muted-foreground">
                    <p className="font-medium text-xs mb-1">Notes:</p>
                    <p>{order.notes}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0 justify-end gap-2">
                {order.status === "pending" && (
                  <Button size="sm" onClick={() => handleOpenEmailPreview(order.id)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Envoyer
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
