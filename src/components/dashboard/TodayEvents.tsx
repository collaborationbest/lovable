import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CalendarClock, CheckCircle2, CalendarMinus, CalendarX, CalendarPlus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { useCabinet } from "@/hooks/useCabinet";

interface Event {
  id: string;
  title: string;
  date: Date;
  type: string;
  completed: boolean;
  teamMemberName?: string;
  endDate?: Date;
}

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
}

const TodayEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { cabinetId, isLoading: isCabinetLoading } = useCabinet();

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (isCabinetLoading) return;
        
        if (!cabinetId) {
          console.log("No cabinet ID available, cannot fetch events");
          setIsLoading(false);
          return;
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        console.log(`Fetching events for cabinet ID: ${cabinetId}`);
        
        const {
          data: eventData,
          error: eventError
        } = await supabase.from('events')
          .select('*')
          .eq('cabinet_id', cabinetId)
          .gte('date', today.toISOString())
          .order('date', { ascending: true })
          .limit(10);
        
        if (eventError) throw eventError;
        
        if (!eventData || eventData.length === 0) {
          setEvents([]);
          setIsLoading(false);
          return;
        }

        const teamMemberIds = eventData.filter(event => event.team_member_id).map(event => event.team_member_id);

        let teamMembersMap: Record<string, {
          first_name: string;
          last_name: string;
        }> = {};
        
        if (teamMemberIds.length > 0) {
          const {
            data: teamMembersData,
            error: teamMembersError
          } = await supabase.from('team_members')
            .select('id, first_name, last_name')
            .in('id', teamMemberIds)
            .eq('cabinet_id', cabinetId);
          
          if (teamMembersError) {
            console.error("Error fetching team members data:", teamMembersError);
          } else if (teamMembersData) {
            teamMembersMap = teamMembersData.reduce((acc, member) => {
              acc[member.id] = {
                first_name: member.first_name,
                last_name: member.last_name
              };
              return acc;
            }, {} as Record<string, {
              first_name: string;
              last_name: string;
            }>);
          }
        }

        const transformedEvents: Event[] = eventData.map(event => ({
          id: event.id,
          title: event.title,
          date: new Date(event.date),
          type: event.type,
          completed: event.completed || false,
          teamMemberName: event.team_member_id && teamMembersMap[event.team_member_id] ? `${teamMembersMap[event.team_member_id].first_name || ''} ${teamMembersMap[event.team_member_id].last_name || ''}`.trim() : '',
          endDate: event.end_date ? new Date(event.end_date) : undefined
        }));
        
        setEvents(transformedEvents);
      } catch (error: any) {
        console.error("Error fetching upcoming events:", error);
        setError("Impossible de récupérer les événements");
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      }
    };
    
    fetchUpcomingEvents();
  }, [cabinetId, isCabinetLoading]);

  const renderEventSkeletons = () => (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-3 rounded-lg border border-[#B88E23]/20 flex flex-col items-center text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-4 w-20 my-1" />
          <Skeleton className="h-3 w-16 mt-1" />
        </div>
      ))}
    </div>
  );

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "conges":
        return <CalendarMinus className="h-5 w-5 text-amber-500" />;
      case "arret_maladie":
        return <CalendarX className="h-5 w-5 text-red-500" />;
      case "formation":
        return <CalendarPlus className="h-5 w-5 text-blue-500" />;
      default:
        return <CalendarClock className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const getEventTypeName = (type: string) => {
    switch (type) {
      case "conges":
        return "Congés";
      case "arret_maladie":
        return "Arrêt maladie";
      case "formation":
        return "Formation";
      default:
        return "Événement";
    }
  };
  
  const getDateRangeText = (event: Event) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    
    let startDateText = '';
    
    if (eventDate.getTime() === today.getTime()) {
      startDateText = "Aujourd'hui";
    } else if (eventDate.getTime() === tomorrow.getTime()) {
      startDateText = "Demain";
    } else {
      startDateText = eventDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
      });
    }
    
    if (event.endDate) {
      const endDate = event.endDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
      });
      
      if (event.date.toDateString() !== event.endDate.toDateString()) {
        return `${startDateText} - ${endDate}`;
      }
    }
    return startDateText;
  };

  if (isLoading || isCabinetLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-[#5C4E3D]">Événements à venir</CardTitle>
        </CardHeader>
        <CardContent>
          {renderEventSkeletons()}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-[#5C4E3D]">Événements à venir</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-red-500">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-[#5C4E3D]">Événements à venir</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            Aucun événement à venir
          </div>
        ) : (
          <ul className="space-y-2">
            {events.map(event => (
              <li key={event.id} className="p-3 rounded-lg border border-[#B88E23]/20 flex flex-col items-center text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  {event.completed ? <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" /> : getEventTypeIcon(event.type)}
                  <span className="font-medium">{event.title}</span>
                </div>
                
                {event.teamMemberName && <p className="text-sm text-gray-700 font-medium">{event.teamMemberName}</p>}
                
                <div className="text-xs text-gray-500 mt-1">
                  {getDateRangeText(event)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayEvents;
