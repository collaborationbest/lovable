
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, ThumbsUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { useAuthState } from "@/hooks/access-control/useAuthState";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  submittedBy: string;
  submittedDate: string;
  votes: number;
  hasVoted: boolean;
}

const SuggestionManagement = () => {
  const { state } = useAuthState();
  const cabinetId = state.cabinetOwnerId;
  const userId = state.userId;
  
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSuggestion, setNewSuggestion] = useState({
    title: "",
    description: ""
  });
  
  const handleAddSuggestion = async () => {
    if (!newSuggestion.title.trim()) {
      toast.error("Veuillez ajouter un titre à votre suggestion");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const newSuggestionItem: Suggestion = {
        id: uuidv4(),
        title: newSuggestion.title,
        description: newSuggestion.description || "",
        submittedBy: "Vous",
        submittedDate: new Date().toISOString().split('T')[0],
        votes: 0,
        hasVoted: false
      };
      
      setTimeout(() => {
        setSuggestions([newSuggestionItem, ...suggestions]);
        setNewSuggestion({ title: "", description: "" });
        setIsDialogOpen(false);
        toast.success("Votre suggestion a été soumise avec succès");
        setIsSubmitting(false);
      }, 1000);
      
    } catch (error) {
      console.error("Erreur lors de l'ajout de la suggestion:", error);
      toast.error("Une erreur est survenue lors de l'ajout de votre suggestion");
      setIsSubmitting(false);
    }
  };
  
  const handleVote = (id: string) => {
    setSuggestions(
      suggestions.map(suggestion => {
        if (suggestion.id === id) {
          if (suggestion.hasVoted) {
            return { ...suggestion, votes: suggestion.votes - 1, hasVoted: false };
          } else {
            return { ...suggestion, votes: suggestion.votes + 1, hasVoted: true };
          }
        }
        return suggestion;
      })
    );
  };
  
  const filteredSuggestions = suggestions.filter(suggestion => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      suggestion.title.toLowerCase().includes(searchLower) ||
      suggestion.description.toLowerCase().includes(searchLower) ||
      suggestion.submittedBy.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 justify-between mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher des suggestions..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle suggestion
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle suggestion</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Titre
              </Label>
              <Input
                id="title"
                value={newSuggestion.title}
                onChange={(e) => setNewSuggestion({ ...newSuggestion, title: e.target.value })}
                placeholder="Titre de la suggestion"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={newSuggestion.description}
                onChange={(e) => setNewSuggestion({ ...newSuggestion, description: e.target.value })}
                placeholder="Décrivez votre suggestion en détail (optionnel)"
                className="col-span-3 min-h-[100px]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button onClick={handleAddSuggestion} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Envoi en cours...
                </>
              ) : (
                "Soumettre"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <Spinner size="lg" className="text-primary mb-4" />
          <p className="text-muted-foreground">Chargement des suggestions...</p>
        </div>
      ) : filteredSuggestions.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-md">
          <p className="text-muted-foreground">
            Aucune suggestion disponible. Commencez par en ajouter une.
          </p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Suggestion</TableHead>
                <TableHead className="hidden md:table-cell">Proposée par</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead>Votes</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuggestions.map((suggestion) => (
                <TableRow key={suggestion.id} className="cursor-pointer hover:bg-muted/30">
                  <TableCell>
                    <div className="font-medium">{suggestion.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {suggestion.description}
                    </div>
                    <div className="text-xs text-muted-foreground md:hidden mt-1">
                      {suggestion.submittedBy} • {format(new Date(suggestion.submittedDate), "dd/MM/yyyy")}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{suggestion.submittedBy}</TableCell>
                  <TableCell className="hidden md:table-cell">{format(new Date(suggestion.submittedDate), "dd/MM/yyyy")}</TableCell>
                  <TableCell>{suggestion.votes}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={suggestion.hasVoted ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleVote(suggestion.id)}
                      className={suggestion.hasVoted ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {suggestion.hasVoted ? "Voté" : "Voter"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default SuggestionManagement;
