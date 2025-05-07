
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, ChevronDown, ChevronUp, UserRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/access-control/useAuthState";
import { Spinner } from "@/components/ui/spinner";

export interface SalesRep {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

export interface Vendor {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  customerAccount?: string;
  salesRep?: SalesRep | null;
}

interface VendorSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const transformSalesRep = (data: any): SalesRep | null => {
  if (!data) return null;
  
  if (typeof data === 'object' && !Array.isArray(data) && 
      'firstName' in data && 'lastName' in data) {
    return {
      firstName: String(data.firstName || ''),
      lastName: String(data.lastName || ''),
      email: data.email ? String(data.email) : undefined,
      phone: data.phone ? String(data.phone) : undefined
    };
  }
  
  return {
    firstName: '',
    lastName: '',
  };
}

const VendorSettingsDialog = ({ open, onOpenChange }: VendorSettingsDialogProps) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [newVendor, setNewVendor] = useState<Omit<Vendor, "id">>({
    name: "",
    phone: "",
    email: "",
    customerAccount: "",
    salesRep: {
      firstName: "",
      lastName: "",
      email: "",
      phone: ""
    }
  });
  const [expandedVendors, setExpandedVendors] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { state } = useAuthState();
  const cabinetId = state.cabinetOwnerId;

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setIsLoading(true);
        
        if (!cabinetId) {
          console.log("VendorSettings: No cabinet ID found, cannot fetch vendors");
          setIsLoading(false);
          return;
        }
        
        console.log("VendorSettings: Using cabinet ID:", cabinetId);
        
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .eq('cabinet_id', cabinetId);
        
        if (error) {
          throw error;
        }
        
        console.log("VendorSettings: Vendors data loaded:", data);
        
        const transformedVendors: Vendor[] = data.map(vendor => {
          const salesRep = transformSalesRep(vendor.sales_rep);
          
          let customerAccount;
          if (vendor.sales_rep && typeof vendor.sales_rep === 'object' && 'customerAccount' in vendor.sales_rep) {
            customerAccount = String(vendor.sales_rep.customerAccount || '');
          }
          
          return {
            id: vendor.id,
            name: vendor.name,
            phone: vendor.phone || "",
            email: vendor.email || "",
            customerAccount: customerAccount || "",
            salesRep: salesRep
          };
        });
        
        console.log("VendorSettings: Transformed vendors:", transformedVendors);
        setVendors(transformedVendors);
      } catch (error: any) {
        console.error("VendorSettings: Error fetching vendors:", error);
        toast.error("Erreur lors du chargement des fournisseurs");
      } finally {
        setIsLoading(false);
      }
    };

    if (open && cabinetId) {
      fetchVendors();
    }
  }, [open, cabinetId]);

  const handleAddVendor = async () => {
    if (!newVendor.name.trim()) {
      toast.error("Le nom du fournisseur est requis");
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (!cabinetId) {
        toast.error("Information du cabinet manquante");
        return;
      }
      
      console.log("VendorSettings: Adding vendor to cabinet:", cabinetId);
      
      const salesRepData = newVendor.salesRep ? {
        firstName: newVendor.salesRep.firstName,
        lastName: newVendor.salesRep.lastName,
        email: newVendor.salesRep.email,
        phone: newVendor.salesRep.phone,
        customerAccount: newVendor.customerAccount
      } : null;
      
      // Get the current user's session for user_id
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      const vendorData = {
        name: newVendor.name,
        phone: newVendor.phone,
        email: newVendor.email,
        sales_rep: salesRepData,
        user_id: userId,
        cabinet_id: cabinetId
      };
      
      console.log("VendorSettings: Inserting vendor with data:", vendorData);
      
      const { data, error } = await supabase
        .from('vendors')
        .insert(vendorData)
        .select();
      
      if (error) {
        throw error;
      }
      
      console.log("VendorSettings: Vendor added successfully:", data);
      
      const customerAccount = data[0].sales_rep && 
                            typeof data[0].sales_rep === 'object' && 
                            'customerAccount' in data[0].sales_rep ? 
                            String(data[0].sales_rep.customerAccount || '') : '';
      
      const newVendorData: Vendor = {
        id: data[0].id,
        name: data[0].name,
        phone: data[0].phone || "",
        email: data[0].email || "",
        customerAccount: customerAccount,
        salesRep: transformSalesRep(data[0].sales_rep)
      };
      
      setVendors([...vendors, newVendorData]);
      setNewVendor({
        name: "",
        phone: "",
        email: "",
        customerAccount: "",
        salesRep: {
          firstName: "",
          lastName: "",
          email: "",
          phone: ""
        }
      });

      toast.success(`${newVendorData.name} a été ajouté à la liste des fournisseurs.`);
    } catch (error: any) {
      console.error("VendorSettings: Error adding vendor:", error);
      toast.error("Erreur lors de l'ajout du fournisseur");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVendor = async (id: string) => {
    try {
      setIsDeleting(id);
      const vendor = vendors.find(v => v.id === id);
      if (!vendor) return;
      
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setVendors(vendors.filter(v => v.id !== id));
      toast.success(`${vendor.name} a été supprimé de la liste des fournisseurs.`);
    } catch (error: any) {
      console.error("Error deleting vendor:", error);
      toast.error("Erreur lors de la suppression du fournisseur");
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleVendorDetails = (id: string) => {
    setExpandedVendors(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const updateVendorSalesRep = async (id: string, field: keyof SalesRep, value: string) => {
    try {
      setIsUpdating(id);
      const vendorToUpdate = vendors.find(v => v.id === id);
      if (!vendorToUpdate) return;
      
      const updatedSalesRep = {
        ...(vendorToUpdate.salesRep || { firstName: "", lastName: "", email: "", phone: "" }),
        [field]: value,
        customerAccount: vendorToUpdate.customerAccount
      };
      
      const { error } = await supabase
        .from('vendors')
        .update({
          sales_rep: updatedSalesRep
        })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setVendors(vendors.map(vendor => {
        if (vendor.id === id) {
          return {
            ...vendor,
            salesRep: {
              ...updatedSalesRep,
              firstName: updatedSalesRep.firstName,
              lastName: updatedSalesRep.lastName,
              email: updatedSalesRep.email,
              phone: updatedSalesRep.phone
            }
          };
        }
        return vendor;
      }));
    } catch (error: any) {
      console.error("Error updating vendor sales rep:", error);
      toast.error("Erreur lors de la mise à jour du commercial");
    } finally {
      setIsUpdating(null);
    }
  };

  const updateVendorField = async (id: string, field: 'customerAccount', value: string) => {
    try {
      setIsUpdating(id);
      const vendorToUpdate = vendors.find(v => v.id === id);
      if (!vendorToUpdate) return;
      
      const currentSalesRep = vendorToUpdate.salesRep || { firstName: "", lastName: "" };
      
      const updatedSalesRep = {
        ...currentSalesRep,
        customerAccount: value
      };
      
      const { error } = await supabase
        .from('vendors')
        .update({
          sales_rep: updatedSalesRep
        })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setVendors(vendors.map(vendor => {
        if (vendor.id === id) {
          return {
            ...vendor,
            customerAccount: value,
            salesRep: {
              ...(vendor.salesRep || { firstName: "", lastName: "" }),
              firstName: currentSalesRep.firstName,
              lastName: currentSalesRep.lastName,
              email: currentSalesRep.email,
              phone: currentSalesRep.phone
            }
          };
        }
        return vendor;
      }));
    } catch (error: any) {
      console.error(`Error updating vendor ${field}:`, error);
      toast.error(`Erreur lors de la mise à jour du ${field}`);
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Gestion des fournisseurs</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8">
              <Spinner size="lg" className="border-[#B88E23]" />
              <p className="text-sm text-muted-foreground mt-2">Chargement des fournisseurs...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="vendorName">Nom du fournisseur</Label>
                  <Input
                    id="vendorName"
                    placeholder="Nom du fournisseur"
                    value={newVendor.name}
                    onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vendorPhone">Numéro de téléphone</Label>
                  <Input
                    id="vendorPhone"
                    placeholder="Numéro de téléphone"
                    value={newVendor.phone}
                    onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vendorEmail">Email</Label>
                  <Input
                    id="vendorEmail"
                    placeholder="Email du fournisseur"
                    value={newVendor.email}
                    onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customerAccount">Compte client</Label>
                  <Input
                    id="customerAccount"
                    placeholder="Numéro de compte client"
                    value={newVendor.customerAccount}
                    onChange={(e) => setNewVendor({ ...newVendor, customerAccount: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="border p-3 rounded-md bg-gray-50">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <UserRound className="h-4 w-4 mr-1" />
                    Commercial en charge
                  </h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="repFirstName">Prénom</Label>
                        <Input
                          id="repFirstName"
                          placeholder="Prénom"
                          value={newVendor.salesRep?.firstName || ""}
                          onChange={(e) => setNewVendor({
                            ...newVendor,
                            salesRep: {
                              ...(newVendor.salesRep || { firstName: "", lastName: "", email: "", phone: "" }),
                              firstName: e.target.value
                            }
                          })}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <Label htmlFor="repLastName">Nom</Label>
                        <Input
                          id="repLastName"
                          placeholder="Nom"
                          value={newVendor.salesRep?.lastName || ""}
                          onChange={(e) => setNewVendor({
                            ...newVendor,
                            salesRep: {
                              ...(newVendor.salesRep || { firstName: "", lastName: "", email: "", phone: "" }),
                              lastName: e.target.value
                            }
                          })}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="repEmail">Email</Label>
                      <Input
                        id="repEmail"
                        placeholder="Email du commercial"
                        value={newVendor.salesRep?.email || ""}
                        onChange={(e) => setNewVendor({
                          ...newVendor,
                          salesRep: {
                            ...(newVendor.salesRep || { firstName: "", lastName: "", email: "", phone: "" }),
                            email: e.target.value
                          }
                        })}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="repPhone">Téléphone</Label>
                      <Input
                        id="repPhone"
                        placeholder="Numéro de téléphone du commercial"
                        value={newVendor.salesRep?.phone || ""}
                        onChange={(e) => setNewVendor({
                          ...newVendor,
                          salesRep: {
                            ...(newVendor.salesRep || { firstName: "", lastName: "", email: "", phone: "" }),
                            phone: e.target.value
                          }
                        })}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleAddVendor} 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Ajout en cours...
                    </>
                  ) : "Ajouter un fournisseur"}
                </Button>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-2">Fournisseurs enregistrés</h3>
                {vendors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun fournisseur enregistré.</p>
                ) : (
                  <div className="space-y-2">
                    {vendors.map((vendor) => (
                      <div
                        key={vendor.id}
                        className="border rounded-md overflow-hidden"
                      >
                        <div className="flex items-center justify-between p-2">
                          <div>
                            <p className="font-medium">{vendor.name}</p>
                            <div className="text-sm text-muted-foreground">
                              {vendor.phone && <p>Tél: {vendor.phone}</p>}
                              {vendor.email && <p>Email: {vendor.email}</p>}
                              {vendor.customerAccount && <p>Compte: {vendor.customerAccount}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleVendorDetails(vendor.id)}
                              title={expandedVendors[vendor.id] ? "Masquer le commercial" : "Afficher le commercial"}
                              disabled={isDeleting === vendor.id || isUpdating === vendor.id}
                            >
                              {expandedVendors[vendor.id] ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteVendor(vendor.id)}
                              disabled={isDeleting === vendor.id || isUpdating === vendor.id}
                            >
                              {isDeleting === vendor.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-destructive" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        {expandedVendors[vendor.id] && (
                          <div className="p-2 border-t bg-gray-50">
                            {isUpdating === vendor.id ? (
                              <div className="flex items-center justify-center py-4">
                                <Spinner size="sm" className="border-[#B88E23]" />
                                <span className="ml-2 text-sm">Mise à jour...</span>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor={`customer-account-${vendor.id}`}>Compte client</Label>
                                  <Input
                                    id={`customer-account-${vendor.id}`}
                                    placeholder="Numéro de compte client"
                                    value={vendor.customerAccount || ""}
                                    onChange={(e) => updateVendorField(vendor.id, "customerAccount", e.target.value)}
                                    disabled={isUpdating === vendor.id}
                                  />
                                </div>
                                
                                <h4 className="text-sm font-medium mb-2 flex items-center">
                                  <UserRound className="h-4 w-4 mr-1" />
                                  Commercial en charge
                                </h4>
                                <div className="space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <Label htmlFor={`rep-firstName-${vendor.id}`}>Prénom</Label>
                                      <Input
                                        id={`rep-firstName-${vendor.id}`}
                                        placeholder="Prénom"
                                        value={vendor.salesRep?.firstName || ""}
                                        onChange={(e) => updateVendorSalesRep(vendor.id, "firstName", e.target.value)}
                                        disabled={isUpdating === vendor.id}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`rep-lastName-${vendor.id}`}>Nom</Label>
                                      <Input
                                        id={`rep-lastName-${vendor.id}`}
                                        placeholder="Nom"
                                        value={vendor.salesRep?.lastName || ""}
                                        onChange={(e) => updateVendorSalesRep(vendor.id, "lastName", e.target.value)}
                                        disabled={isUpdating === vendor.id}
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor={`rep-email-${vendor.id}`}>Email</Label>
                                    <Input
                                      id={`rep-email-${vendor.id}`}
                                      placeholder="Email du commercial"
                                      value={vendor.salesRep?.email || ""}
                                      onChange={(e) => updateVendorSalesRep(vendor.id, "email", e.target.value)}
                                      disabled={isUpdating === vendor.id}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`rep-phone-${vendor.id}`}>Téléphone</Label>
                                    <Input
                                      id={`rep-phone-${vendor.id}`}
                                      placeholder="Numéro de téléphone du commercial"
                                      value={vendor.salesRep?.phone || ""}
                                      onChange={(e) => updateVendorSalesRep(vendor.id, "phone", e.target.value)}
                                      disabled={isUpdating === vendor.id}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VendorSettingsDialog;
