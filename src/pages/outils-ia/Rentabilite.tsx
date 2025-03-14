
import React from "react";
import OutilIALayout from "@/components/outils-ia/OutilIALayout";
import { Calculator } from "lucide-react";

const Rentabilite = () => {
  return (
    <OutilIALayout
      title="Optimiser la Rentabilité"
      icon={<Calculator size={36} />}
      description="Modélisez vos coûts et prédisez votre rentabilité."
    >
      <div className="text-center">
        <h3 className="text-xl font-medium text-[#5C4E3D] mb-4">Générateur de Business Plan IA</h3>
        <p className="text-amber-600">
          Cette fonctionnalité sera disponible prochainement. Nous travaillons activement à son développement.
        </p>
      </div>
    </OutilIALayout>
  );
};

export default Rentabilite;
