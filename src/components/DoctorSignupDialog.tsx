
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Updated interface without email and password
interface DoctorData {
  title: string;
  firstName: string;
  lastName: string;
  city: string;
  postalCode: string;
  openingDate: string;
}

interface DoctorSignupDialogProps {
  open: boolean;
  onSubmit: (data: DoctorData) => void;
}

const DoctorSignupDialog = ({ open, onSubmit }: DoctorSignupDialogProps) => {
  const [formData, setFormData] = useState<DoctorData>({
    title: "",
    firstName: "",
    lastName: "",
    city: "",
    postalCode: "",
    openingDate: "",
  });
  
  const [touched, setTouched] = useState({
    title: false,
    firstName: false,
    lastName: false,
    city: false,
    postalCode: false,
    openingDate: false,
  });
  
  const [dateInputValue, setDateInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      title: true,
      firstName: true,
      lastName: true,
      city: true,
      postalCode: true,
      openingDate: true,
    });

    const isFormValid = Object.values(formData).every(value => value !== "");
    if (isFormValid) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    // Simuler des données pour le développement
    const today = new Date();
    // Date d'ouverture à 6 mois dans le futur
    const openingDate = new Date(today.setMonth(today.getMonth() + 6));
    
    const testData: DoctorData = {
      title: "dr",
      firstName: "Jean",
      lastName: "Dupont",
      city: "Paris",
      postalCode: "75001",
      openingDate: openingDate.toISOString(),
    };
    onSubmit(testData);
  };

  const getFieldStyle = (fieldName: keyof DoctorData) => {
    const isEmpty = !formData[fieldName];
    const isTouched = touched[fieldName];
    return `border-[#B88E23]/20 focus:border-[#B88E23] ${isEmpty && isTouched ? 'border-red-500 bg-red-50' : ''}`;
  };
  
  // Fonction pour gérer la saisie de la date au format MM/YYYY
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDateInputValue(inputValue);
    
    // Si le champ est vide, on réinitialise la date
    if (!inputValue) {
      setFormData({ ...formData, openingDate: "" });
      return;
    }
    
    // On vérifie si la valeur saisie correspond au format MM/YYYY
    if (/^\d{2}\/\d{4}$/.test(inputValue)) {
      try {
        // On parse la date au format MM/YYYY
        const [month, year] = inputValue.split('/').map(Number);
        if (month && year && month >= 1 && month <= 12) {
          const date = new Date(year, month - 1, 1);
          setFormData({ ...formData, openingDate: date.toISOString() });
        }
      } catch (error) {
        // En cas d'erreur de format, on ne fait rien
        console.log("Format de date invalide");
      }
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" hideCloseButton>
        <div className="absolute right-4 top-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="hover:bg-[#B88E23]/10"
          >
            <X className="h-4 w-4 text-[#B88E23]" />
          </Button>
        </div>
        <DialogHeader>
          <DialogTitle className="text-[#5C4E3D]">Bienvenue !</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-[#454240] mb-1">
              Intitulé *
            </label>
            <Select
              value={formData.title}
              onValueChange={(value) => {
                setFormData({ ...formData, title: value });
                setTouched({ ...touched, title: true });
              }}
            >
              <SelectTrigger className={getFieldStyle("title")}>
                <SelectValue placeholder="Sélectionnez votre titre" />
              </SelectTrigger>
              <SelectContent className="bg-[#f5f2ee]">
                <SelectItem value="dr">Dr</SelectItem>
                <SelectItem value="pr">Pr</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-[#454240] mb-1">
                Prénom *
              </label>
              <Input
                id="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                onBlur={() => setTouched({ ...touched, firstName: true })}
                className={getFieldStyle("firstName")}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-[#454240] mb-1">
                Nom *
              </label>
              <Input
                id="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                onBlur={() => setTouched({ ...touched, lastName: true })}
                className={getFieldStyle("lastName")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-[#454240] mb-1">
                Ville d'installation *
              </label>
              <Input
                id="city"
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                onBlur={() => setTouched({ ...touched, city: true })}
                className={getFieldStyle("city")}
              />
            </div>

            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-[#454240] mb-1">
                Code postal *
              </label>
              <Input
                id="postalCode"
                type="text"
                required
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                onBlur={() => setTouched({ ...touched, postalCode: true })}
                className={getFieldStyle("postalCode")}
              />
            </div>
          </div>

          <div>
            <label htmlFor="openingDate" className="block text-sm font-medium text-[#454240] mb-1">
              Date d'ouverture prévue *
            </label>
            <Input
              id="openingDate"
              type="text"
              required
              value={dateInputValue}
              onChange={handleDateInputChange}
              onBlur={() => setTouched({ ...touched, openingDate: true })}
              className={getFieldStyle("openingDate")}
              placeholder="MM/AAAA"
              pattern="\d{2}/\d{4}"
              inputMode="numeric"
            />
            <p className="text-xs text-gray-500 mt-1">Format: MM/AAAA (ex: 06/2024)</p>
          </div>

          <Button 
            type="submit"
            className="w-full bg-[#B88E23] hover:bg-[#B88E23]/90 text-white"
          >
            Commencer
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorSignupDialog;
