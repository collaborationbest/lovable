
import React, { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/layout/Sidebar";
import TaskManagement from "@/components/operations/TaskManagement";
import ProstheticManagement from "@/components/operations/ProstheticManagement";
import OrderManagement from "@/components/operations/OrderManagement";

const Operations = () => {
  const [activeTab, setActiveTab] = useState("tasks");

  // Optimisé avec useCallback pour éviter les re-renders inutiles
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-6 animate-slideIn">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#5C4E3D]">Opérations</h1>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Gestion opérationnelle du cabinet</CardTitle>
            <CardDescription>
              Gérez les tâches, les arrivées de prothèses et les commandes à passer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="mb-6 grid grid-cols-3 md:w-[400px]">
                <TabsTrigger value="tasks" className="tab-transition">Tâches</TabsTrigger>
                <TabsTrigger value="prosthetics" className="tab-transition">Prothèses</TabsTrigger>
                <TabsTrigger value="orders" className="tab-transition">Commandes</TabsTrigger>
              </TabsList>
              
              <div className="tab-content-container">
                <TabsContent value="tasks" className="tab-transition mt-0">
                  <TaskManagement />
                </TabsContent>
                
                <TabsContent value="prosthetics" className="tab-transition mt-0">
                  <ProstheticManagement />
                </TabsContent>
                
                <TabsContent value="orders" className="tab-transition mt-0">
                  <OrderManagement />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Operations;
