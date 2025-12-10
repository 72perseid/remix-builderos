import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { syncUserFromXano } from "@/lib/syncXano";

const Index = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const handleTestSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncUserFromXano("tugce@ambitiouslabs.io");
      
      if (result.success) {
        console.log("Xano sync result:", result);
        toast({
          title: "Success",
          description: "Data synced successfully from Xano!",
        });
      } else {
        console.error("Xano sync error:", result.error);
        toast({
          title: "Error",
          description: result.error || "Failed to sync data from Xano",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Xano sync exception:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="mb-4 text-4xl font-bold">Welcome to Your Blank App</h1>
        <p className="text-xl text-muted-foreground">Start building your amazing project here!</p>
        
        <Button 
          onClick={handleTestSync} 
          disabled={isSyncing}
          className="mt-4"
        >
          {isSyncing ? "Syncing..." : "Test Xano Sync"}
        </Button>
      </div>
    </div>
  );
};

export default Index;
