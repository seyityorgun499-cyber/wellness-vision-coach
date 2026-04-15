import { Plus, Smartphone, Target, Timer, Droplets, Minus, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHealthData } from "@/hooks/useHealthData";
import { nativeWidgetService } from "@/services/NativeWidgetService";
import { toast } from "@/hooks/use-toast";
import { Capacitor } from '@capacitor/core';

export const WidgetCreator = () => {
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { t } = useLanguage();
  const { addWidget, healthData } = useHealthData();

  const isNative = Capacitor.isNativePlatform();
  const supportsWidgets = nativeWidgetService.isWidgetSupported();

  const widgetTypes = [
    {
      id: "protein",
      name: t.protein + " Tracker",
      description: "Track protein intake with quick buttons",
      icon: Target,
      color: "bg-red-500",
      features: [
        { icon: Plus, label: "Quick Add" },
        { icon: Minus, label: "Quick Remove" },
        { icon: Camera, label: "Photo Capture" }
      ]
    },
    {
      id: "water",
      name: t.water + " Intake",
      description: "Track daily hydration goals",
      icon: Droplets,
      color: "bg-blue-500",
      features: [
        { icon: Plus, label: "Add Glass" },
        { icon: Minus, label: "Remove Glass" },
        { icon: Camera, label: "Photo Capture" }
      ]
    }
  ];

  const handleCreateWidget = async (widgetId: string) => {
    if (!selectedWidget) return;
    
    setIsCreating(true);
    
    try {
      // Add to app's internal widgets first
      addWidget(widgetId);
      
      // If on native platform, create native widget
      if (isNative && supportsWidgets) {
        const widgetConfig = {
          id: `${widgetId}_${Date.now()}`,
          type: widgetId as 'protein' | 'water',
          title: widgetTypes.find(w => w.id === widgetId)?.name || widgetId,
          current: widgetId === 'protein' 
            ? healthData.dailyGoals.protein.current 
            : healthData.dailyGoals.water.current,
          target: widgetId === 'protein' 
            ? healthData.dailyGoals.protein.target 
            : healthData.dailyGoals.water.target,
          color: widgetTypes.find(w => w.id === widgetId)?.color || 'bg-gray-500'
        };
        
        const success = await nativeWidgetService.addWidget(widgetConfig);
        
        if (success) {
          toast({
            title: "Widget Created!",
            description: "Widget has been added to your home screen. Check your device's home screen.",
          });
        } else {
          toast({
            title: "Widget Creation Failed",
            description: "Could not create native widget. Please try again.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Widget Added!",
          description: isNative 
            ? "Native widgets not supported on this device version."
            : "For home screen widgets, please use the mobile app.",
        });
      }
      
      setSelectedWidget(null);
    } catch (error) {
      console.error('Error creating widget:', error);
      toast({
        title: "Error",
        description: "Failed to create widget. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 pt-6">
        <h1 className="text-2xl font-bold text-foreground">
          Native Widget Creator
        </h1>
        <p className="text-muted-foreground">
          {isNative 
            ? "Add tracking widgets to your device's home screen"
            : "Create widgets for your mobile device"
          }
        </p>
        {!isNative && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
            <p className="text-amber-800 text-sm">
              📱 For home screen widgets, please use the mobile app on your phone or tablet.
            </p>
          </div>
        )}
      </div>

      {/* Widget Types */}
      <div className="space-y-4">
        {widgetTypes.map((widget) => (
          <Card 
            key={widget.id} 
            className={`shadow-card hover:shadow-widget transition-shadow duration-200 cursor-pointer ${
              selectedWidget === widget.id ? 'ring-2 ring-primary shadow-widget' : ''
            }`}
            onClick={() => setSelectedWidget(widget.id)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${widget.color} text-white`}>
                  <widget.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-bold">{widget.name}</div>
                  <div className="text-sm text-muted-foreground font-normal mb-2">
                    {widget.description}
                  </div>
                  
                  {/* Widget Features */}
                  <div className="flex gap-2 flex-wrap">
                    {widget.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-1 bg-muted/50 rounded-full px-2 py-1">
                        <feature.icon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{feature.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedWidget === widget.id && (
                  <div className="text-primary text-sm font-medium">Selected</div>
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Widget Preview */}
      {selectedWidget && (
        <Card className="shadow-widget bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-center">Widget Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedWidget === "protein" && (
              <div className="bg-white rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-gray-800">{healthData.dailyGoals.protein.current}g</div>
                    <div className="text-xs text-gray-600">of {healthData.dailyGoals.protein.target}g goal</div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all" 
                    style={{ width: `${Math.min((healthData.dailyGoals.protein.current / healthData.dailyGoals.protein.target) * 100, 100)}%` }} 
                  />
                </div>
                
                {/* Camera Button Preview */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 flex items-center justify-center gap-2"
                  disabled
                >
                  <Camera className="h-4 w-4" />
                  <span className="text-sm">Take Photo</span>
                </Button>
              </div>
            )}
            
            {selectedWidget === "water" && (
              <div className="bg-white rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-gray-800">{healthData.dailyGoals.water.current}</div>
                    <div className="text-xs text-gray-600">of {healthData.dailyGoals.water.target} glasses</div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all" 
                    style={{ width: `${Math.min((healthData.dailyGoals.water.current / healthData.dailyGoals.water.target) * 100, 100)}%` }} 
                  />
                </div>
                
                {/* Camera Button Preview */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 flex items-center justify-center gap-2"
                  disabled
                >
                  <Camera className="h-4 w-4" />
                  <span className="text-sm">Take Photo</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Widget Button */}
      {selectedWidget && (
        <div className="space-y-4">
          <Button 
            className="w-full h-12 cal-ai-button"
            onClick={() => handleCreateWidget(selectedWidget)}
            disabled={isCreating}
          >
            <Plus className="h-5 w-5 mr-2" />
            {isCreating ? "Creating..." : isNative ? "Add to Home Screen" : "Add Widget to Dashboard"}
          </Button>
        </div>
      )}
    </div>
  );
};