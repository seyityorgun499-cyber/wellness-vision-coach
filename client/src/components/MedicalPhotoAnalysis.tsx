import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, RotateCcw, Check, AlertTriangle, Info, Clock, Microscope, ImagePlus } from 'lucide-react';
import { useHealthData } from '@/contexts/HealthDataContext';
import { MedicalPhotoAnalysis as MedicalPhotoType } from '@/types/health';
import { toast } from 'sonner';
import { healthAPI } from "@/lib/api";
import { logger } from "@/lib/logger";
import { Capacitor } from "@capacitor/core";

let CapCamera: any = null;
let CameraResultType: any = null;
let CameraSource: any = null;

const ensureCapacitorCamera = async () => {
  if (CapCamera) return true;
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

const MedicalPhotoAnalysis = () => {
  const { addMedicalPhoto } = useHealthData();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MedicalPhotoType | null>(null);
  const [detectedType, setDetectedType] = useState<'urine' | 'stool' | 'tongue' | 'eyes' | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug logging
  logger.log('MedicalPhotoAnalysis render state:', {
    isCameraActive,
    capturedImage: !!capturedImage,
    isAnalyzing,
    analysisResult: !!analysisResult,
    detectedType
  });

  const takePhotoNative = async () => {
    const hasCapCamera = await ensureCapacitorCamera();
    if (hasCapCamera) {
      try {
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
      } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        if (msg.includes('cancelled') || msg.includes('canceled')) return;
        logger.error('Capacitor camera error:', err);
        fileInputRef.current?.click();
      }
    } else if (Capacitor.isNativePlatform()) {
      fileInputRef.current?.click();
    } else {
      startCamera();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
      toast.error('Lütfen bir fotoğraf dosyası seçin (JPEG, PNG, WEBP)');
      return;
    }
    const MAX_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      toast.error('Fotoğraf 10 MB\'dan büyük olamaz');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error('Kameraya erişilemiyor');
        return;
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Kameraya erişilemiyor');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    stopCamera();
  };

  const analyzeMedicalPhoto = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    
    try {
      const data: any = await healthAPI.analyzeMedicalPhoto({
        imageData: capturedImage,
        photoType: (detectedType || 'skin') as any,
      });

      if (data && data.analysis && data.detectedType) {
        setDetectedType(data.detectedType);
        
        const newAnalysis: MedicalPhotoType = {
          id: data.photo?.id || Date.now().toString(),
          timestamp: data.photo?.createdAt || new Date().toISOString(),
          type: data.detectedType,
          image: data.photo?.imageUrl || capturedImage,
          analysis: data.analysis,
          confidence: data.confidence || 85
        };

        setAnalysisResult(newAnalysis);
        toast.success(`${data.detectedType === 'urine' ? 'İdrar' : data.detectedType === 'stool' ? 'Dışkı' : data.detectedType === 'tongue' ? 'Dil' : 'Göz'} analizi tamamlandı`);
      }
    } catch (error) {
      console.error('Error analyzing medical photo:', error);
      toast.error('Analiz başarısız oldu');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setDetectedType(null);
    takePhotoNative();
  };

  const handleConfirm = () => {
    if (analysisResult) {
      addMedicalPhoto(analysisResult);
      toast.success('Tıbbi analiz kaydedildi');
      setCapturedImage(null);
      setAnalysisResult(null);
      setDetectedType(null);
    }
  };

  const getUrgencyColor = (urgency: 'low' | 'medium' | 'high') => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
    }
  };

  const getUrgencyIcon = (urgency: 'low' | 'medium' | 'high') => {
    switch (urgency) {
      case 'low': return <Check className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="min-h-screen bg-background p-4 space-y-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Akıllı Tıbbi Fotoğraf Analizi</h1>
          <p className="text-muted-foreground">
            Fotoğrafı çekin, AI otomatik olarak ne olduğunu tespit edip analiz etsin
          </p>
        </div>

        {/* Available Analysis Info */}
        {!isCameraActive && !capturedImage && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Microscope className="h-5 w-5" />
                Desteklenen Analiz Türleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>İdrar Analizi</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Dışkı Analizi</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  <span>Dil Rengi Analizi</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Göz Analizi</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Fotoğrafı çektiğinizde AI otomatik olarak hangi tür olduğunu belirleyecek ve analiz edecek
              </p>
            </CardContent>
          </Card>
        )}

        {/* Camera/Preview Area */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-square bg-muted relative overflow-hidden">
              {isCameraActive && (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-primary/50 m-4 rounded-lg pointer-events-none" />
                </>
              )}
              
              {capturedImage && !analysisResult && (
                <img 
                  src={capturedImage} 
                  alt="Captured medical sample"
                  className="w-full h-full object-cover"
                />
              )}

              {analysisResult && (
                <img 
                  src={analysisResult.image} 
                  alt="Analyzed medical sample"
                  className="w-full h-full object-cover"
                />
              )}

              {!isCameraActive && !capturedImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Tıbbi örnek fotoğrafı çekmek için başlayın
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      AI otomatik olarak türünü belirleyecek ve analiz edecek
                    </p>
                  </div>
                </div>
              )}

              {/* Analysis Loading Overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Clock className="h-12 w-12 animate-spin mx-auto mb-4" />
                    <p className="text-lg font-medium">AI Analiz Ediliyor...</p>
                    <p className="text-sm opacity-75">
                      {!detectedType ? 'Önce tür belirleniyor...' : 
                       detectedType === 'urine' ? 'İdrar analizi yapılıyor' :
                       detectedType === 'stool' ? 'Dışkı analizi yapılıyor' :
                       detectedType === 'tongue' ? 'Dil analizi yapılıyor' :
                       detectedType === 'eyes' ? 'Göz analizi yapılıyor' : 'Analiz yapılıyor'}
                    </p>
                  </div>
                </div>
              )}

              {/* Analysis Results Overlay */}
              {analysisResult && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                  <div className="p-4 text-white w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${getUrgencyColor(analysisResult.analysis.urgency)} flex items-center gap-1`}>
                        {getUrgencyIcon(analysisResult.analysis.urgency)}
                        {analysisResult.analysis.urgency.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary">{analysisResult.confidence}% güven</Badge>
                    </div>
                    <p className="text-sm opacity-90">
                      <span className="capitalize">
                        {analysisResult.type === 'urine' ? 'İdrar' : 
                         analysisResult.type === 'stool' ? 'Dışkı' : 
                         analysisResult.type === 'tongue' ? 'Dil' : 'Göz'} 
                      </span> - Renk: {analysisResult.analysis.color}
                      {analysisResult.analysis.consistency && `, Kıvam: ${analysisResult.analysis.consistency}`}
                      {analysisResult.analysis.clarity && `, Berraklık: ${analysisResult.analysis.clarity}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Details */}
        {analysisResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Microscope className="h-5 w-5" />
                Detaylı Analiz Sonuçları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Observations */}
              <div>
                <h4 className="font-medium mb-2">Gözlemler:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {analysisResult.analysis.observations.map((obs, index) => (
                    <li key={index}>{obs}</li>
                  ))}
                </ul>
              </div>

              {/* Concerns */}
              {analysisResult.analysis.concerns.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-orange-600">Dikkat Edilmesi Gerekenler:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {analysisResult.analysis.concerns.map((concern, index) => (
                      <li key={index}>{concern}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              <div>
                <h4 className="font-medium mb-2 text-green-600">Öneriler:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {analysisResult.analysis.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted rounded-lg">
                <p className="font-medium mb-1">⚠️ Önemli Uyarı:</p>
                <p>Bu analiz yalnızca bilgilendirme amaçlıdır ve kesinlikle doktor muayenesinin yerini almaz. Ciddi endişeleriniz varsa mutlaka bir sağlık profesyoneline başvurun. Özellikle göz ve dil analizleri için uzman hekim görüşü alınması önerilir.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mt-4 mb-6">
          {!isCameraActive && !capturedImage && !analysisResult && (
            <>
              <Button onClick={takePhotoNative} className="flex-1 h-12">
                <Camera className="h-4 w-4 mr-2" />
                Kamerayı Başlat
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="h-12">
                <ImagePlus className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />
            </>
          )}

          {isCameraActive && !capturedImage && (
            <Button onClick={capturePhoto} className="flex-1 h-12">
              <Camera className="h-4 w-4 mr-2" />
              Fotoğraf Çek
            </Button>
          )}

          {capturedImage && !analysisResult && (
            <>
              <Button variant="outline" onClick={handleRetake} className="h-12">
                <RotateCcw className="h-4 w-4 mr-2" />
                Tekrar Çek
              </Button>
              <Button 
                onClick={analyzeMedicalPhoto} 
                disabled={isAnalyzing}
                className="flex-1 h-12"
              >
                <Microscope className="h-4 w-4 mr-2" />
                Analiz Et
              </Button>
            </>
          )}

          {analysisResult && (
            <>
              <Button variant="outline" onClick={handleRetake} className="h-12">
                <RotateCcw className="h-4 w-4 mr-2" />
                Yeni Analiz
              </Button>
              <Button onClick={handleConfirm} className="flex-1 h-12">
                <Check className="h-4 w-4 mr-2" />
                Kaydet
              </Button>
            </>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default MedicalPhotoAnalysis;