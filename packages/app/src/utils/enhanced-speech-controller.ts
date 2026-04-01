import { createSignal, createEffect, createMemo } from "solid-js"
import { createStore } from "solid-js/store"

export interface EnhancedSpeechSettings {
  // Basic settings
  enabled: boolean
  autoSpeakAssistant: boolean
  continuousRecognition: boolean
  
  // Provider settings
  provider: "browser" | "azure" | "openai" | "elevenlabs" | "coqui"
  location: "local" | "cloud"
  
  // Voice settings
  voiceId: string
  language: string
  rate: number
  pitch: number
  volume: number
  
  // Quality settings
  audioQuality: "low" | "medium" | "high"
  sampleRate: number
  audioFormat: "mp3" | "wav" | "ogg" | "webm"
  bitrate: number
  
  // Recognition settings
  confidenceThreshold: number
  silenceTimeout: number
  maxRecordingDuration: number
  
  // Advanced settings
  enableEmotion: boolean
  enableSSML: boolean
  enableVoiceCloning: boolean
  enableSoundEffects: boolean
  
  // Debug settings
  debugMode: boolean
  showConfidenceScores: boolean
  logAudioEvents: boolean
  performanceMetrics: boolean
}

export interface VoiceCommand {
  id: string
  phrase: string
  action: string
  enabled: boolean
  confidence: number
  category: "navigation" | "editing" | "system" | "custom"
  customAction?: string
}

export interface SpeechMetrics {
  totalRecognitions: number
  successfulRecognitions: number
  failedRecognitions: number
  averageConfidence: number
  averageLatency: number
  totalSynthesisTime: number
  errorCount: number
  lastError?: string
}

export interface AudioDevice {
  id: string
  label: string
  kind: "audioinput" | "audiooutput"
  capabilities: {
    echoCancellation: boolean
    noiseSuppression: boolean
    autoGainControl: boolean
    sampleRate: number
    channelCount: number
  }
}

class EnhancedSpeechController {
  private audioContext: AudioContext | null = null
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private recognition: any = null
  private synthesis: SpeechSynthesis | null = null
  
  // State management
  private store: any
  private setStore: any

  constructor() {
    const [store, setStore] = createStore({
      isRecording: false,
      isSpeaking: false,
      isProcessing: false,
      recognizedText: "",
      interimText: "",
      audioDevices: [] as AudioDevice[],
      availableVoices: [] as SpeechSynthesisVoice[],
      metrics: {
        totalRecognitions: 0,
        successfulRecognitions: 0,
        failedRecognitions: 0,
        averageConfidence: 0,
        averageLatency: 0,
        totalSynthesisTime: 0,
        errorCount: 0
      } as SpeechMetrics,
      currentProvider: "browser" as EnhancedSpeechSettings["provider"],
      currentVoiceId: "default",
      settings: {
        enabled: true,
        autoSpeakAssistant: false,
        continuousRecognition: false,
        provider: "browser",
        location: "local",
        voiceId: "default",
        language: "en-US",
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        audioQuality: "medium",
        sampleRate: 24000,
        audioFormat: "mp3",
        bitrate: 128000,
        confidenceThreshold: 0.8,
        silenceTimeout: 2000,
        maxRecordingDuration: 30000,
        enableEmotion: false,
        enableSSML: false,
        enableVoiceCloning: false,
        enableSoundEffects: false,
        debugMode: false,
        showConfidenceScores: false,
        logAudioEvents: false,
        performanceMetrics: false
      } as EnhancedSpeechSettings,
      voiceCommands: [] as VoiceCommand[]
    })
    this.store = store
    this.setStore = setStore
  }

  // Getters
  get isRecording() {
    return () => this.store.isRecording
  }

  get isSpeaking() {
    return () => this.store.isSpeaking
  }

  get isProcessing() {
    return () => this.store.isProcessing
  }

  get recognizedText() {
    return () => this.store.recognizedText
  }

  get interimText() {
    return () => this.store.interimText
  }

  get audioDevices() {
    return () => this.store.audioDevices
  }

  get availableVoices() {
    return () => this.store.availableVoices
  }

  get metrics() {
    return () => this.store.metrics
  }

  get settings() {
    return () => this.store.settings
  }

  get voiceCommands() {
    return () => this.store.voiceCommands
  }

  get currentProvider() {
    return () => this.store.currentProvider
  }

  get currentVoiceId() {
    return () => this.store.currentVoiceId
  }

  // Initialize audio context and devices
  async initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Get available audio devices
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioDevices: AudioDevice[] = devices
        .filter(device => device.kind === 'audioinput' || device.kind === 'audiooutput')
        .map(device => ({
          id: device.deviceId,
          label: device.label || `${device.kind} ${device.deviceId.slice(0, 8)}`,
          kind: device.kind as "audioinput" | "audiooutput",
          capabilities: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100,
            channelCount: 2
          }
        }))

      this.setStore("audioDevices", audioDevices)

      // Get available voices
      if (window.speechSynthesis) {
        this.synthesis = window.speechSynthesis
        const voices = this.synthesis.getVoices()
        this.setStore("availableVoices", voices)
        
        // Listen for voice changes
        this.synthesis.addEventListener("voiceschanged", () => {
          this.setStore("availableVoices", this.synthesis!.getVoices())
        })
      }

      return true
    } catch (error) {
      console.error("Failed to initialize audio:", error)
      return false
    }
  }

  // Speech recognition methods
  async startRecognition(deviceId?: string) {
    if (!this.recognition) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        throw new Error("Speech recognition not supported")
      }
      
      this.recognition = new SpeechRecognition()
      this.setupRecognition()
    }

    try {
      // Request microphone access
      const constraints = {
        audio: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: this.store.settings.sampleRate
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      this.setStore("isRecording", true)
      this.setStore("recognizedText", "")
      this.setStore("interimText", "")
      
      this.recognition.start()
      
      // Start media recording for debugging
      if (this.store.settings.logAudioEvents) {
        this.startMediaRecording(stream)
      }

      return true
    } catch (error) {
      console.error("Failed to start recognition:", error)
      this.setStore("isRecording", false)
      throw error
    }
  }

  stopRecognition() {
    if (this.recognition) {
      this.recognition.stop()
    }
    
    if (this.mediaRecorder) {
      this.mediaRecorder.stop()
    }
    
    this.setStore("isRecording", false)
    this.setStore("interimText", "")
  }

  private setupRecognition() {
    if (!this.recognition) return

    this.recognition.continuous = this.store.settings.continuousRecognition
    this.recognition.interimResults = true
    this.recognition.lang = this.store.settings.language
    this.recognition.maxAlternatives = 3

    this.recognition.onstart = () => {
      this.setStore("isRecording", true)
      this.logEvent("recognition_started")
    }

    this.recognition.onresult = (event: any) => {
      let finalTranscript = ""
      let interimTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript
        const confidence = result[0].confidence

        if (result.isFinal) {
          if (confidence >= this.store.settings.confidenceThreshold) {
            finalTranscript += transcript
            this.setStore("recognizedText", prev => prev + transcript)
            
            // Update metrics
            this.setStore("metrics", "successfulRecognitions", prev => prev + 1)
            this.setStore("metrics", "totalRecognitions", prev => prev + 1)
            this.setStore("metrics", "averageConfidence", prev => (prev * (prev - 1) + confidence) / prev)
            
            // Check for voice commands
            this.checkVoiceCommands(transcript)
          } else {
            this.setStore("metrics", "failedRecognitions", prev => prev + 1)
          }
        } else {
          interimTranscript = transcript
        }
      }

      this.setStore("interimText", interimTranscript)
      this.logEvent("recognition_result", { final: finalTranscript, interim: interimTranscript })
    }

    this.recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      this.setStore("metrics", "errorCount", prev => prev + 1)
      this.setStore("metrics", "lastError", event.error)
      this.setStore("isRecording", false)
      this.logEvent("recognition_error", { error: event.error })
    }

    this.recognition.onend = () => {
      this.setStore("isRecording", false)
      this.setStore("interimText", "")
      this.logEvent("recognition_ended")
      
      // Restart if continuous mode is enabled
      if (this.store.settings.continuousRecognition && this.store.isRecording) {
        setTimeout(() => {
          if (this.store.isRecording) {
            this.recognition?.start()
          }
        }, 100)
      }
    }
  }

  // Speech synthesis methods
  async speak(text: string, options?: Partial<EnhancedSpeechSettings>) {
    if (!this.synthesis) {
      throw new Error("Speech synthesis not supported")
    }

    try {
      this.setStore("isSpeaking", true)
      this.setStore("isProcessing", true)

      const startTime = Date.now()
      const settings = { ...this.store.settings, ...options }

      // Process text with SSML if enabled
      let processedText = text
      if (settings.enableSSML) {
        processedText = this.processSSML(text, settings)
      }

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(processedText)
      
      // Apply voice settings
      const voice = this.availableVoices().find(v => v.name === settings.voiceId || v.voiceURI === settings.voiceId)
      if (voice) {
        utterance.voice = voice
      }
      
      utterance.lang = settings.language
      utterance.rate = settings.rate
      utterance.pitch = settings.pitch
      utterance.volume = settings.volume

      // Event handlers
      utterance.onstart = () => {
        this.setStore("isSpeaking", true)
        this.setStore("isProcessing", false)
        this.logEvent("synthesis_started", { text: text.substring(0, 100) })
      }

      utterance.onend = () => {
        this.setStore("isSpeaking", false)
        const duration = Date.now() - startTime
        this.setStore("metrics", "totalSynthesisTime", prev => prev + duration)
        this.logEvent("synthesis_ended", { duration })
      }

      utterance.onerror = (event: any) => {
        console.error("Speech synthesis error:", event.error)
        this.setStore("isSpeaking", false)
        this.setStore("isProcessing", false)
        this.setStore("metrics", "errorCount", prev => prev + 1)
        this.setStore("metrics", "lastError", event.error)
        this.logEvent("synthesis_error", { error: event.error })
      }

      // Speak
      this.synthesis.speak(utterance)

      return true
    } catch (error) {
      console.error("Failed to speak:", error)
      this.setStore("isSpeaking", false)
      this.setStore("isProcessing", false)
      throw error
    }
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel()
      this.setStore("isSpeaking", false)
      this.setStore("isProcessing", false)
      this.logEvent("synthesis_stopped")
    }
  }

  // Voice command methods
  private checkVoiceCommands(text: string) {
    const commands = this.store.voiceCommands.filter(cmd => cmd.enabled)
    const lowerText = text.toLowerCase().trim()
    
    for (const command of commands) {
      if (lowerText.includes(command.phrase.toLowerCase())) {
        this.executeVoiceCommand(command)
        break
      }
    }
  }

  private executeVoiceCommand(command: VoiceCommand) {
    this.logEvent("voice_command_executed", { command: command.phrase, action: command.action })
    
    // Emit custom event for command handling
    const event = new CustomEvent("voiceCommand", {
      detail: {
        phrase: command.phrase,
        action: command.action,
        category: command.category,
        customAction: command.customAction
      }
    })
    window.dispatchEvent(event)
  }

  // Settings management
  updateSettings(newSettings: Partial<EnhancedSpeechSettings>) {
    this.setStore("settings", newSettings)
    this.logEvent("settings_updated", newSettings)
  }

  addVoiceCommand(command: Omit<VoiceCommand, "id">) {
    const newCommand: VoiceCommand = {
      ...command,
      id: crypto.randomUUID()
    }
    this.setStore("voiceCommands", prev => [...prev, newCommand])
    this.logEvent("voice_command_added", { phrase: command.phrase })
  }

  removeVoiceCommand(id: string) {
    this.setStore("voiceCommands", prev => prev.filter(cmd => cmd.id !== id))
    this.logEvent("voice_command_removed", { id })
  }

  updateVoiceCommand(id: string, updates: Partial<VoiceCommand>) {
    this.setStore("voiceCommands", prev => 
      prev.map(cmd => cmd.id === id ? { ...cmd, ...updates } : cmd)
    )
    this.logEvent("voice_command_updated", { id, updates })
  }

  // Utility methods
  private processSSML(text: string, settings: EnhancedSpeechSettings): string {
    // Basic SSML processing
    let ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${settings.language}">`
    
    if (settings.enableEmotion) {
      ssml += `<emphasis level="moderate">${text}</emphasis>`
    } else {
      ssml += text
    }
    
    ssml += `</speak>`
    return ssml
  }

  private startMediaRecording(stream: MediaStream) {
    try {
      this.mediaRecorder = new MediaRecorder(stream)
      this.audioChunks = []
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }
      
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        this.logEvent("audio_recorded", { size: audioBlob.size })
        this.audioChunks = []
      }
      
      this.mediaRecorder.start()
    } catch (error) {
      console.error("Failed to start media recording:", error)
    }
  }

  private logEvent(event: string, data?: any) {
    if (this.store.settings.debugMode) {
      console.log(`[SpeechController] ${event}:`, data)
    }
  }

  // Cleanup
  cleanup() {
    this.stopRecognition()
    this.stopSpeaking()
    
    if (this.audioContext) {
      this.audioContext.close()
    }
    
    if (this.mediaRecorder) {
      this.mediaRecorder.stop()
    }
  }
}

// Create singleton instance
export const enhancedSpeechController = new EnhancedSpeechController()
