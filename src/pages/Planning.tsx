
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, List, LayoutGrid } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Sidebar from "@/components/layout/Sidebar";

type EventType = 'meeting' | 'task';

interface Event {
  id: string;
  title: string;
  date: Date;
  type: EventType;
  completed?: boolean;
}

const Planning = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState<{
    title: string;
    type: EventType;
    date: Date;
  }>({
    title: '',
    type: 'task',
    date: new Date()
  });
  const [open, setOpen] = useState(false);
  const [activeView, setActiveView] = useState<"list" | "calendar">("list");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const addEvent = () => {
    if (newEvent.title) {
      const event: Event = {
        id: Date.now().toString(),
        title: newEvent.title,
        date: newEvent.date,
        type: newEvent.type,
        completed: false
      };
      setEvents([...events, event]);
      setNewEvent({ title: '', type: 'task', date: new Date() });
      setOpen(false); // Ferme la popup après l'ajout
    }
  };

  const toggleEventComplete = (eventId: string) => {
    setEvents(events.map(event => 
      event.id === eventId 
        ? { ...event, completed: !event.completed }
        : event
    ));
  };

  // Trier les événements par date
  const sortedEvents = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Filtrer les événements pour le jour sélectionné dans la vue calendrier
  const getEventsForDate = (date: Date) => {
    return sortedEvents.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };

  // Composant pour la vue liste
  const ListView = () => (
    <Card className="border-[#B88E23]/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-[#5C4E3D]">Liste des événements</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedEvents.length > 0 ? (
          <ul className="space-y-2">
            {sortedEvents.map(event => (
              <li
                key={event.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-[#B88E23]/20 hover:bg-[#B88E23]/5"
              >
                <input
                  type="checkbox"
                  checked={event.completed}
                  onChange={() => toggleEventComplete(event.id)}
                  className="rounded border-[#B88E23]"
                />
                <div className="flex-1">
                  <span className={`block ${event.completed ? 'line-through text-[#5C4E3D]/60' : 'text-[#5C4E3D]'}`}>
                    {event.title}
                  </span>
                  <span className="text-sm text-[#5C4E3D]/60">
                    {event.date.toLocaleDateString('fr-FR', { 
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <CalendarIcon 
                  className={`h-4 w-4 ${event.type === 'meeting' ? 'text-blue-500' : 'text-green-500'}`}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[#5C4E3D]/60 text-center py-6">
            Aucun événement planifié
          </p>
        )}
      </CardContent>
    </Card>
  );

  // Composant pour la vue calendrier
  const CalendarView = () => {
    const selectedDateEvents = getEventsForDate(selectedDate);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-7 md:gap-4 gap-6">
        <div className="md:col-span-3 lg:col-span-2">
          <Card className="border-[#B88E23]/20">
            <CardContent className="p-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="w-full"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "text-[#5C4E3D] text-sm",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-[#5C4E3D]/60 w-8 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "text-center text-sm relative [&:has([aria-selected])]:bg-[#B88E23]/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 h-8 w-8",
                  nav_button_next: "hover:bg-[#B88E23]/10",
                  nav_button_previous: "hover:bg-[#B88E23]/10",
                  day_selected: "bg-[#B88E23] text-white hover:bg-[#B88E23]/90",
                  day_today: "bg-[#B88E23]/10 text-[#B88E23]"
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-4 lg:col-span-5">
          <Card className="border-[#B88E23]/20 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#5C4E3D] text-lg">
                Événements du {selectedDate.toLocaleDateString('fr-FR', { 
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length > 0 ? (
                <ul className="space-y-2">
                  {selectedDateEvents.map(event => (
                    <li
                      key={event.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-[#B88E23]/20 hover:bg-[#B88E23]/5"
                    >
                      <input
                        type="checkbox"
                        checked={event.completed}
                        onChange={() => toggleEventComplete(event.id)}
                        className="rounded border-[#B88E23]"
                      />
                      <div className="flex-1">
                        <span className={`block ${event.completed ? 'line-through text-[#5C4E3D]/60' : 'text-[#5C4E3D]'}`}>
                          {event.title}
                        </span>
                      </div>
                      <CalendarIcon 
                        className={`h-4 w-4 ${event.type === 'meeting' ? 'text-blue-500' : 'text-green-500'}`}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[#5C4E3D]/60 text-center py-6">
                  Aucun événement pour cette date
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#f5f2ee] to-white">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-[#5C4E3D]">Planning</h1>
              
              {/* Sélecteur de vue */}
              <div className="border border-[#B88E23]/20 rounded-md overflow-hidden ml-4">
                <Button
                  variant={activeView === "list" ? "default" : "outline"}
                  className={`px-3 h-8 rounded-none ${activeView === "list" ? "bg-[#B88E23] hover:bg-[#B88E23]/90" : ""}`}
                  onClick={() => setActiveView("list")}
                >
                  <List className="h-4 w-4 mr-1" />
                  Liste
                </Button>
                <Button
                  variant={activeView === "calendar" ? "default" : "outline"}
                  className={`px-3 h-8 rounded-none ${activeView === "calendar" ? "bg-[#B88E23] hover:bg-[#B88E23]/90" : ""}`}
                  onClick={() => setActiveView("calendar")}
                >
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Calendrier
                </Button>
              </div>
            </div>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#B88E23] hover:bg-[#B88E23]/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel événement
                </Button>
              </DialogTrigger>
              <DialogContent className="p-6 w-[90vw] max-w-[400px]">
                <DialogHeader className="pb-4">
                  <DialogTitle className="text-[#5C4E3D] text-xl">Ajouter un événement</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title" className="text-[#5C4E3D]">Titre</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="Nom de l'événement"
                      className="border-[#B88E23]/20 focus:ring-[#B88E23]/20"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label className="text-[#5C4E3D]">Type</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={newEvent.type === 'task' ? 'default' : 'outline'}
                        onClick={() => setNewEvent({ ...newEvent, type: 'task' })}
                        className={`flex-1 ${newEvent.type === 'task' ? 'bg-[#B88E23] hover:bg-[#B88E23]/90' : 'border-[#B88E23]/20'}`}
                      >
                        Tâche
                      </Button>
                      <Button
                        type="button"
                        variant={newEvent.type === 'meeting' ? 'default' : 'outline'}
                        onClick={() => setNewEvent({ ...newEvent, type: 'meeting' })}
                        className={`flex-1 ${newEvent.type === 'meeting' ? 'bg-[#B88E23] hover:bg-[#B88E23]/90' : 'border-[#B88E23]/20'}`}
                      >
                        Meeting
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-[#5C4E3D]">Date</Label>
                    <div className="border border-[#B88E23]/20 rounded-lg p-2 bg-white/50">
                      <Calendar
                        mode="single"
                        selected={newEvent.date}
                        onSelect={(date) => date && setNewEvent({ ...newEvent, date })}
                        className="w-full max-w-[260px] mx-auto"
                        classNames={{
                          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                          month: "space-y-4",
                          caption: "text-[#5C4E3D] text-sm",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex",
                          head_cell: "text-[#5C4E3D]/60 w-8 font-normal text-[0.8rem]",
                          row: "flex w-full mt-2",
                          cell: "text-center text-sm relative [&:has([aria-selected])]:bg-[#B88E23]/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 h-8 w-8",
                          nav_button_next: "hover:bg-[#B88E23]/10",
                          nav_button_previous: "hover:bg-[#B88E23]/10",
                          day_selected: "bg-[#B88E23] text-white hover:bg-[#B88E23]/90",
                          day_today: "bg-[#B88E23]/10 text-[#B88E23]"
                        }}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={addEvent} 
                    className="w-full bg-[#B88E23] hover:bg-[#B88E23]/90 mt-2"
                  >
                    Ajouter
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-2">
            {activeView === "list" ? <ListView /> : <CalendarView />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planning;
