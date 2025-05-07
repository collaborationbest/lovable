
import { Laboratory, Prosthetic } from "@/types/Prosthetic";
import { TeamMember } from "@/types/TeamMember";
import ProstheticBox from "./ProstheticBox";

interface ProstheticTableProps {
  prosthetics: Prosthetic[];
  laboratories: Laboratory[];
  dentists: TeamMember[];
  onUpdateStatus: (id: string, status: "pending" | "arrived" | "ready-to-ship") => void;
  onDeleteProsthetic: (id: string) => void;
  onEditProsthetic: (prosthetic: Prosthetic) => void;
  statusLabels: Record<string, string>;
  statusColors: Record<string, string>;
}

export const ProstheticTable = ({
  prosthetics,
  laboratories,
  dentists,
  onUpdateStatus,
  onDeleteProsthetic,
  onEditProsthetic,
  statusLabels,
  statusColors
}: ProstheticTableProps) => {
  // Sort prosthetics alphabetically by patient name
  const sortedProsthetics = [...prosthetics].sort((a, b) => {
    const nameA = `${a.patientlastname} ${a.patientfirstname}`.toLowerCase();
    const nameB = `${b.patientlastname} ${b.patientfirstname}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedProsthetics.map((prosthetic) => (
        <ProstheticBox
          key={prosthetic.id}
          prosthetic={prosthetic}
          laboratories={laboratories}
          dentists={dentists}
          onUpdateStatus={onUpdateStatus}
          onDeleteProsthetic={onDeleteProsthetic}
          onEditProsthetic={onEditProsthetic}
          statusLabels={statusLabels}
          statusColors={statusColors}
        />
      ))}
    </div>
  );
};
