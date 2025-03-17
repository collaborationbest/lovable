import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useTaskManagement, getAssigneeName, getStatusLabel, getStatusColor } from "@/hooks/useTaskManagement";
import { Spinner } from "@/components/ui/spinner";
import { ACCOUNT_OWNER_EMAIL } from "@/hooks/useAccessControl";

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
    handleAddTask,
    updateTaskStatus,
    handleDeleteTask,
    teamMembers
  } = useTaskManagement();

  console.log("TeamMembers in TaskManagement:", teamMembers);
  console.log("Account owner email:", ACCOUNT_OWNER_EMAIL);
  
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
  console.log("Unique team members for dropdown:", uniqueTeamMembers.length);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Gestion des tâches</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Ajouter une tâche</Button>
          </DialogTrigger>
          <DialogContent>
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
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddTask}>
                Ajouter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher des tâches..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Spinner />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-md">
          <p className="text-muted-foreground">
            Aucune tâche disponible. Commencez par en ajouter une.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <Card key={task.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{task.title}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center">
                    <span className="text-sm font-medium w-24">Assigné à:</span>
                    <span className="text-sm">{getAssigneeName(task.assigneeId, teamMembers)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium w-24">Catégorie:</span>
                    <span className="text-sm">{task.category}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium w-24">Échéance:</span>
                    <span className="text-sm">{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium w-24">Statut:</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                      {getStatusLabel(task.status)}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Select
                  value={task.status}
                  onValueChange={(value) => {
                    updateTaskStatus(task.id, value as "pending" | "in-progress" | "completed");
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Changer le statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="in-progress">En cours</SelectItem>
                    <SelectItem value="completed">Terminée</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDeleteTask(task.id)}
                >
                  Supprimer
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
