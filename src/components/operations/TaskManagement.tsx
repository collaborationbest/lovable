import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, PenLine, Trash2, AlertTriangle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useTaskManagement, getAssigneeName, getStatusLabel, getStatusColor } from "@/hooks/useTaskManagement";
import { Spinner } from "@/components/ui/spinner";
import { ACCOUNT_OWNER_EMAIL } from "@/hooks/useAccessControl";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const TaskManagement = () => {
  const {
    tasks,
    isDialogOpen,
    setIsDialogOpen,
    searchQuery,
    setSearchQuery,
    newTask,
    setNewTask,
    isLoading,
    isCreating,
    handleAddTask,
    updateTaskStatus,
    handleDeleteTask,
    teamMembers,
    updateTask,
    cabinetId,
    isTaskOverdue
  } = useTaskManagement();
  
  const [editingTask, setEditingTask] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const getUniqueTeamMembers = () => {
    const uniqueMembers = new Map();
    
    teamMembers.forEach(member => {
      if ((!member.contact || !uniqueMembers.has(member.contact)) || 
          (member.contact === ACCOUNT_OWNER_EMAIL)) {
        if (member.contact) {
          uniqueMembers.set(member.contact, member);
        } else {
          uniqueMembers.set(member.id, member);
        }
      }
    });
    
    return Array.from(uniqueMembers.values());
  };
  
  const uniqueTeamMembers = getUniqueTeamMembers();
  
  const handleEditClick = (task) => {
    setEditingTask({...task, cabinetId: cabinetId});
    setIsEditDialogOpen(true);
  };
  
  const handleEditSave = () => {
    updateTask(editingTask);
    setIsEditDialogOpen(false);
  };
  
  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    handleDeleteTask(editingTask.id);
    setIsDeleteDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  if (!cabinetId && !isLoading) {
    return (
      <div className="text-center p-10 bg-gray-50 rounded-md">
        <p className="text-muted-foreground">
          Chargement des informations du cabinet...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 justify-between mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher des tâches..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle tâche
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle tâche</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Catégorie
              </Label>
              <Select
                value={newTask.category}
                onValueChange={(value) => setNewTask({ ...newTask, category: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appel">Appel</SelectItem>
                  <SelectItem value="remboursement">Remboursement</SelectItem>
                  <SelectItem value="télétransmission">Télétransmission</SelectItem>
                  <SelectItem value="suivi">Suivi</SelectItem>
                  <SelectItem value="paiement">Paiement</SelectItem>
                  <SelectItem value="report rdv">Report RDV</SelectItem>
                  <SelectItem value="prise rdv">Prise RDV</SelectItem>
                  <SelectItem value="prothese">Prothèse</SelectItem>
                  <SelectItem value="commande">Commande</SelectItem>
                  <SelectItem value="guide chirurgical">Guide chirurgical</SelectItem>
                  <SelectItem value="devis">Devis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Titre
              </Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="col-span-3 min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignee" className="text-right">
                Assigné à
              </Label>
              <Select
                value={newTask.assigneeId}
                onValueChange={(value) => setNewTask({ ...newTask, assigneeId: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionnez un membre" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueTeamMembers && uniqueTeamMembers.length > 0 ? (
                    uniqueTeamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.firstName} {member.lastName} ({member.role})
                        {member.contact === ACCOUNT_OWNER_EMAIL && " (Propriétaire)"}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      Aucun membre disponible
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Date d'échéance
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreating}>
              Annuler
            </Button>
            <Button onClick={handleAddTask} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Ajout en cours...
                </>
              ) : (
                "Ajouter"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier la tâche</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-category" className="text-right">
                    Catégorie
                  </Label>
                  <Select
                    value={editingTask.category}
                    onValueChange={(value) => setEditingTask({ ...editingTask, category: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appel">Appel</SelectItem>
                      <SelectItem value="remboursement">Remboursement</SelectItem>
                      <SelectItem value="télétransmission">Télétransmission</SelectItem>
                      <SelectItem value="suivi">Suivi</SelectItem>
                      <SelectItem value="paiement">Paiement</SelectItem>
                      <SelectItem value="report rdv">Report RDV</SelectItem>
                      <SelectItem value="prise rdv">Prise RDV</SelectItem>
                      <SelectItem value="prothese">Prothèse</SelectItem>
                      <SelectItem value="commande">Commande</SelectItem>
                      <SelectItem value="guide chirurgical">Guide chirurgical</SelectItem>
                      <SelectItem value="devis">Devis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-title" className="text-right">
                    Titre
                  </Label>
                  <Input
                    id="edit-title"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="edit-description" className="text-right pt-2">
                    Description
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={editingTask.description}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    className="col-span-3 min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-assignee" className="text-right">
                    Assigné à
                  </Label>
                  <Select
                    value={editingTask.assigneeId}
                    onValueChange={(value) => setEditingTask({ ...editingTask, assigneeId: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionnez un membre" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueTeamMembers && uniqueTeamMembers.length > 0 ? (
                        uniqueTeamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.firstName} {member.lastName} ({member.role})
                            {member.contact === ACCOUNT_OWNER_EMAIL && " (Propriétaire)"}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          Aucun membre disponible
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-dueDate" className="text-right">
                    Date d'échéance
                  </Label>
                  <Input
                    id="edit-dueDate"
                    type="date"
                    value={editingTask.dueDate}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-status" className="text-right">
                    Statut
                  </Label>
                  <Select
                    value={editingTask.status}
                    onValueChange={(value) => setEditingTask({ ...editingTask, status: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Changer le statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="in-progress">En cours</SelectItem>
                      <SelectItem value="completed">Terminée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-between">
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteClick}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleEditSave}>
                    Enregistrer
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cette tâche sera définitivement supprimée de notre serveur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <Spinner size="lg" className="text-primary mb-4" />
          <p className="text-muted-foreground">Chargement des tâches...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-md">
          <p className="text-muted-foreground">
            Aucune tâche disponible. Commencez par en ajouter une.
          </p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead className="hidden md:table-cell">Assigné à</TableHead>
                <TableHead className="hidden md:table-cell">Catégorie</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const overdue = isTaskOverdue(task.dueDate, task.status);
                
                return (
                  <TableRow 
                    key={task.id} 
                    className={`cursor-pointer hover:bg-muted/30 ${overdue ? 'bg-red-50' : ''}`}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {overdue && task.status !== "completed" && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        <span>{task.title}</span>
                      </div>
                      <div className="text-xs text-muted-foreground md:hidden">{getAssigneeName(task.assigneeId, teamMembers)}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {getAssigneeName(task.assigneeId, teamMembers)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{task.category}</TableCell>
                    <TableCell>
                      <span className={overdue && task.status !== "completed" ? "text-red-600 font-medium" : ""}>
                        {format(new Date(task.dueDate), "dd/MM/yyyy")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        overdue && task.status !== "completed" 
                          ? 'bg-red-100 text-red-800' 
                          : getStatusColor(task.status)
                      }`}>
                        {overdue && task.status !== "completed" ? 'En retard' : getStatusLabel(task.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleEditClick(task)}
                          title="Modifier"
                          className="text-primary hover:bg-primary/10 hover:text-primary"
                        >
                          <PenLine className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
