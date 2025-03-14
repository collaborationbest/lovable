
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { User } from "@supabase/supabase-js";

export type UserData = {
  user: User | null;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  loading: boolean;
};

export const useUserData = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          setFirstName(profileData.first_name || "");
          setLastName(profileData.last_name || "");
          setIsAdmin(user.user_metadata?.is_admin !== undefined ? user.user_metadata.is_admin : true);
        } else {
          const metadata = user.user_metadata;
          if (metadata) {
            if (metadata.first_name) setFirstName(metadata.first_name);
            if (metadata.last_name) setLastName(metadata.last_name);
            setIsAdmin(metadata.is_admin !== undefined ? metadata.is_admin : true);
            
            if (metadata.first_name || metadata.last_name) {
              await supabase
                .from('profiles')
                .upsert({ 
                  id: user.id, 
                  first_name: metadata.first_name || "",
                  last_name: metadata.last_name || "",
                  email: user.email || ""
                });
            }
          }
        }
      } else {
        navigate("/auth");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données utilisateur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer vos informations. Veuillez vous reconnecter.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [navigate]);

  // Function to update user's name in the local state
  const updateUserName = (newFirstName: string, newLastName: string) => {
    setFirstName(newFirstName);
    setLastName(newLastName);
  };

  return {
    user,
    firstName,
    lastName,
    isAdmin,
    loading,
    setLoading,
    updateUserName,
    refreshUserData: fetchUserData
  };
};
