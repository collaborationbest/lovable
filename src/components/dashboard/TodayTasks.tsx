
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { getStatusLabel, getStatusColor, Task, TaskStatus } from "@/hooks/useTaskManagement";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

const TodayTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cabinetId, setCabinetId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCabinetId = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.id) {
          const { data: teamMemberData, error: teamMemberError } = await supabase
            .from('team_members')
            .select('cabinet_id')
            .eq('user_id', userData.user.id)
            .maybeSingle();
            
          if (teamMemberData?.cabinet_id) {
            setCabinetId(teamMemberData.cabinet_id);
            console.log("TodayTasks - Current cabinet ID:", teamMemberData.cabinet_id);
          }
        }
      } catch (error) {
        console.error("Error fetching cabinet ID:", error);
      }
    };
    
    fetchCabinetId();
  }, []);

  useEffect(() => {
    const fetchUpcomingTasks = async () => {
      try {
        setIsLoading(true);
        // Include all tasks, regardless of due date, so we can show overdue tasks
        const today = new Date();
        
        let query = supabase
          .from('tasks')
          .select('*')
          .order('due_date', { ascending: true })
          .limit(10); // Limit to 10 upcoming tasks
        
        // Filter by cabinet ID if available
        if (cabinetId) {
          query = query.eq('cabinet_id', cabinetId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        const transformedTasks: Task[] = data.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || "",
          assigneeId: task.assignee_id,
          category: task.category,
          status: task.status as TaskStatus,
          dueDate: task.due_date,
          cabinetId: task.cabinet_id
        }));
        
        setTasks(transformedTasks);
      } catch (error) {
        console.error("Error fetching upcoming tasks:", error);
      } finally {
        // Add a small delay to prevent flash of loading state
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      }
    };
    
    if (cabinetId) {
      fetchUpcomingTasks();
    }
  }, [cabinetId]);

  const renderTaskSkeletons = () => (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-3 rounded-lg border border-[#B88E23]/20 flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-5 w-3/4 mb-1" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-[#5C4E3D]">Tâches à réaliser</CardTitle>
        </CardHeader>
        <CardContent>
          {renderTaskSkeletons()}
        </CardContent>
      </Card>
    );
  }

  // Format date to display in a user-friendly way
  const formatDate = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const taskDate = new Date(dateString);
    taskDate.setHours(0, 0, 0, 0);
    
    if (taskDate.getTime() === today.getTime()) {
      return "Aujourd'hui";
    } else if (taskDate.getTime() === tomorrow.getTime()) {
      return "Demain";
    } else {
      return taskDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  // Check if a task is overdue
  const isTaskOverdue = (dueDate: string, status: TaskStatus) => {
    if (status === "completed") return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const taskDueDate = new Date(dueDate);
    taskDueDate.setHours(0, 0, 0, 0);
    
    return taskDueDate < today;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-[#5C4E3D]">Tâches à réaliser</CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            Aucune tâche à venir
          </div>
        ) : (
          <ul className="space-y-2">
            {tasks.map(task => {
              const overdue = isTaskOverdue(task.dueDate, task.status);
              
              return (
                <li 
                  key={task.id} 
                  className={`p-3 rounded-lg border ${overdue ? 'border-red-300 bg-red-50' : 'border-[#B88E23]/20'} flex items-center gap-2`}
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : overdue ? (
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  ) : (
                    <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{task.title}</p>
                    <p className="text-sm text-gray-500 truncate">{task.category}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-xs px-2 py-1 rounded-full ${overdue && task.status !== 'completed' ? 'bg-red-100 text-red-800' : getStatusColor(task.status)}`}>
                      {overdue && task.status !== 'completed' ? 'En retard' : getStatusLabel(task.status)}
                    </span>
                    <span className={`text-xs mt-1 ${overdue ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayTasks;
