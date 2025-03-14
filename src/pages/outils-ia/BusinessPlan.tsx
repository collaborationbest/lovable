
import React from "react";
import OutilIALayout from "@/components/outils-ia/OutilIALayout";
import { FileText } from "lucide-react";

const BusinessPlan = () => {
  return (
    <OutilIALayout
      title="Préparer votre Business Plan"
      icon={<FileText size={36} />}
      description="Créez un business plan solide pour votre cabinet dentaire."
    >
      <div className="text-center">
        <h3 className="text-xl font-medium text-[#5C4E3D] mb-4">Générateur de Business Plan</h3>
        <p className="text-amber-600">
          Cette fonctionnalité sera disponible prochainement. Nous travaillons activement à son développement.
        </p>
      </div>
    </OutilIALayout>
  );
};

export default BusinessPlan;
