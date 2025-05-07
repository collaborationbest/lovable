
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TeamMember, WeekDay } from "@/types/TeamMember";
import { saveCustomWorkingDay, deleteCustomWorkingDay } from "@/services/teamMemberCustomDaysService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface MemberScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember;
  cabinetId: string | null;
}

type ScheduleDay = {
  date: string;
  isWorking: boolean;
};

export default function MemberScheduleDialog({
  open,
  onOpenChange,
  member,
  cabinetId
}: MemberScheduleDialogProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState<string>("calendar");
  const [customDays, setCustomDays] = useState<ScheduleDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch custom days when dialog opens
  const fetchCustomDays = async () => {
    if (!member.id || !cabinetId) return;
    
    setIsLoading(true);
    try {
      // Fetch custom working days
      const { data: workingDaysData, error: workingDaysError } = await supabase
        .from('team_member_custom_days')
        .select('*')
        .eq('team_member_id', member.id)
        .eq('cabinet_id', cabinetId);
      
      if (workingDaysError) throw workingDaysError;
      
      if (workingDaysData) {
        const formattedData = workingDaysData.map(item => ({
          date: new Date(item.date).toISOString().split('T')[0],
          isWorking: item.is_working
        }));
        
        setCustomDays(formattedData);
      }
    } catch (error) {
      console.error("Error fetching custom days:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le planning personnalisé",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Call fetchCustomDays when dialog opens
  const handleDialogChange = (open: boolean) => {
    if (open) {
      fetchCustomDays();
    }
    onOpenChange(open);
  };

  // Function to mark member as working on selected date
  const markAsWorking = async () => {
    if (!selectedDate || !member.id || !cabinetId) return;
    
    const dateString = selectedDate.toISOString().split('T')[0];
    
    try {
      setIsLoading(true);
      const success = await saveCustomWorkingDay({
        team_member_id: member.id,
        date: dateString,
        is_working: true,
        cabinet_id: cabinetId
      });
      
      if (success) {
        // Update local state
        setCustomDays(prev => {
          const existingIndex = prev.findIndex(day => day.date === dateString);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = { date: dateString, isWorking: true };
            return updated;
          }
          return [...prev, { date: dateString, isWorking: true }];
        });
        
        toast({
          title: "Planification mise à jour",
          description: "Le membre a été ajouté à cette journée"
        });
      } else {
        throw new Error("Failed to update schedule");
      }
    } catch (error) {
      console.error("Error marking as working:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le planning",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to mark member as absent on selected date
  const markAsAbsent = async () => {
    if (!selectedDate || !member.id || !cabinetId) return;
    
    const dateString = selectedDate.toISOString().split('T')[0];
    
    try {
      setIsLoading(true);
      const success = await saveCustomWorkingDay({
        team_member_id: member.id,
        date: dateString,
        is_working: false,
        cabinet_id: cabinetId
      });
      
      if (success) {
        // Update local state
        setCustomDays(prev => {
          const existingIndex = prev.findIndex(day => day.date === dateString);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = { date: dateString, isWorking: false };
            return updated;
          }
          return [...prev, { date: dateString, isWorking: false }];
        });
        
        toast({
          title: "Planification mise à jour",
          description: "Le membre a été marqué comme absent pour cette journée"
        });
      } else {
        throw new Error("Failed to update schedule");
      }
    } catch (error) {
      console.error("Error marking as absent:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le planning",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to reset schedule for the selected date
  const resetSchedule = async () => {
    if (!selectedDate || !member.id) return;
    
    const dateString = selectedDate.toISOString().split('T')[0];
    
    try {
      setIsLoading(true);
      const success = await deleteCustomWorkingDay(member.id, dateString);
      
      if (success) {
        // Update local state
        setCustomDays(prev => prev.filter(day => day.date !== dateString));
        
        toast({
          title: "Planification réinitialisée",
          description: "Le planning standard s'appliquera pour cette journée"
        });
      } else {
        throw new Error("Failed to reset schedule");
      }
    } catch (error) {
      console.error("Error resetting schedule:", error);
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser le planning",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get day status (working, absent, or default)
  const getDayStatus = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const customDay = customDays.find(day => day.date === dateString);
    
    if (customDay) {
      return customDay.isWorking ? "working" : "absent";
    }
    
    // Check if the day is in the member's regular working days
    const dayOfWeek = date.toLocaleDateString('en-US', {
      weekday: 'long'
    }).toLowerCase();
    
    return member.workingDays?.includes(dayOfWeek as WeekDay) ? "default-working" : "default-absent";
  };

  // Render day based on its status
  const renderDay = (date: Date) => {
    const status = getDayStatus(date);
    
    switch (status) {
      case "working":
        return <div className="h-full w-full bg-green-100 rounded-full" />;
      case "absent":
        return <div className="h-full w-full bg-red-100 rounded-full" />;
      case "default-working":
        return <div className="h-full w-full border-2 border-green-200 rounded-full" />;
      case "default-absent":
        return <div className="h-full w-full border-2 border-red-200 rounded-full" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Gérer le planning de {member.firstName} {member.lastName}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar">Calendrier</TabsTrigger>
            <TabsTrigger value="list">Liste des jours spéciaux</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="space-y-4 pt-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-100 rounded-full"></div>
                  <span>Jour travaillé</span>
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-100 rounded-full"></div>
                  <span>Absent</span>
                </Badge>
              </div>
            </div>
            
            <Calendar 
              mode="single" 
              selected={selectedDate} 
              onSelect={setSelectedDate}
              disabled={{ before: new Date() }}
              components={{
                DayContent: (props) => (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {props.date.getDate()}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {renderDay(props.date)}
                    </div>
                  </div>
                )
              }}
            />
            
            {selectedDate && (
              <div className="space-y-2 pt-2">
                <p className="text-sm">
                  {selectedDate.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-green-500 text-green-600 hover:bg-green-50"
                    onClick={markAsWorking}
                    disabled={isLoading}
                  >
                    Marquer comme présent
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-red-500 text-red-600 hover:bg-red-50"
                    onClick={markAsAbsent}
                    disabled={isLoading}
                  >
                    Marquer comme absent
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={resetSchedule}
                    disabled={isLoading}
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="list">
            <ScrollArea className="h-[300px] pr-4">
              {customDays.length > 0 ? (
                <div className="space-y-3 py-2">
                  {customDays
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map(day => {
                      const date = new Date(day.date);
                      return (
                        <div key={day.date} className="flex items-center justify-between p-2 rounded-lg border">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            <span>
                              {date.toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long'
                              })}
                            </span>
                            <Badge variant={day.isWorking ? "success" : "destructive"} className="ml-2">
                              {day.isWorking ? "Présent" : "Absent"}
                            </Badge>
                          </div>
                          
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={async () => {
                              setSelectedDate(date);
                              await resetSchedule();
                            }}
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-10 text-center text-muted-foreground">
                  <CalendarIcon className="h-10 w-10 mb-2 opacity-50" />
                  <p>Aucun jour personnalisé</p>
                  <p className="text-sm">Utilisez le calendrier pour ajouter des jours spéciaux</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <Button onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
