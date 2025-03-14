
import { useUserData } from "@/hooks/parametres/useUserData";
import { useLogout } from "@/hooks/parametres/useLogout";
import Sidebar from "@/components/layout/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import components
import Header from "@/components/parametres/Header";
import ProfileSection from "@/components/parametres/ProfileSection";
import AccessRightsSection from "@/components/parametres/AccessRightsSection";

const Parametres = () => {
  const { user, firstName, lastName, isAdmin, loading, setLoading, updateUserName } = useUserData();
  const { handleLogout } = useLogout();

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#f5f2ee] to-white">
      <Sidebar />
      <div className="flex-1 p-8 space-y-8 content-area custom-scrollbar">
        <Header 
          onLogout={handleLogout}
          loading={loading}
        />
        
        {loading ? (
          <div>Chargement en cours...</div>
        ) : (
          <Tabs defaultValue="profile" className="max-w-3xl">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              {isAdmin && <TabsTrigger value="access-rights">Gestion des droits</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <ProfileSection 
                userId={user?.id}
                initialFirstName={firstName}
                initialLastName={lastName}
                loading={loading}
                setLoading={setLoading}
                onProfileUpdated={updateUserName}
              />
            </TabsContent>
            
            {isAdmin && (
              <TabsContent value="access-rights">
                <AccessRightsSection />
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Parametres;
