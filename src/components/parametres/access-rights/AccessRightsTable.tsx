
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Unlock } from "lucide-react";
import { PageAccessRights, MemberRole } from "@/types/TeamMember";
import { pages } from "@/utils/accessRightsData";

interface AccessRightsTableProps {
  accessRights: PageAccessRights[];
  selectedRole: MemberRole;
  onPageToggle: (pageId: string) => void;
}

const AccessRightsTable = ({ accessRights, selectedRole, onPageToggle }: AccessRightsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Page</TableHead>
            <TableHead className="text-center">Accès</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map(page => {
            const pageAccess = accessRights.find(p => p.pageId === page.id);
            const hasAccess = pageAccess?.roles.includes(selectedRole) || false;
            
            return (
              <TableRow key={page.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {hasAccess ? <Unlock className="h-4 w-4 text-green-500" /> : <Lock className="h-4 w-4 text-gray-400" />}
                    {page.name}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Checkbox
                      id={`${page.id}-${selectedRole}`}
                      checked={hasAccess}
                      onCheckedChange={() => onPageToggle(page.id)}
                      className="h-5 w-5 data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default AccessRightsTable;
