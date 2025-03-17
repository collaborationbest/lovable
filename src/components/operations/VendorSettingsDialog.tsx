import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, ChevronDown, ChevronUp, UserRound } from "lucide-react";
import { toast } from "sonner";
import useLocalStorage from "@/hooks/useLocalStorage";

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
  salesRep?: SalesRep;
}

interface VendorSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VendorSettingsDialog = ({ open, onOpenChange }: VendorSettingsDialogProps) => {
  const [vendors, setVendors] = useLocalStorage<Vendor[]>("supplyVendors", []);
  const [newVendor, setNewVendor] = useState<Omit<Vendor, "id">>({
    name: "",
    phone: "",
    email: "",
    salesRep: {
      firstName: "",
      lastName: "",
      email: "",
      phone: ""
    }
  });
  const [expandedVendors, setExpandedVendors] = useState<Record<string, boolean>>({});

  const handleAddVendor = () => {
    if (!newVendor.name.trim()) {
      toast.error("Le nom du fournisseur est requis");
      return;
    }

    const vendor: Vendor = {
      ...newVendor,
      id: Date.now().toString()
    };

    setVendors([...vendors, vendor]);
    setNewVendor({
      name: "",
      phone: "",
      email: "",
      salesRep: {
        firstName: "",
        lastName: "",
        email: "",
        phone: ""
      }
    });

    toast.success(`${vendor.name} a été ajouté à la liste des fournisseurs.`);
  };

  const handleDeleteVendor = (id: string) => {
    const vendor = vendors.find(v => v.id === id);
    if (!vendor) return;
    
    setVendors(vendors.filter(v => v.id !== id));
    
    toast.success(`${vendor.name} a été supprimé de la liste des fournisseurs.`);
  };

  const toggleVendorDetails = (id: string) => {
    setExpandedVendors(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const updateVendorSalesRep = (id: string, field: keyof SalesRep, value: string) => {
    setVendors(vendors.map(vendor => {
      if (vendor.id === id) {
        return {
          ...vendor,
          salesRep: {
            ...(vendor.salesRep || { firstName: "", lastName: "", email: "", phone: "" }),
            [field]: value
          }
        };
      }
      return vendor;
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Gestion des fournisseurs</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="vendorName">Nom du fournisseur</Label>
              <Input
                id="vendorName"
                placeholder="Nom du fournisseur"
                value={newVendor.name}
                onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vendorPhone">Numéro de téléphone</Label>
              <Input
                id="vendorPhone"
                placeholder="Numéro de téléphone"
                value={newVendor.phone}
                onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vendorEmail">Email</Label>
              <Input
                id="vendorEmail"
                placeholder="Email du fournisseur"
                value={newVendor.email}
                onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
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
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleAddVendor} className="w-full">
              Ajouter un fournisseur
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
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleVendorDetails(vendor.id)}
                          title={expandedVendors[vendor.id] ? "Masquer le commercial" : "Afficher le commercial"}
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
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    
                    {expandedVendors[vendor.id] && (
                      <div className="p-2 border-t bg-gray-50">
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
                              />
                            </div>
                            <div>
                              <Label htmlFor={`rep-lastName-${vendor.id}`}>Nom</Label>
                              <Input
                                id={`rep-lastName-${vendor.id}`}
                                placeholder="Nom"
                                value={vendor.salesRep?.lastName || ""}
                                onChange={(e) => updateVendorSalesRep(vendor.id, "lastName", e.target.value)}
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
                            />
                          </div>
                          <div>
                            <Label htmlFor={`rep-phone-${vendor.id}`}>Téléphone</Label>
                            <Input
                              id={`rep-phone-${vendor.id}`}
                              placeholder="Numéro de téléphone du commercial"
                              value={vendor.salesRep?.phone || ""}
                              onChange={(e) => updateVendorSalesRep(vendor.id, "phone", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VendorSettingsDialog;
