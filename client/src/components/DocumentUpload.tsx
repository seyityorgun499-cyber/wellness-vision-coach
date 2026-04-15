import { Upload, FileText, Image, FileSpreadsheet, CheckCircle, AlertCircle, Eye, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useHealthData } from "@/hooks/useHealthData";
import { healthAPI } from "@/lib/api";

export const DocumentUpload = () => {
  const { addDocumentEntry } = useHealthData();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Belgeleri API'den yükle
  const fetchDocuments = useCallback(async () => {
    try {
      const docs = await healthAPI.getDocuments();
      setUploadedFiles(docs);
    } catch (error) {
      console.error("Belgeler yüklenemedi:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const processingCount = useMemo(
    () => uploadedFiles.filter((file) => file.status === "processing").length,
    [uploadedFiles]
  );

  // İşlenmekte olan belgeleri periyodik kontrol
  useEffect(() => {
    if (processingCount === 0) return;

    const interval = setInterval(async () => {
      try {
        const docs = await healthAPI.getDocuments();
        setUploadedFiles(docs);
        const stillProcessing = docs.filter((d: any) => d.status === "processing");
        if (stillProcessing.length === 0) {
          clearInterval(interval);
          toast.success("Belge analizi tamamlandı!");
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [processingCount]);

  const processFiles = async (files: FileList) => {
    const acceptedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    for (const file of Array.from(files)) {
      if (!acceptedTypes.includes(file.type)) {
        toast.error(`Desteklenmeyen dosya formatı: ${file.name}`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Dosya çok büyük: ${file.name}. Maksimum 10MB.`);
        continue;
      }

      setIsUploading(true);

      try {
        const base64 = await fileToBase64(file);
        const isImage = file.type.startsWith('image/');
        const docType = getDocumentType(file.name);

        const requestBody: any = {
          title: file.name,
          documentType: docType,
          mimeType: file.type,
          fileSize: file.size,
        };

        if (isImage) {
          requestBody.imageBase64 = base64;
        } else {
          // PDF ve diğer dosyalar için ocrText olarak gönder
          requestBody.ocrText = `[${file.type} dosyası: ${file.name}]`;
        }

        const doc = await healthAPI.uploadDocument(requestBody);
        setUploadedFiles(prev => [doc, ...prev]);

        // Health context'e de ekle
        addDocumentEntry({
          id: doc.id,
          timestamp: new Date().toISOString(),
          title: file.name,
          type: docType,
          status: "Processing",
          insights: [],
          recommendations: []
        });

        toast.success(`${file.name} yüklendi! AI analizi başlatıldı...`);
      } catch (error: any) {
        console.error("Dosya yükleme hatası:", error);
        toast.error(`${file.name} yüklenemedi: ${error.message}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const getDocumentType = (fileName: string): string => {
    const name = fileName.toLowerCase();
    if (name.includes('blood')) return 'Blood Test';
    if (name.includes('thyroid')) return 'Thyroid Function';
    if (name.includes('cholesterol')) return 'Cholesterol Report';
    if (name.includes('allergy')) return 'Allergy Test';
    if (name.includes('prescription')) return 'Prescription';
    if (name.includes('vaccine')) return 'Vaccination Record';
    return 'Medical Report';
  };

  const handleViewAnalysis = (file: any) => {
    if (file.status === 'analyzed') {
      setSelectedFile(file);
      setShowAnalysisModal(true);
    } else if (file.status === 'processing') {
      toast.info("Belge hâlâ işleniyor. Lütfen analiz tamamlanana kadar bekleyin.");
    } else if (file.status === 'error') {
      toast.error("Belge analiz edilemedi. Lütfen tekrar yüklemeyi deneyin.");
    } else {
      toast.info("Belge henüz analiz edilmedi.");
    }
  };

  const handleFileSelect = () => {
    // Reset input value so selecting the same file works again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6 pb-20">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="text-center space-y-2 pt-2">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Sağlık Belgeleri
        </h1>
        <p className="text-muted-foreground">Sağlık belgelerinizi yükleyin, AI analizi ile öneriler alın</p>
      </div>

      {/* Upload Area */}
      <Card 
        className={`shadow-card transition-all duration-300 border-2 border-dashed ${
          isDragging 
            ? 'border-primary bg-primary/5 shadow-sm' 
            : 'border-muted-border hover:border-primary/50 hover:bg-primary/2'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <CardContent className="p-8 text-center space-y-4">
          <div className={`transition-all duration-300 ${isDragging ? 'scale-110' : ''}`}>
            {isUploading ? (
              <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
            ) : (
              <Upload className={`h-12 w-12 mx-auto ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            )}
          </div>
          <div>
            <p className={`font-medium ${isDragging ? 'text-primary' : 'text-foreground'}`}>
              {isUploading ? 'Yükleniyor...' : isDragging ? 'Dosyayı buraya bırakın' : 'Sağlık Belgesi Yükle'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Kan tahlili, lab raporu, reçete, tıbbi görüntü
            </p>
          </div>

          {/* Explicit upload button — works reliably on Android WebView */}
          <Button
            type="button"
            className="w-full"
            disabled={isUploading}
            onClick={(e) => {
              e.stopPropagation();
              handleFileSelect();
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Dosya Seç
          </Button>

          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-4 w-4" />
              PDF
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Image className="h-4 w-4" />
              Görseller
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileSpreadsheet className="h-4 w-4" />
              Tablolar
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supported Document Types */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Desteklenen Belgeler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[
              "Kan Tahlili",
              "Tiroid Fonksiyon",
              "Kolesterol Raporu",
              "Alerji Testi",
              "Reçete",
              "Tıbbi Görüntü",
              "Aşı Kaydı",
              "Fitness Değerlendirme"
            ].map((docType, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-background-subtle rounded text-sm">
                <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                <span>{docType}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {isLoading ? (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
            <p className="text-sm text-muted-foreground mt-2">Belgeler yükleniyor...</p>
          </CardContent>
        </Card>
      ) : uploadedFiles.length > 0 ? (
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Belgeleriniz</CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchDocuments}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-4 bg-background-subtle rounded-lg hover:shadow-card transition-all duration-200"
              >
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{file.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {file.documentType} • {new Date(file.uploadedAt || file.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                  {file.aiAnalysis && (
                    <div className="text-sm text-success mt-1 line-clamp-1">{file.aiAnalysis}</div>
                  )}
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                  {file.status === 'analyzed' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleViewAnalysis(file)}
                      className="text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Analiz
                    </Button>
                  )}
                  {file.status === 'analyzed' ? (
                    <Badge variant="secondary" className="bg-success-light text-success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Analiz Edildi
                    </Badge>
                  ) : file.status === 'error' ? (
                    <Badge variant="secondary" className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Hata
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-warning-light text-warning">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      İşleniyor
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Henüz belge yüklenmedi</p>
            <p className="text-sm text-muted-foreground mt-1">Yukarıdan bir sağlık belgesi yükleyin</p>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis Modal */}
      <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Detaylı Analiz: {selectedFile?.title}
            </DialogTitle>
            <DialogDescription>
              AI destekli sağlık belgesi analizi
            </DialogDescription>
          </DialogHeader>
          
          {selectedFile && (
            <div className="space-y-6">
              {/* Document Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Belge Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Belge Türü</p>
                    <p className="font-medium">{selectedFile.documentType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Yükleme Tarihi</p>
                    <p className="font-medium">
                      {new Date(selectedFile.uploadedAt || selectedFile.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                  {selectedFile.fileSize && (
                    <div>
                      <p className="text-sm text-muted-foreground">Dosya Boyutu</p>
                      <p className="font-medium">{(selectedFile.fileSize / 1024).toFixed(1)} KB</p>
                    </div>
                  )}
                  {selectedFile.mimeType && (
                    <div>
                      <p className="text-sm text-muted-foreground">Format</p>
                      <p className="font-medium">{selectedFile.mimeType}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Analysis */}
              {selectedFile.aiAnalysis && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      AI Analiz Özeti
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedFile.aiAnalysis}</p>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {selectedFile.aiRecommendations && selectedFile.aiRecommendations.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      Öneriler
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedFile.aiRecommendations.map((rec: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tags */}
              {selectedFile.tags && selectedFile.tags.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Etiketler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedFile.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};