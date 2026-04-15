import { Camera as CameraIcon, RotateCcw, Check, Utensils, X, ImagePlus, Sparkles, Dumbbell, Flame, Droplets, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import React from "react";
import { toast } from "sonner";
import { useHealthData } from "@/hooks/useHealthData";
import { FoodAnalysis } from "@/types/health";
import { useLanguage } from "@/contexts/LanguageContext";
import { healthAPI } from "@/lib/api";
import { logger } from "@/lib/logger";
import { Capacitor } from "@capacitor/core";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

// Capacitor Camera — dynamically imported to avoid crashes on web
let CapCamera: any = null;
let CameraResultType: any = null;
let CameraSource: any = null;

const ensureCapacitorCamera = async () => {
  if (CapCamera && CameraResultType && CameraSource) return true;

  try {
    const cap = await import('@capacitor/camera');
    CapCamera = cap.Camera;
    CameraResultType = cap.CameraResultType;
    CameraSource = cap.CameraSource;
    return true;
  } catch {
    return false;
  }
};

export const FoodCapture = () => {
  const { addFoodAnalysis } = useHealthData();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [nutritionData, setNutritionData] = useState<FoodAnalysis | null>(null);
  const [analysisFailed, setAnalysisFailed] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPortion, setEditPortion] = useState('');

  // Take photo using Capacitor Camera (native) or fallback to file input
  const takePhotoNative = async () => {
    const hasCapCamera = await ensureCapacitorCamera();

    if (hasCapCamera) {
      try {
        // Check camera permission first
        const permStatus = await CapCamera.checkPermissions();
        if (permStatus.camera === 'denied') {
          const req = await CapCamera.requestPermissions({ permissions: ['camera'] });
          if (req.camera === 'denied') {
            toast.error(t.cameraPermDenied);
            // Fallback to file input
            fileInputRef.current?.click();
            return;
          }
        }

        const image = await CapCamera.getPhoto({
          quality: 80,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Camera,
          width: 1280,
          height: 720,
        });
        const base64 = `data:image/${image.format || 'jpeg'};base64,${image.base64String}`;
        setCapturedImage(base64);
        setIsAnalyzing(true);
        analyzeFood(base64);
      } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        if (msg.includes('cancelled') || msg.includes('canceled')) return;
        logger.error('Capacitor camera error:', err);
        toast.error(t.cameraErrorRetry);
        // Fallback to file input
        fileInputRef.current?.click();
      }
    } else if (Capacitor.isNativePlatform()) {
      // Native but Capacitor Camera unavailable — use file input
      fileInputRef.current?.click();
    } else {
      // Web: use browser camera
      startCamera();
    }
  };

  // Pick photo from gallery using Capacitor or file input
  const pickFromGallery = async () => {
    const hasCapCamera = await ensureCapacitorCamera();

    if (hasCapCamera) {
      try {
        // Check photos permission first
        const permStatus = await CapCamera.checkPermissions();
        if (permStatus.photos === 'denied') {
          const req = await CapCamera.requestPermissions({ permissions: ['photos'] });
          if (req.photos === 'denied') {
            toast.error(t.galleryPermDenied);
            fileInputRef.current?.click();
            return;
          }
        }

        const image = await CapCamera.getPhoto({
          quality: 80,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Photos,
          width: 1280,
          height: 720,
        });
        const base64 = `data:image/${image.format || 'jpeg'};base64,${image.base64String}`;
        setCapturedImage(base64);
        setIsAnalyzing(true);
        analyzeFood(base64);
      } catch (error: any) {
        if (error.message?.includes('cancelled') || error.message?.includes('canceled')) return;
        console.error('Gallery error:', error);
        toast.error(`Gallery error: ${error.message}`);
      }
    } else {
      // Fallback: use file input
      fileInputRef.current?.click();
    }
  };

  // Handle file input change (web fallback for gallery)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen bir fotoğraf seçin');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fotoğraf 10 MB\'dan büyük olamaz');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setCapturedImage(base64);
      setIsAnalyzing(true);
      analyzeFood(base64);
    };
    reader.readAsDataURL(file);
  };

  // Initialize browser camera (fallback when Capacitor not available)
  const startCamera = async () => {
    try {
      setCameraError(null);
      logger.log('Requesting camera access...');
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported by this browser');
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      });
      
      logger.log('Camera access granted, stream:', mediaStream);
      logger.log('Video tracks:', mediaStream.getVideoTracks());
      
      setStream(mediaStream);
      setIsCameraOn(true);
      
      if (videoRef.current) {
        logger.log('Setting video source...');
        videoRef.current.srcObject = mediaStream;
        
        // Add multiple event listeners to debug
        videoRef.current.onloadstart = () => logger.log('Video load started');
        videoRef.current.onloadedmetadata = () => {
          logger.log('Video metadata loaded');
          logger.log('Video dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
        };
        videoRef.current.oncanplay = () => {
          logger.log('Video can play');
          videoRef.current?.play().then(() => {
            logger.log('Video playing successfully');
          }).catch((error) => {
            console.error('Video play failed:', error);
          });
        };
        videoRef.current.onerror = (error) => {
          console.error('Video error:', error);
        };
      }
      
      toast.success(t.cameraReady);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError(`${t.cameraError}: ${error instanceof Error ? error.message : String(error)}`);
      toast.error(t.cameraError);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOn(false);
    setCapturedImage(null);
    setAnalysisComplete(false);
    setIsAnalyzing(false);
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
    
    // Stop camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOn(false);

    // Start analysis
    setIsAnalyzing(true);
    analyzeFood(imageDataUrl);
  };

  // Real food analysis using AI vision and nutrition databases
  const analyzeFood = async (imageData: string) => {
    try {
      setIsAnalyzing(true);
      
      const result = await healthAPI.analyzeFood(imageData);
      
      // Normalize macros: backend returns "fat" but FoodAnalysis type uses "fats"
      const pGrams = result.proteinGrams || 0;
      const cGrams = result.carbsGrams || 0;
      const fGrams = result.fatGrams || 0;
      const totalMacroGrams = pGrams + cGrams + fGrams;
      const pct = (g: number) => totalMacroGrams > 0 ? Math.round((g / totalMacroGrams) * 100) : 0;
      const normalizedMacros = {
        protein: { amount: pGrams, percentage: pct(pGrams) },
        carbs: { amount: cGrams, percentage: pct(cGrams) },
        fats: { amount: fGrams, percentage: pct(fGrams) },
      };

      // Update nutrition data with real results
      const analysisResult: FoodAnalysis = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        food: result.foodName || 'Unknown',
        calories: result.calories || 0,
        confidence: result.confidence || 0,
        servingSize: result.servingSize || '1 porsiyon',
        macros: normalizedMacros,
      };
      
      setNutritionData(analysisResult);
      setAnalysisComplete(true);
      toast.success(`${t.identified}: ${analysisResult.food}!`);
      
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisFailed(true);
      toast.error(`${t.analysisFailedError}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setAnalysisComplete(false);
    setIsAnalyzing(false);
    setAnalysisFailed(false);
    setNutritionData(null);
    setEditName('');
    setEditPortion('');
  };

  const handleRetryAnalysis = () => {
    if (capturedImage) {
      setAnalysisFailed(false);
      setIsAnalyzing(true);
      analyzeFood(capturedImage);
    }
  };

  const handleConfirm = async () => {
    if (nutritionData) {
      const finalName = editName.trim() || nutritionData.food;
      const finalPortion = editPortion.trim() || nutritionData.servingSize;
      const finalData = { ...nutritionData, food: finalName, servingSize: finalPortion };

      // Save to local context for immediate UI
      addFoodAnalysis(finalData);

      // Persist to database
      try {
        await healthAPI.addFoodEntry({
          foodName: finalName,
          calories: nutritionData.calories,
          proteinGrams: String(nutritionData.macros.protein?.amount ?? 0),
          carbsGrams: String(nutritionData.macros.carbs?.amount ?? 0),
          fatGrams: String(nutritionData.macros.fats?.amount ?? 0),
          aiConfidence: String(nutritionData.confidence),
          servingSize: finalPortion,
          mealType: "snack",
          source: "camera",
        });
        toast.success(`${finalName} ${t.addedToLog}`);
        queryClient.invalidateQueries({ queryKey: queryKeys.health.foods() });
        queryClient.invalidateQueries({ queryKey: queryKeys.health.weeklyLogs() });
        queryClient.invalidateQueries({ queryKey: queryKeys.health.dailyLog() });
      } catch (error: any) {
        const msg = error?.message || error?.details || JSON.stringify(error);
        console.error('Failed to persist food entry:', msg, error);
        toast.warning(`${t.saveError}: ${msg}`);
      }
      
      // Reset for next capture
      setCapturedImage(null);
      setAnalysisComplete(false);
      setNutritionData(null);
    }
  };

  // Populate edit fields when analysis completes
  useEffect(() => {
    if (nutritionData) {
      setEditName(nutritionData.food || '');
      setEditPortion(nutritionData.servingSize || '');
    }
  }, [nutritionData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const macroConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    protein: { label: t.protein, color: 'text-blue-600',  bg: 'bg-blue-50 border-blue-100',  icon: <Dumbbell className="h-3.5 w-3.5" /> },
    carbs:   { label: t.carbs,   color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', icon: <Flame className="h-3.5 w-3.5" /> },
    fat:     { label: t.fat,     color: 'text-rose-600',  bg: 'bg-rose-50 border-rose-100',   icon: <Droplets className="h-3.5 w-3.5" /> },
    fats:    { label: t.fat,     color: 'text-rose-600',  bg: 'bg-rose-50 border-rose-100',   icon: <Droplets className="h-3.5 w-3.5" /> },
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-black" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>

      {/* ── Full-bleed image / camera / idle area ── */}
      <div className="relative flex-1 overflow-hidden">

        {/* Live video */}
        {isCameraOn && stream && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay playsInline muted
            onError={() => setCameraError(t.cameraError)}
            onLoadedData={() => logger.log('Video data loaded')}
          />
        )}

        {/* Captured image */}
        {capturedImage && (
          <img src={capturedImage} alt="Captured food" className="absolute inset-0 w-full h-full object-cover" />
        )}

        {/* ── Idle state ── */}
        {!isCameraOn && !capturedImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center"
               style={{ background: 'linear-gradient(160deg, #0f2027 0%, #1a3a2e 50%, #203a43 100%)' }}>
            {/* Animated scan rings */}
            <div className="relative flex items-center justify-center mb-10">
              <div className="absolute w-40 h-40 rounded-full border border-primary/20 animate-ping" style={{ animationDuration: '2.5s' }} />
              <div className="absolute w-28 h-28 rounded-full border border-primary/30 animate-ping" style={{ animationDuration: '1.8s' }} />
              <div className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/40 flex items-center justify-center">
                <Utensils className="h-9 w-9 text-primary" />
              </div>
            </div>
            <p className="text-white text-xl font-semibold tracking-wide mb-2">{t.foodAnalysis}</p>
            <p className="text-white/50 text-sm text-center px-10 mb-8">{t.takePictureToLearnNutrition}</p>
            {cameraError && (
              <p className="text-red-300 text-xs text-center px-8 mb-4">{cameraError}</p>
            )}
            {/* Action buttons */}
            <div className="flex gap-4 px-8 w-full max-w-xs">
              <button
                onClick={takePhotoNative}
                className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <CameraIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-white text-xs font-medium">{t.startCamera}</span>
              </button>
              <button
                onClick={pickFromGallery}
                className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <ImagePlus className="h-6 w-6 text-white/80" />
                </div>
                <span className="text-white/70 text-xs font-medium">{t.gallery}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Camera framing overlay ── */}
        {isCameraOn && stream && (
          <div className="absolute inset-0 pointer-events-none">
            {/* corner guides */}
            <div className="absolute top-10 left-10 w-10 h-10 border-t-[3px] border-l-[3px] border-white rounded-tl-lg" />
            <div className="absolute top-10 right-10 w-10 h-10 border-t-[3px] border-r-[3px] border-white rounded-tr-lg" />
            <div className="absolute bottom-32 left-10 w-10 h-10 border-b-[3px] border-l-[3px] border-white rounded-bl-lg" />
            <div className="absolute bottom-32 right-10 w-10 h-10 border-b-[3px] border-r-[3px] border-white rounded-br-lg" />
            {/* hint pill */}
            <div className="absolute bottom-36 inset-x-0 flex justify-center">
              <span className="text-white/90 text-xs font-medium bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-sm">
                {t.cameraFrameHint ?? 'Center your food in the frame'}
              </span>
            </div>
          </div>
        )}

        {/* ── Analyzing overlay ── */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-primary/30 animate-spin border-t-primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-primary animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-white font-semibold text-base">{t.analyzingMeal}</p>
              <p className="text-white/60 text-sm">{t.aiIdentifyingFood}</p>
            </div>
          </div>
        )}

        {/* ── Error overlay ── */}
        {analysisFailed && capturedImage && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-5 px-8">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
              <X className="h-8 w-8 text-red-400" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-white font-semibold">{t.analysisFailed}</p>
              <p className="text-white/60 text-xs max-w-[220px]">
                {t.analysisFailedHint ?? 'Try better lighting or move closer to the food'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button size="sm" variant="outline" onClick={handleRetake} className="border-white/30 text-white bg-white/10 hover:bg-white/20">
                <RotateCcw className="h-4 w-4 mr-1.5" />
                {t.retakePhoto}
              </Button>
              <Button size="sm" onClick={handleRetryAnalysis} className="bg-primary hover:bg-primary-dark">
                {t.retryAnalysis}
              </Button>
            </div>
          </div>
        )}

        {/* ── Top bar (back button + title) ── */}
        <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 pt-4 pb-2"
             style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)' }}>
          <div /> {/* spacer */}
          {isCameraOn && (
            <button
              onClick={stopCamera}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/10"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          )}
        </div>

        {/* ── Camera shutter button ── */}
        {isCameraOn && (
          <div className="absolute bottom-6 inset-x-0 flex justify-center">
            <button
              onClick={capturePhoto}
              className="w-18 h-18 rounded-full border-4 border-white bg-white/20 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform shadow-xl"
              style={{ width: 72, height: 72 }}
            >
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center" style={{ width: 56, height: 56 }}>
                <CameraIcon className="h-6 w-6 text-gray-800" />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* ── Results bottom sheet ── */}
      {analysisComplete && nutritionData && (
        <div className="bg-card rounded-t-3xl shadow-2xl animate-slide-up z-10 pb-4" style={{ maxHeight: '62vh', overflowY: 'auto' }}>
          {/* drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          <div className="px-5 pb-2">
            {/* Editable food name + portion */}
            <div className="mb-4 space-y-2">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Pencil className="h-3 w-3" />
                  {t.foodName ?? 'Yemek Adı'}
                </label>
                <Input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="h-9 text-sm font-semibold"
                  placeholder={nutritionData.food}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                  {t.portion ?? 'Porsiyon'}
                </label>
                <Input
                  value={editPortion}
                  onChange={e => setEditPortion(e.target.value)}
                  className="h-8 text-xs text-muted-foreground"
                  placeholder={nutritionData.servingSize}
                />
              </div>
            </div>

            {/* Calorie hero */}
            <div className="relative overflow-hidden rounded-2xl mb-4 p-5 bg-emerald-50 border border-emerald-100">
              <div className="text-emerald-700/70 text-xs font-medium uppercase tracking-widest mb-1">{t.caloriesPerServing?.replace('{size}', '') ?? 'Calories'}</div>
              <div className="text-5xl font-black text-gray-900 leading-none">{nutritionData.calories}</div>
              <div className="text-emerald-700/60 text-xs mt-1">kcal</div>
              <Sparkles className="absolute right-4 top-4 h-8 w-8 text-emerald-200" />
            </div>

            {/* Macro chips */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {Object.entries(nutritionData.macros).map(([macro, data]) => {
                const cfg = macroConfig[macro] ?? { label: macro, color: 'text-foreground', bg: 'bg-muted', icon: null };
                return (
                  <div key={macro} className={`rounded-xl border p-3 ${cfg.bg}`}>
                    <div className={`flex items-center gap-1 mb-1 ${cfg.color}`}>
                      {cfg.icon}
                      <span className="text-[10px] font-semibold uppercase tracking-wide">{cfg.label}</span>
                    </div>
                    <div className={`text-base font-bold ${cfg.color}`}>{data.amount}g</div>
                    <div className="text-[10px] text-muted-foreground">{data.percentage}%</div>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={handleRetake}>
                <RotateCcw className="h-4 w-4 mr-2" />
                {t.retake}
              </Button>
              <Button className="flex-1 rounded-xl h-12 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold" onClick={handleConfirm}>
                <Check className="h-4 w-4 mr-2" />
                {t.confirmAndSave}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas + file input */}
      <canvas ref={canvasRef} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
    </div>
  );
};