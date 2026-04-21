import { useState, useRef } from "react";
import { useTranscribeAudio } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface VoiceRecorderProps {
  language: string;
  onTranscription: (text: string) => void;
}

export function VoiceRecorder({ language, onTranscription }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const transcribeMutation = useTranscribeAudio();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64AudioMessage = (reader.result as string).split(',')[1];
          
          transcribeMutation.mutate(
            { 
              data: {
                audio_base64: base64AudioMessage,
                mime_type: "audio/webm",
                language
              } 
            },
            {
              onSuccess: (data) => {
                if (data.text) {
                  onTranscription(data.text);
                  toast.success("Audio transcribed successfully");
                }
              },
              onError: () => {
                toast.error("Failed to transcribe audio");
              }
            }
          );
        };

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast.error("Microphone access denied or unavailable");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (transcribeMutation.isPending) {
    return (
      <Button type="button" variant="outline" disabled className="w-full text-primary border-primary/20 bg-primary/5">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Processing audio...
      </Button>
    );
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-3 w-full">
        <Button 
          type="button" 
          variant="destructive" 
          onClick={stopRecording}
          className="flex-1 animate-pulse"
        >
          <Square className="mr-2 h-4 w-4 fill-current" />
          Stop Recording
        </Button>
        <div className="px-4 py-2 bg-destructive/10 text-destructive rounded-md font-mono font-medium min-w-[80px] text-center border border-destructive/20">
          {formatTime(recordingDuration)}
        </div>
      </div>
    );
  }

  return (
    <Button 
      type="button" 
      variant="outline" 
      onClick={startRecording}
      className="w-full hover:bg-primary/5 hover:text-primary border-dashed border-2 transition-colors"
    >
      <Mic className="mr-2 h-4 w-4" />
      Record Voice Description
    </Button>
  );
}