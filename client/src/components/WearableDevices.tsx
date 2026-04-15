import { useState } from "react";
import { Plus, Smartphone, Watch, Activity, Wifi, WifiOff, Info, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { wearableAPI } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface WearableDevice {
  id: string;
  name: string;
  brand: string;
  type: string;
  supported_metrics: string[];
  is_active: boolean;
}

interface UserDevice {
  id: string;
  deviceId: string;
  deviceName: string;
  isConnected: boolean;
  lastSync: string | null;
  device?: {
    id: string;
    name: string;
    brand: string;
    type: string;
  };
}

const FALLBACK_DEVICES: WearableDevice[] = [
  { id: '1', name: 'Apple Watch Series 9', brand: 'Apple', type: 'smartwatch', supported_metrics: ['heart_rate', 'steps', 'calories', 'sleep'], is_active: true },
  { id: '2', name: 'Galaxy Watch 6', brand: 'Samsung', type: 'smartwatch', supported_metrics: ['heart_rate', 'steps', 'calories', 'sleep'], is_active: true },
  { id: '3', name: 'Fitbit Charge 6', brand: 'Fitbit', type: 'fitness_tracker', supported_metrics: ['heart_rate', 'steps', 'calories'], is_active: true },
];

export function WearableDevices() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [deviceNameInput, setDeviceNameInput] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: availableDevices = FALLBACK_DEVICES } = useQuery<WearableDevice[]>({
    queryKey: ['wearables', 'available'],
    queryFn: async () => {
      const data = await wearableAPI.getDevices();
      return data.map((device) => ({
        id: device.id,
        name: device.name,
        brand: device.brand,
        type: device.type,
        supported_metrics: device.supportedMetrics,
        is_active: device.isActive,
      }));
    },
    placeholderData: FALLBACK_DEVICES,
    staleTime: 5 * 60_000,
  });

  const { data: userDevices = [], isLoading } = useQuery<UserDevice[]>({
    queryKey: ['wearables', 'user'],
    queryFn: async () => (await wearableAPI.getUserDevices()) as UserDevice[],
    staleTime: 30_000,
  });

  const addMutation = useMutation({
    mutationFn: ({ deviceId, deviceName }: { deviceId: string; deviceName: string }) =>
      wearableAPI.connectDevice({ deviceId, deviceName }),
    onSuccess: () => {
      toast.success(t.deviceAdded);
      setIsAddDialogOpen(false);
      setSelectedDevice("");
      setDeviceNameInput("");
      queryClient.invalidateQueries({ queryKey: ['wearables', 'user'] });
    },
    onError: () => toast.error(t.deviceAddFailed),
  });

  const toggleMutation = useMutation({
    mutationFn: (device: UserDevice) =>
      wearableAPI.setDeviceConnection(device.id, !device.isConnected),
    onSuccess: (updated) => {
      toast.success((updated as any).isConnected ? t.deviceConnected : t.deviceDisconnected);
      queryClient.invalidateQueries({ queryKey: ['wearables', 'user'] });
    },
    onError: () => toast.error(t.connectionUpdateFailed),
  });

  const removeMutation = useMutation({
    mutationFn: (deviceId: string) => wearableAPI.disconnectDevice(deviceId),
    onSuccess: () => {
      toast.success(t.deviceRemoved);
      queryClient.invalidateQueries({ queryKey: ['wearables', 'user'] });
    },
    onError: () => toast.error(t.deviceRemoveFailed),
  });

  const handleAdd = () => {
    if (!selectedDevice || !deviceNameInput.trim()) {
      toast.error(t.deviceSelectAndName);
      return;
    }
    addMutation.mutate({ deviceId: selectedDevice, deviceName: deviceNameInput.trim() });
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartwatch': return <Watch className="h-6 w-6" />;
      case 'fitness_tracker': return <Activity className="h-6 w-6" />;
      default: return <Smartphone className="h-6 w-6" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-20 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t.wearableDevicesTitle}</h2>
          <p className="text-muted-foreground">{t.wearableDevicesSubtitle}</p>
        </div>
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <CardContent className="p-3 flex items-start gap-2">
            <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300">
              {t.bluetoothNote}
            </p>
          </CardContent>
        </Card>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t.addDevice}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.addNewDevice}</DialogTitle>
              <DialogDescription>{t.connectSmartwatch}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t.selectDevice}</Label>
                <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectDevicePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDevices.map((device) => (
                      <SelectItem key={device.id} value={device.id}>
                        {device.brand} - {device.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.deviceName}</Label>
                <Input
                  value={deviceNameInput}
                  onChange={(e) => setDeviceNameInput(e.target.value)}
                  placeholder={t.deviceNamePlaceholder}
                />
              </div>
              <Button onClick={handleAdd} className="w-full" isLoading={addMutation.isPending}>
                {t.connectDevice}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {userDevices.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Watch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{t.noDevicesYet}</h3>
            <p className="text-muted-foreground mb-4">{t.addDeviceToTrack}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {userDevices.map((device) => (
            <Card key={device.id}>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  {getDeviceIcon(device.device?.type || 'smartwatch')}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{device.deviceName}</CardTitle>
                  <CardDescription>
                    {device.device?.brand} {device.device?.name}
                  </CardDescription>
                </div>
                <Badge variant={device.isConnected ? "default" : "secondary"}>
                  {device.isConnected ? (
                    <><Wifi className="h-3 w-3 mr-1" /> {t.connected}</>
                  ) : (
                    <><WifiOff className="h-3 w-3 mr-1" /> {t.notConnected}</>
                  )}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleMutation.mutate(device)}
                    isLoading={toggleMutation.isPending && toggleMutation.variables?.id === device.id}
                  >
                    {device.isConnected ? t.disconnect : t.connect}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeMutation.mutate(device.id)}
                    isLoading={removeMutation.isPending && removeMutation.variables === device.id}
                  >
                    {t.remove}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── App Integrations — Coming Soon ── */}
      <div className="space-y-4 pb-4">

        {/* Hero teaser banner */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 text-white"
          style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
        >
          {/* Animated glow circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20"
               style={{ background: 'radial-gradient(circle, #FC4C02, transparent)' }} />
          <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full opacity-15"
               style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3 text-xs font-semibold"
               style={{ background: 'rgba(252,76,2,0.25)', border: '1px solid rgba(252,76,2,0.4)', color: '#FF8C69' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Yakında Geliyor
          </div>

          <h3 className="text-xl font-black mb-1 leading-tight">Uygulama Entegrasyonları</h3>
          <p className="text-white/60 text-sm leading-relaxed mb-4">
            Favori fitness uygulamalarını Myora ile bağla. Aktiviteler otomatik senkronlansın, hiçbir adımı kaçırma.
          </p>

          {/* App logo row preview */}
          <div className="flex items-center gap-2">
            {[
              { bg: '#FC4C02', label: 'S' },
              { bg: '#ff2d55', label: '♡' },
              { bg: '#4285F4', label: 'G' },
              { bg: '#1DB954', label: '✦' },
            ].map((app, i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg"
                style={{ background: app.bg, opacity: 0.85 }}
              >
                {app.label}
              </div>
            ))}
            <span className="text-white/40 text-xs ml-1">ve daha fazlası…</span>
          </div>
        </div>

        {/* Integration cards grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              name: 'Strava',
              desc: 'Koşu & Yürüyüş',
              icon: <Zap className="h-5 w-5 text-white" />,
              bg: 'linear-gradient(135deg,#FC4C02,#E03E00)',
            },
            {
              name: 'Apple Health',
              desc: 'Adım & Kalori',
              icon: <Activity className="h-5 w-5 text-white" />,
              bg: 'linear-gradient(135deg,#ff2d55,#d10030)',
            },
            {
              name: 'Google Fit',
              desc: 'Fitness Verileri',
              icon: <Watch className="h-5 w-5 text-white" />,
              bg: 'linear-gradient(135deg,#4285F4,#1967D2)',
            },
            {
              name: 'Samsung Health',
              desc: 'Sağlık & Uyku',
              icon: <Smartphone className="h-5 w-5 text-white" />,
              bg: 'linear-gradient(135deg,#1428A0,#0C1E8C)',
            },
          ].map((app) => (
            <div
              key={app.name}
              className="relative rounded-2xl p-4 border border-border bg-card overflow-hidden"
            >
              {/* Lock badge */}
              <span className="absolute top-2.5 right-2.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wide">
                Yakında
              </span>

              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm"
                style={{ background: app.bg }}
              >
                {app.icon}
              </div>
              <div className="font-semibold text-sm text-foreground">{app.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{app.desc}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
