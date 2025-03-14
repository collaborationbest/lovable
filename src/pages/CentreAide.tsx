import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, HelpCircle, Phone, Mail, MessageSquare, ChevronDown, ChevronUp, Plus, BookOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useContacts } from "@/components/boites-a-outils/useContacts";
import ContactsTable from "@/components/boites-a-outils/ContactsTable";
import ContactFormDialog from "@/components/boites-a-outils/ContactFormDialog";

const faq = [
  {
    question: "Comment ajouter un nouveau praticien à mon équipe ?",
    answer: "Pour ajouter un nouveau praticien, rendez-vous dans la section 'Équipe' du menu principal. Cliquez sur le bouton 'Ajouter' en haut à droite, puis complétez le formulaire avec les informations du praticien. N'oubliez pas de spécifier sa spécialité et son statut dans le cabinet."
  },
  {
    question: "Comment gérer mon planning ?",
    answer: "Le planning se gère depuis la section 'Planning' accessible depuis le menu principal. Vous pouvez ajouter de nouveaux rendez-vous en cliquant sur un créneau horaire disponible, et modifier ou supprimer des rendez-vous existants en cliquant dessus. Vous pouvez également filtrer l'affichage par praticien."
  },
  {
    question: "Comment importer mes patients depuis un autre logiciel ?",
    answer: "Pour importer vos patients, accédez à la section 'Patients', puis cliquez sur le bouton 'Importer' en haut à droite. Vous pourrez alors sélectionner un fichier CSV ou Excel contenant vos données. Assurez-vous que les colonnes correspondent aux champs requis (nom, prénom, date de naissance, etc.)."
  },
  {
    question: "Comment gérer mes documents administratifs ?",
    answer: "La section 'Documents' vous permet de gérer tous vos documents. Vous pouvez créer des dossiers pour organiser vos fichiers, télécharger de nouveaux documents ou en générer automatiquement. Les documents sont classés par catégories pour faciliter la recherche."
  },
  {
    question: "Comment utiliser les outils IA du logiciel ?",
    answer: "Les outils d'intelligence artificielle sont accessibles depuis la section 'Outils IA'. Vous y trouverez différentes fonctionnalités comme l'analyse de local, la création de business plan, ou encore l'aide à la gestion administrative. Chaque outil dispose de son propre formulaire à compléter pour obtenir des résultats personnalisés."
  },
  {
    question: "Comment modifier mes paramètres de compte ?",
    answer: "Pour modifier vos paramètres de compte, cliquez sur 'Paramètres' dans le menu en bas à gauche. Vous pourrez alors modifier vos informations personnelles, vos préférences de notification, et gérer les accès des différents utilisateurs de votre cabinet."
  },
  {
    question: "Comment contacter le support technique ?",
    answer: "Vous pouvez contacter le support technique par email à support@dentalpilote.fr ou par téléphone au 01 23 45 67 89 du lundi au vendredi de 9h à 18h. Vous pouvez également utiliser le formulaire de contact dans l'onglet 'Support' de cette page d'aide."
  },
  {
    question: "Comment exporter mes données ?",
    answer: "Pour exporter vos données, accédez à la section 'Paramètres', puis cliquez sur l'onglet 'Exports'. Vous pourrez alors sélectionner les données que vous souhaitez exporter (patients, rendez-vous, documents, etc.) et le format d'export (CSV, Excel, PDF)."
  }
];

const resources = [
  {
    title: "Guide d'utilisation complet",
    description: "Découvrez toutes les fonctionnalités du logiciel en détail",
    icon: BookOpen,
    link: "#"
  },
  {
    title: "Tutoriels vidéo",
    description: "Apprenez visuellement avec nos vidéos explicatives",
    icon: MessageSquare,
    link: "#"
  },
  {
    title: "Webinaires",
    description: "Participez à nos sessions de formation en ligne",
    icon: MessageSquare,
    link: "#"
  }
];

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        className="flex justify-between items-center w-full py-4 text-left font-medium text-[#5C4E3D]"
        onClick={() => setIsOpen(!isOpen)}
      >
        {question}
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-[#B88E23]" />
        ) : (
          <ChevronDown className="h-5 w-5 text-[#B88E23]" />
        )}
      </button>
      {isOpen && (
        <div className="pb-4 text-[#5C4E3D]/80">
          {answer}
        </div>
      )}
    </div>
  );
};

const CentreAide = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [faqItems, setFaqItems] = useState(faq);
  const { toast } = useToast();
  
  const {
    contacts,
    newContact,
    editingContact,
    isDialogOpen: isContactDialogOpen,
    isLoading,
    cabinetId,
    setSearchQuery: setContactSearchQuery,
    setNewContact,
    setEditingContact,
    setIsDialogOpen: setIsContactDialogOpen,
    handleAddContact,
    handleEditContact,
    handleDeleteContact,
    openEditDialog
  } = useContacts();
  
  const filteredFAQ = faqItems.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddFAQ = () => {
    if (newQuestion.trim() === "" || newAnswer.trim() === "") {
      toast({
        title: "Champs requis",
        description: "La question et la réponse sont requises.",
        variant: "destructive"
      });
      return;
    }
    
    const newFaqItem = {
      question: newQuestion,
      answer: newAnswer
    };
    
    setFaqItems([...faqItems, newFaqItem]);
    setNewQuestion("");
    setNewAnswer("");
    setIsDialogOpen(false);
    
    toast({
      title: "Question ajoutée",
      description: "Votre question a été ajoutée avec succès."
    });
  };
  
  const handleContactDialogCancel = () => {
    setIsContactDialogOpen(false);
    if (editingContact) setEditingContact(null);
  };
  
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#f5f2ee] to-white">
      <Sidebar />
      <div className="flex-1 h-screen flex flex-col items-center justify-start px-4 py-6 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-[#f5f2ee] flex items-center justify-center text-[#B88E23]">
              <HelpCircle size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#5C4E3D]">Centre d'aide</h1>
              <p className="text-[#5C4E3D]/70">Trouvez des réponses à vos questions</p>
            </div>
          </div>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#5C4E3D]/50" />
            <Input
              className="pl-10 py-6 text-lg bg-white border-[#B88E23]/20"
              placeholder="Rechercher dans la documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="contacts" className="w-full">
            <TabsList className="w-full justify-start bg-[#f5f2ee]/70 mb-4">
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="trousseau">Trousseau</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>
            
            <TabsContent value="contacts" className="mt-0">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Mes Contacts</CardTitle>
                    <CardDescription>
                      Gérez votre carnet d'adresses professionnelles
                    </CardDescription>
                  </div>
                  <Button 
                    className="bg-[#B88E23] hover:bg-[#8A6A1B] text-white"
                    onClick={() => setIsContactDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un contact
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <ContactsTable 
                    contacts={contacts}
                    isLoading={isLoading}
                    cabinetId={cabinetId}
                    searchQuery={searchQuery}
                    onEdit={openEditDialog}
                    onDelete={handleDeleteContact}
                  />
                </CardContent>
              </Card>
              
              <ContactFormDialog 
                isOpen={isContactDialogOpen}
                onOpenChange={setIsContactDialogOpen}
                editingContact={editingContact}
                newContact={newContact}
                onNewContactChange={setNewContact}
                onEditingContactChange={setEditingContact}
                onSave={editingContact ? handleEditContact : handleAddContact}
                onCancel={handleContactDialogCancel}
              />
            </TabsContent>
            
            <TabsContent value="trousseau" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Trousseau</CardTitle>
                  <CardDescription>
                    Gérez vos clés et accès sécurisés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-64 text-[#5C4E3D]/70">
                    Cette fonctionnalité sera disponible prochainement.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="faq" className="mt-0">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Questions fréquentes</CardTitle>
                    <CardDescription>
                      Retrouvez les réponses aux questions les plus courantes
                    </CardDescription>
                  </div>
                  <Button 
                    className="bg-[#B88E23] hover:bg-[#8A6A1B] text-white"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une question
                  </Button>
                </CardHeader>
                <CardContent>
                  {filteredFAQ.length > 0 ? (
                    filteredFAQ.map((item, index) => (
                      <FAQItem key={index} question={item.question} answer={item.answer} />
                    ))
                  ) : (
                    <div className="py-8 text-center text-[#5C4E3D]/70">
                      Aucun résultat ne correspond à votre recherche.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="support" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Contactez notre support</CardTitle>
                  <CardDescription>
                    Notre équipe est disponible pour vous aider
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-[#f5f2ee] flex items-center justify-center text-[#B88E23] mt-1">
                        <Phone size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#5C4E3D] mb-1">Par téléphone</h3>
                        <p className="text-[#5C4E3D]/70 mb-2">Du lundi au vendredi, de 9h à 18h</p>
                        <p className="text-[#B88E23] font-medium">01 23 45 67 89</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-[#f5f2ee] flex items-center justify-center text-[#B88E23] mt-1">
                        <Mail size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#5C4E3D] mb-1">Par email</h3>
                        <p className="text-[#5C4E3D]/70 mb-2">Réponse sous 24h ouvrées</p>
                        <p className="text-[#B88E23] font-medium">support@dentalpilote.fr</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-[#B88E23]/10 pt-6">
                    <h3 className="font-medium text-[#5C4E3D] mb-4">Formulaire de contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-[#5C4E3D]/70 mb-1">
                          Nom complet
                        </label>
                        <Input id="name" placeholder="Votre nom" />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-[#5C4E3D]/70 mb-1">
                          Email
                        </label>
                        <Input id="email" type="email" placeholder="Votre email" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="subject" className="block text-sm font-medium text-[#5C4E3D]/70 mb-1">
                        Sujet
                      </label>
                      <Input id="subject" placeholder="Sujet de votre demande" />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="message" className="block text-sm font-medium text-[#5C4E3D]/70 mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Détaillez votre question ou problème"
                      />
                    </div>
                    <Button className="bg-[#B88E23] hover:bg-[#8A6A1B] text-white">
                      Envoyer ma demande
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle question</DialogTitle>
            <DialogDescription>
              Créez une nouvelle question et sa réponse pour la FAQ.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="question" className="text-sm font-medium text-[#5C4E3D]/70">
                Question
              </label>
              <Input 
                id="question" 
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Saisissez votre question" 
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="answer" className="text-sm font-medium text-[#5C4E3D]/70">
                Réponse
              </label>
              <textarea
                id="answer"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Saisissez votre réponse"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button className="bg-[#B88E23] hover:bg-[#8A6A1B] text-white" onClick={handleAddFAQ}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CentreAide;
