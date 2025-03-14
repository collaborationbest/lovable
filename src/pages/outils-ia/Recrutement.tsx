
import React from "react";
import OutilIALayout from "@/components/outils-ia/OutilIALayout";
import { Users } from "lucide-react";

const Recrutement = () => {
  return (
    <OutilIALayout
      title="Recruter votre Équipe"
      icon={<Users size={36} />}
      description="Optimisez votre processus de recrutement et constituez une équipe performante."
    >
      <div className="text-center">
        <h3 className="text-xl font-medium text-[#5C4E3D] mb-4">Assistant de recrutement IA</h3>
        <p className="text-amber-600">
          Cette fonctionnalité sera disponible prochainement. Nous travaillons activement à son développement.
        </p>
      </div>
    </OutilIALayout>
  );
};

export default Recrutement;
