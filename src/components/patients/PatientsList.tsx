
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PatientData {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  datenaissance: string;
  adresse?: string;
  ville?: string;
  codepostal?: string;
  lastappointment?: string;
  nextappointment?: string;
}

interface PatientsListProps {
  patients: PatientData[];
}

const PatientsList: React.FC<PatientsListProps> = ({ patients }) => {
  if (patients.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-muted-foreground">Aucun patient trouvé.</p>
        <p className="mt-2">
          Importez vos patients à partir d'un fichier CSV ou XLSX.
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Liste des patients</CardTitle>
        <CardDescription>{patients.length} patients au total</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date de naissance</TableHead>
                <TableHead>Ville</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="font-medium">{patient.nom}</TableCell>
                  <TableCell>{patient.prenom}</TableCell>
                  <TableCell>{patient.telephone || "—"}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{patient.email || "—"}</TableCell>
                  <TableCell>{patient.datenaissance ? new Date(patient.datenaissance).toLocaleDateString() : "—"}</TableCell>
                  <TableCell>{patient.ville || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientsList;
