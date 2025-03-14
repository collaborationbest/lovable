
import React from "react";
import OutilIALayout from "@/components/outils-ia/OutilIALayout";
import { CalendarDays } from "lucide-react";

const Travaux = () => {
  return (
    <OutilIALayout
      title="Planifier les Travaux"
      icon={<CalendarDays size={36} />}
      description="Optimisez la planification et le suivi des travaux de votre cabinet dentaire."
    >
      <div className="text-center">
        <h3 className="text-xl font-medium text-[#5C4E3D] mb-4">Planificateur de travaux IA</h3>
        <p className="text-amber-600">
          Cette fonctionnalité sera disponible prochainement. Nous travaillons activement à son développement.
        </p>
      </div>
    </OutilIALayout>
  );
};

export default Travaux;
