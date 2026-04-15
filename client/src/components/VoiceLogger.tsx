import { Mic, MicOff, Play, Square, Brain, CheckCircle, Volume2, X, Utensils, HeartPulse, Loader, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useHealthData } from "@/hooks/useHealthData";
import { healthAPI } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

type LogMode = "health" | "food";

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const VoiceLogger = () => {
  const { t } = useLanguage();
  const { addVoiceEntry, addFoodAnalysis } = useHealthData();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [microphoneError, setMicrophoneError] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [transcribedText, setTranscribedText] = useState<string>("");
  const [logMode, setLogMode] = useState<LogMode>("health");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [manualText, setManualText] = useState("");
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const speechSupported = !!SpeechRecognition;

  const startRecording = async () => {
    try {
      setMicrophoneError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setHasRecording(true);
        stream.getTracks().forEach(track => track.stop());
        toast.success(t.recordingDone);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      if (speechSupported) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = 'tr-TR';
          recognition.interimResults = true;
          recognition.continuous = true;
          recognition.maxAlternatives = 1;

          let finalTranscript = '';

          recognition.onresult = (event: any) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcriptPart = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += transcriptPart + ' ';
              } else {
                interim += transcriptPart;
              }
            }
            setTranscribedText(finalTranscript + interim);
          };

          recognition.onerror = (event: any) => {
            console.warn('SpeechRecognition error:', event.error);
            if (event.error !== 'aborted' && event.error !== 'no-speech') {
              console.warn('Speech recognition stopped, text input available as fallback');
            }
          };

          recognition.onend = () => {
            if (mediaRecorderRef.current?.state === 'recording') {
              try { recognition.start(); } catch { /* ignore */ }
            }
          };

          recognitionRef.current = recognition;
          recognition.start();
        } catch (err) {
          console.warn('SpeechRecognition init failed, text input will be used');
        }
      }

      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      toast.success(t.recordingStarted);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setMicrophoneError(t.micDenied);
      toast.error(t.micNotAccessible);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
        recognitionRef.current = null;
      }

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        toast.error(t.playbackFailed);
      });
    }
  };

  const handleAnalyze = async () => {
    const textToAnalyze = transcribedText.trim() || manualText.trim();

    if (!textToAnalyze) {
      toast.error(t.textNeeded);
      setShowTextInput(true);
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await healthAPI.addVoiceEntry({
        transcription: textToAnalyze,
        mode: logMode,
      });

      const { entry, analysis, foodEntries, foodAnalysis } = response as any;
      setAnalysisResult(analysis || entry);

      const voiceEntry = {
        id: entry?.id?.toString() || Date.now().toString(),
        timestamp: entry?.createdAt || new Date().toISOString(),
        title: logMode === "food" ? t.voiceFoodEntry : t.voiceHealthLog,
        duration: formatDuration(recordingDuration),
        mood: analysis?.mood || analysis?.sentiment || t.neutral,
        keywords: analysis?.keywords || [],
        summary: analysis?.summary || textToAnalyze,
      };
      addVoiceEntry(voiceEntry);

      if (logMode === "food" && foodAnalysis?.foods?.length > 0) {
        for (const food of foodAnalysis.foods) {
          addFoodAnalysis({
            id: `voice-${Date.now()}-${foodAnalysis.foods.indexOf(food)}`,
            timestamp: new Date().toISOString(),
            food: food.food,
            calories: food.calories,
            servingSize: food.servingSize,
            confidence: food.confidence,
            macros: {
              protein: { amount: food.protein, percentage: 0 },
              carbs: { amount: food.carbs, percentage: 0 },
              fats: { amount: food.fats, percentage: 0 },
            },
          });
        }
        toast.success(`${foodAnalysis.foods.length} ${t.foodsAddedToLog}`);
      } else {
        toast.success(t.analysisDoneAndSaved);
      }
      setIsAnalyzing(false);
      setAnalysisComplete(true);

    } catch (error: any) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);

      const voiceEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        title: logMode === "food" ? t.voiceFoodEntry : t.voiceHealthLog,
        duration: formatDuration(recordingDuration),
        mood: t.neutral,
        keywords: [],
        summary: textToAnalyze,
      };
      addVoiceEntry(voiceEntry);
      setAnalysisResult({ summary: textToAnalyze, sentiment: t.neutral, keywords: [], recommendations: [] });
      setAnalysisComplete(true);
      toast.warning(t.savedWithError);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualText.trim()) {
      toast.error(t.enterText);
      return;
    }
    setTranscribedText(manualText.trim());
    await handleAnalyze();
  };

  const handleNewRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setHasRecording(false);
    setAnalysisComplete(false);
    setIsAnalyzing(false);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingDuration(0);
    setTranscribedText("");
    setAnalysisResult(null);
    setShowTextInput(false);
    setManualText("");

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div className="page-container">
      <div className="bg-card border-b border-border px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
              <Mic className="h-6 w-6 text-primary" />
              {t.voiceRecording}
            </h1>
            <p className="text-muted-foreground">{t.voiceRecordSubtitle}</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">

        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={logMode === "health" ? "default" : "ghost"}
            className="flex-1"
            onClick={() => { if (!isRecording && !hasRecording) setLogMode("health"); }}
            data-testid="button-mode-health"
          >
            <HeartPulse className="h-4 w-4 mr-2" />
            {t.healthLog}
          </Button>
          <Button
            variant={logMode === "food" ? "default" : "ghost"}
            className="flex-1"
            onClick={() => { if (!isRecording && !hasRecording) setLogMode("food"); }}
            data-testid="button-mode-food"
          >
            <Utensils className="h-4 w-4 mr-2" />
            {t.foodRecord}
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className={`h-32 w-32 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRecording
                    ? 'bg-destructive shadow-lg'
                    : hasRecording
                    ? 'bg-green-500 shadow-lg'
                    : 'bg-primary shadow-md'
                }`}>
                  {isRecording ? (
                    <Square className="h-12 w-12 text-white animate-pulse" />
                  ) : hasRecording ? (
                    <Volume2 className="h-12 w-12 text-white" />
                  ) : logMode === "food" ? (
                    <Utensils className="h-12 w-12 text-white" />
                  ) : (
                    <Mic className="h-12 w-12 text-white" />
                  )}
                </div>
              </div>

              {/* Timer — always reserved so layout doesn't jump */}
              <div className={`text-center transition-opacity duration-200 ${isRecording ? 'opacity-100' : 'opacity-0 pointer-events-none select-none'}`} aria-hidden={!isRecording}>
                <div className="text-2xl font-bold text-primary">{formatDuration(recordingDuration)}</div>
                <div className="text-sm text-muted-foreground">{t.recordingInProgress}</div>
              </div>

              {/* Status text — fixed height so nothing jumps */}
              <div className="min-h-[64px] flex items-start justify-center">
                <div className="space-y-1 text-center">
                  {isRecording && (
                    <>
                      <p className="font-medium text-primary">{t.recordingSaving}</p>
                      <p className="text-sm text-muted-foreground">
                        {logMode === "food" ? t.foodRecordPrompt : t.healthRecordPrompt}
                      </p>
                    </>
                  )}
                  {hasRecording && !analysisComplete && (
                    <>
                      <p className="font-medium text-green-600 dark:text-green-400">{t.recordCompleteTime} ({formatDuration(recordingDuration)})</p>
                      <p className="text-sm text-muted-foreground">
                        {logMode === "food" ? t.foodAnalyzeHint : t.healthAnalyzeHint}
                      </p>
                    </>
                  )}
                  {!hasRecording && !isRecording && (
                    <>
                      <p className="font-medium">
                        {logMode === "food" ? t.recordFoodVoice : t.readyToListen}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {logMode === "food" ? t.foodVoiceDesc : t.healthVoiceDesc}
                      </p>
                      {!speechSupported && (
                        <p className="text-xs text-amber-600">{t.speechNotSupported}</p>
                      )}
                      {microphoneError && (
                        <p className="text-destructive text-sm">{microphoneError}</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Action buttons — fixed min-height so card height stays stable */}
              <div className="min-h-[52px] flex gap-3 justify-center flex-wrap items-center">
                {!hasRecording && !isRecording && (
                  <>
                    <Button size="lg" onClick={startRecording} data-testid="button-start-recording">
                      {logMode === "food" ? <Utensils className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                      {logMode === "food" ? t.recordFoodBtn : t.startRecordingBtn}
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => setShowTextInput(!showTextInput)} data-testid="button-text-input">
                      <Keyboard className="h-4 w-4 mr-2" />
                      {t.typeInstead}
                    </Button>
                  </>
                )}

                {isRecording && (
                  <Button variant="destructive" size="lg" onClick={stopRecording} data-testid="button-stop-recording">
                    <Square className="h-4 w-4 mr-2" />
                    {t.stopRecordingBtn}
                  </Button>
                )}

                {hasRecording && !analysisComplete && (
                  <>
                    <Button variant="outline" onClick={playRecording} data-testid="button-play">
                      <Play className="h-4 w-4 mr-2" />
                      {t.play}
                    </Button>
                    <Button variant="outline" onClick={handleNewRecording} data-testid="button-discard">
                      <X className="h-4 w-4 mr-2" />
                      {t.delete}
                    </Button>
                    <Button onClick={handleAnalyze} data-testid="button-analyze">
                      <Brain className="h-4 w-4 mr-2" />
                      {t.analyzeBtn}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {showTextInput && !hasRecording && !isRecording && !analysisComplete && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-primary" />
                {logMode === "food" ? t.typeYourFood : t.typeYourNote}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder={logMode === "food" ? t.foodTypePlaceholder : t.healthTypePlaceholder}
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                rows={4}
              />
              <Button
                className="w-full"
                onClick={handleManualSubmit}
                disabled={!manualText.trim() || isAnalyzing}
              >
                {isAnalyzing ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
                {isAnalyzing ? t.analyzing : t.analyzeAndSave}
              </Button>
            </CardContent>
          </Card>
        )}

        {(isRecording || hasRecording) && transcribedText && !analysisComplete && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t.liveTranscription}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic">"{transcribedText}"</p>
              {!speechSupported && hasRecording && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-amber-600">{t.speechNotAvailable}</p>
                  <Textarea
                    placeholder={t.typeRecording}
                    value={manualText || transcribedText}
                    onChange={(e) => { setManualText(e.target.value); setTranscribedText(e.target.value); }}
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {isAnalyzing && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Brain className="h-12 w-12 mx-auto text-primary animate-pulse" />
                <div>
                  <p className="font-medium">
                    {logMode === "food" ? t.detectingFood : t.analyzingHealthLog}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {logMode === "food" ? t.foodDetectDesc : t.healthAnalyzeDesc}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {analysisComplete && (
          <div className="space-y-4">
            {transcribedText && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.audioRecording}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground italic">"{transcribedText}"</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  {t.aiAnalysisResults}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysisResult?.mood && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{t.moodLabel}</span>
                    <Badge variant="secondary">{analysisResult.mood}</Badge>
                  </div>
                )}

                {analysisResult?.sentiment && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{t.emotionLabel}</span>
                    <Badge variant="outline">{analysisResult.sentiment}</Badge>
                  </div>
                )}

                {Array.isArray(analysisResult?.keywords) && analysisResult.keywords.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">{t.keyTopics}</div>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.keywords.map((topic: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {analysisResult?.summary && (
                  <div>
                    <div className="text-sm font-medium mb-1">{t.summaryLabel}</div>
                    <p className="text-sm text-muted-foreground">{analysisResult.summary}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {Array.isArray(analysisResult?.recommendations) && analysisResult.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    {t.recommendationsTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysisResult.recommendations.map((rec: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{rec.title}</div>
                        <div className="text-sm text-muted-foreground">{rec.description}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Button className="w-full" onClick={handleNewRecording} data-testid="button-new-recording">
              <Mic className="h-4 w-4 mr-2" />
              {t.newRecording}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
