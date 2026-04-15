import { Camera, Mic, FileText, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTabNavigate } from "@/hooks/useTabNavigate";

interface QuickActionsProps {
  onTabChange?: (tab: string) => void;
}

export const QuickActions = ({ onTabChange: onTabChangeProp }: QuickActionsProps) => {
  const _tabNavigate = useTabNavigate();
  const onTabChange = onTabChangeProp ?? _tabNavigate;
  return (
    <Card className="shadow-card">
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="health" 
            size="xl" 
            className="h-20 flex-col gap-2"
            onClick={() => onTabChange('camera')}
          >
            <Camera className="h-6 w-6" />
            <span className="text-xs font-medium">Scan Food</span>
          </Button>
          
          <Button 
            variant="widget" 
            size="xl" 
            className="h-20 flex-col gap-2"
            onClick={() => onTabChange('voice')}
          >
            <Mic className="h-6 w-6" />
            <span className="text-xs font-medium">Voice Log</span>
          </Button>
          
          <Button 
            variant="secondary" 
            size="xl" 
            className="h-20 flex-col gap-2 hover:shadow-card"
            onClick={() => onTabChange('docs')}
          >
            <FileText className="h-6 w-6" />
            <span className="text-xs font-medium">Upload Health Docs</span>
          </Button>
          
          <Button 
            variant="success" 
            size="xl" 
            className="h-20 flex-col gap-2"
            onClick={() => onTabChange('activity')}
          >
            <Activity className="h-6 w-6" />
            <span className="text-xs font-medium">Log Activity</span>
          </Button>
        </div>
        
        {/* Activity Log Button - Full Width */}
        <Button 
          variant="outline" 
          size="xl" 
          className="h-16 flex-col gap-2 w-full bg-muted/50 hover:bg-muted transition-colors"
          onClick={() => onTabChange('activity-log')}
        >
          <FileText className="h-5 w-5" />
          <span className="text-xs font-medium">View All Logged Activities</span>
        </Button>
      </CardContent>
    </Card>
  );
};