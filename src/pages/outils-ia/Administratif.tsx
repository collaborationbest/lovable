
import React from "react";
import OutilIALayout from "@/components/outils-ia/OutilIALayout";
import { FileText } from "lucide-react";

const Administratif = () => {
  return (
    <OutilIALayout
      title="Démarches Administratives"
      icon={<FileText size={36} />}
      description="Simplifiez vos démarches administratives avec notre assistant IA."
    >
      <div className="text-center">
        <h3 className="text-xl font-medium text-[#5C4E3D] mb-4">Assistant administratif IA</h3>
        <p className="text-amber-600">
          Cette fonctionnalité sera disponible prochainement. Nous travaillons activement à son développement.
        </p>
      </div>
    </OutilIALayout>
  );
};

export default Administratif;
