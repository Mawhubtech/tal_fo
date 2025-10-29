import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';

interface VoiceChatOptions {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onAudioData?: (audioData: ArrayBuffer) => void;
  onError?: (error: Error) => void;
  onPlaybackStart?: () => void; // Callback when audio starts playing
  sampleRate?: number;
}

export function useVoiceChat(options: VoiceChatOptions = {}) {
  const {
    onTranscript,
    onAudioData,
    onError,
    onPlaybackStart,
    sampleRate = 16000
  } = options;

  const { addToast } = useToast();

  // State
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // AI is speaking

  // Refs for audio recording
  const audioContextRef = useRef<AudioContext | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isRecordingRef = useRef<boolean>(false); // Ref to avoid stale closure

  // Refs for audio playback
  const playbackContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingQueueRef = useRef(false);

  /**
   * Start recording audio from microphone
   */
  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const error = new Error('Microphone access is not supported in this browser');
      onError?.(error);
      addToast({
        type: 'error',
        title: 'Microphone Error',
        message: 'Your browser does not support microphone access'
      });
      return;
    }

    try {
      setIsRecording(true);
      isRecordingRef.current = true; // Update ref

      // Create audio context with specified sample rate
      const audioContext = new AudioContext({
        sampleRate,
        latencyHint: 'interactive'
      });
      audioContextRef.current = audioContext;

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate,
          channelCount: 1,
          echoCancellation: true,
          autoGainControl: true,
          noiseSuppression: true
        },
      });

      streamRef.current = stream;

      // Create audio source from microphone
      const microphone = audioContext.createMediaStreamSource(stream);
      microphoneRef.current = microphone;

      // Create script processor for audio processing
      const processor = audioContext.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      // Process audio data
      processor.onaudioprocess = (event) => {
        if (!isRecordingRef.current) return; // Use ref instead of state

        const inputData = event.inputBuffer.getChannelData(0);
        
        // Convert float32 to int16 (PCM format)
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Send audio data via callback
        onAudioData?.(pcmData.buffer);
      };

      // Connect microphone → processor → destination
      microphone.connect(processor);
      processor.connect(audioContext.destination);

      console.log('✅ Voice recording started');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      const error = err instanceof Error ? err : new Error('Failed to access microphone');
      onError?.(error);
      
      addToast({
        type: 'error',
        title: 'Microphone Access Denied',
        message: 'Please allow microphone access to use voice chat'
      });

      // Cleanup on error
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      setIsRecording(false);
      isRecordingRef.current = false; // Update ref
    }
  }, [sampleRate, onAudioData, onError, addToast]);

  /**
   * Stop recording audio
   */
  const stopRecording = useCallback(() => {
    console.log('🛑 Stopping voice recording');
    
    setIsRecording(false);
    isRecordingRef.current = false; // Update ref

    // Disconnect and cleanup processor
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }

    // Disconnect microphone
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current
        .close()
        .catch((err) => console.error('Error closing audio context:', err));
      audioContextRef.current = null;
    }

    // Stop media stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
  }, []);

  /**
   * Play audio from array buffer (TTS response)
   */
  const playAudio = useCallback((audioData: ArrayBuffer, format: 'linear16' | 'mp3' = 'linear16', sampleRate: number = 24000) => {
    return new Promise<void>((resolve, reject) => {
      try {
        // Create new audio context for playback
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        playbackContextRef.current = audioContext;

        if (format === 'linear16') {
          // Linear16 PCM format (raw audio)
          const audioDataView = new Int16Array(audioData);

          if (audioDataView.length === 0) {
            console.error('Received empty audio data');
            reject(new Error('Empty audio data'));
            return;
          }

          // Create audio buffer
          const audioBuffer = audioContext.createBuffer(1, audioDataView.length, sampleRate);
          const audioBufferChannel = audioBuffer.getChannelData(0);

          // Convert int16 to float32
          for (let i = 0; i < audioDataView.length; i++) {
            audioBufferChannel[i] = audioDataView[i] / 32768;
          }

          // Create source and connect
          const source = audioContext.createBufferSource();
          audioSourceRef.current = source; // Store reference for stopping
          source.buffer = audioBuffer;
          source.connect(audioContext.destination);

          source.onended = () => {
            source.disconnect();
            audioContext.close().catch(console.error);
            audioSourceRef.current = null;
            playbackContextRef.current = null;
            setIsPlaying(false);
            setIsSpeaking(false);
            resolve();
          };

          setIsPlaying(true);
          setIsSpeaking(true);
          source.start();
          
          // Notify that playback has started
          onPlaybackStart?.();
        } else {
          // MP3 or other encoded formats
          audioContext.decodeAudioData(audioData, (audioBuffer) => {
            const source = audioContext.createBufferSource();
            audioSourceRef.current = source; // Store reference for stopping
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);

            source.onended = () => {
              source.disconnect();
              audioContext.close().catch(console.error);
              audioSourceRef.current = null;
              playbackContextRef.current = null;
              setIsPlaying(false);
              setIsSpeaking(false);
              resolve();
            };

            setIsPlaying(true);
            setIsSpeaking(true);
            source.start();
            
            // Notify that playback has started
            onPlaybackStart?.();
          }, (error) => {
            console.error('Error decoding audio:', error);
            audioContext.close().catch(console.error);
            reject(error);
          });
        }
      } catch (error) {
        console.error('Error playing audio:', error);
        reject(error);
      }
    });
  }, []);

  /**
   * Stop audio playback
   */
  const stopAudio = useCallback(() => {
    console.log('🛑 Stopping audio playback...');
    
    // Stop the audio source if playing
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
      } catch (error) {
        // Already stopped or disconnected
        console.log('Audio source already stopped');
      }
      audioSourceRef.current = null;
    }
    
    // Close the audio context
    if (playbackContextRef.current) {
      playbackContextRef.current.close().catch(console.error);
      playbackContextRef.current = null;
    }
    
    setIsPlaying(false);
    setIsSpeaking(false);
    console.log('✅ Audio playback stopped');
  }, []);

  /**
   * Toggle recording on/off
   */
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopRecording();
      stopAudio();
    };
  }, [stopRecording, stopAudio]);

  return {
    isRecording,
    isPlaying,
    isSpeaking,
    startRecording,
    stopRecording,
    toggleRecording,
    playAudio,
    stopAudio,
  };
}
