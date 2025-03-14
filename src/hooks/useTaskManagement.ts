import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTeamMembers } from "@/hooks/team/useTeamMembers";
import { ACCOUNT_OWNER_EMAIL } from "@/hooks/useAccessControl";
import { MemberRole } from "@/types/TeamMember";

export type TaskStatus = "pending" | "in-progress" | "completed";

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  category: string;
  status: TaskStatus;
  dueDate: string;
}

export function useTaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    assigneeId: "",
    category: "",
    status: "pending",
    dueDate: new Date().toISOString().split("T")[0],
  });
  
  const { toast } = useToast();
  
  // Initialize with only one instance of the account owner
  const initialOwner = {
    id: "owner",
    firstName: "Raphael",
    lastName: "Haddad",
    role: "dentiste" as MemberRole,
    hireDate: "2023-01-01",
    contact: ACCOUNT_OWNER_EMAIL,
    location: "Paris, France",
    currentProjects: ["Administration", "Direction"],
    isAdmin: true,
    specialty: "omnipratique" as "omnipratique"
  };
  
  // Only pass one instance of the owner
  const { teamMembers } = useTeamMembers([initialOwner]);

  console.log("TeamMembers in useTaskManagement hook:", teamMembers);
  console.log("Team members count:", teamMembers.length);
  console.log("Is account owner in the list?", teamMembers.some(m => m.contact === ACCOUNT_OWNER_EMAIL));

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('tasks')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        const transformedTasks: Task[] = data.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || "",
          assigneeId: task.assignee_id,
          category: task.category,
          status: task.status as TaskStatus,
          dueDate: task.due_date,
        }));
        
        setTasks(transformedTasks);
      } catch (error: any) {
        console.error("Error fetching tasks:", error);
        toast({
          title: "Erreur",
          description: error.message || "Une erreur est survenue lors du chargement des tâches.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTasks();
  }, [toast]);

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.assigneeId || !newTask.category) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        assignee_id: newTask.assigneeId,
        category: newTask.category,
        status: newTask.status,
        due_date: newTask.dueDate,
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      const task: Task = {
        id: data.id,
        title: data.title,
        description: data.description || "",
        assigneeId: data.assignee_id,
        category: data.category,
        status: data.status,
        dueDate: data.due_date,
      };
      
      setTasks([...tasks, task]);
      
      setNewTask({
        title: "",
        description: "",
        assigneeId: "",
        category: "",
        status: "pending",
        dueDate: new Date().toISOString().split("T")[0],
      });
      
      setIsDialogOpen(false);
      
      toast({
        title: "Tâche ajoutée",
        description: `La tâche "${task.title}" a été ajoutée.`
      });
    } catch (error: any) {
      console.error("Error adding task:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'ajout de la tâche.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTaskStatus = async (id: string, status: TaskStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setTasks(tasks.map(t => 
        t.id === id ? { ...t, status } : t
      ));
    } catch (error: any) {
      console.error("Error updating task status:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour du statut.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setTasks(tasks.filter(t => t.id !== id));
      
      toast({
        title: "Tâche supprimée",
        description: "La tâche a été supprimée."
      });
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression de la tâche.",
        variant: "destructive"
      });
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const assigneeName = getAssigneeName(task.assigneeId, teamMembers).toLowerCase();
    
    return (
      task.title.toLowerCase().includes(searchLower) ||
      task.description.toLowerCase().includes(searchLower) ||
      assigneeName.includes(searchLower) ||
      task.category.toLowerCase().includes(searchLower) ||
      getStatusLabel(task.status).toLowerCase().includes(searchLower)
    );
  });

  return {
    tasks: filteredTasks,
    isDialogOpen,
    setIsDialogOpen,
    searchQuery,
    setSearchQuery,
    newTask,
    setNewTask,
    isLoading,
    handleAddTask,
    handleUpdateTaskStatus,
    handleDeleteTask,
    teamMembers
  };
}

export const getAssigneeName = (assigneeId: string, teamMembers: any[]) => {
  const member = teamMembers.find(m => m.id === assigneeId);
  return member ? `${member.firstName} ${member.lastName}` : "Non assigné";
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case "pending": return "En attente";
    case "in-progress": return "En cours";
    case "completed": return "Terminée";
    default: return status;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "pending": return "bg-yellow-100 text-yellow-800";
    case "in-progress": return "bg-blue-100 text-blue-800";
    case "completed": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
};
