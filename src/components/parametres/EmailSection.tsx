
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EmailSectionProps {
  user: User | null;
  loading: boolean;
  setLoading: (value: boolean) => void;
}

const EmailSection = ({ user, loading, setLoading }: EmailSectionProps) => {
  const [newEmail, setNewEmail] = useState(user?.email || "");

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });
      
      if (error) throw error;
      
      toast({
        title: "Email mis à jour",
        description: "Un lien de confirmation a été envoyé à votre nouvelle adresse email.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour de l'email.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adresse email</CardTitle>
        <CardDescription>
          Modifiez votre adresse email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdateEmail} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email actuel</Label>
            <Input
              id="email"
              value={user?.email || ""}
              disabled
              className="bg-gray-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newEmail">Nouvel email</Label>
            <Input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="nouveau@email.com"
            />
          </div>
          <Button 
            type="submit" 
            className="mt-4 bg-[#B88E23] hover:bg-[#927219]"
            disabled={loading || newEmail === user?.email}
          >
            {loading ? "Mise à jour..." : "Mettre à jour l'email"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Un email de confirmation sera envoyé à votre nouvelle adresse. Vous devrez cliquer sur le lien pour confirmer le changement.
      </CardFooter>
    </Card>
  );
};

export default EmailSection;
