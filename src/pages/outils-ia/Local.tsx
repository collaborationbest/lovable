
import React from "react";
import OutilIALayout from "@/components/outils-ia/OutilIALayout";
import { Building } from "lucide-react";

const Local = () => {
  return (
    <OutilIALayout
      title="Local Professionnel"
      icon={<Building size={36} />}
      description="Analysez et trouvez le local idéal pour votre cabinet dentaire."
    >
      <div className="text-center">
        <h3 className="text-xl font-medium text-[#5C4E3D] mb-4">Analyseur de Local Intelligent</h3>
        <p className="text-amber-600">
          Cette fonctionnalité sera disponible prochainement. Nous travaillons activement à son développement.
        </p>
      </div>
    </OutilIALayout>
  );
};

export default Local;
