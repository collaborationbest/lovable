
import React from "react";
import OutilIALayout from "@/components/outils-ia/OutilIALayout";
import { Briefcase } from "lucide-react";

const Equipement = () => {
  return (
    <OutilIALayout
      title="S'équiper et Lancer"
      icon={<Briefcase size={36} />}
      description="Optimisez vos achats et maximisez la rentabilité de votre investissement matériel."
    >
      <div className="text-center">
        <h3 className="text-xl font-medium text-[#5C4E3D] mb-4">Comparateur d'équipement IA</h3>
        <p className="text-amber-600">
          Cette fonctionnalité sera disponible prochainement. Nous travaillons activement à son développement.
        </p>
      </div>
    </OutilIALayout>
  );
};

export default Equipement;
