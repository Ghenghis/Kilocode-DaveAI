import { createSignal, createMemo, For, Show, Component } from "solid-js"
import { Card } from "@opencode-ai/ui/card"
import { Button } from "@opencode-ai/ui/button"
import { Badge } from "@opencode-ai/ui/badge"
import { Icon } from "@opencode-ai/ui/icon"
import { Switch } from "@opencode-ai/ui/switch"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import { Input } from "@opencode-ai/ui/input"
import { Label } from "@opencode-ai/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@opencode-ai/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@opencode-ai/ui/tabs"
import { Progress } from "@opencode-ai/ui/progress"
import { Alert, AlertDescription } from "@opencode-ai/ui/alert"
import { createSpeechRecognition } from "@/utils/speech"
import { speechController, type SpeechSettings } from "@/utils/speech-controller"

export interface SpeechProvider {
  id: string
  name: string
  type: "browser" | "azure" | "openai" | "custom"
  status: "connected" | "disconnected" | "error" | "testing"
  capabilities: string[]
  latency?: number
  cost?: string
  features: string[]
}

export interface VoiceSettings {
  id: string
  name: string
  language: string
  gender: "male" | "female" | "neutral"
  age: "child" | "young" | "adult" | "elderly"
  style: string
  rate: number
  pitch: number
  volume: number
  emotion?: string
  accent?: string
}

export interface SpeechCommand {
  id: string
  phrase: string
  action: string
  enabled: boolean
  confidence: number
  category: "navigation" | "editing" | "system" | "custom"
}

interface ComprehensiveSpeechSystemProps {
  className?: string
}

export const ComprehensiveSpeechSystem: Component<ComprehensiveSpeechSystemProps> = (props) => {
  const [activeTab, setActiveTab] = createSignal("overview")
  const [isRecording, setIsRecording] = createSignal(false)
  const [isSpeaking, setIsSpeaking] = createSignal(false)
  const [speechText, setSpeechText] = createSignal("")
  const [recognizedText, setRecognizedText] = createSignal("")
  const [selectedProvider, setSelectedProvider] = createSignal("browser")
  const [selectedVoice, setSelectedVoice] = createSignal("default")
  const [testMode, setTestMode] = createSignal(false)

  // Speech recognition setup
  const speechRecognition = createMemo(() => 
    createSpeechRecognition({
      lang: "en-US",
      onFinal: (text) => {
        setRecognizedText(prev => prev + " " + text)
      },
      onInterim: (text) => {
        setSpeechText(text)
      }
    })
  )

  // Available providers
  const providers = createMemo<SpeechProvider[]>(() => [
    {
      id: "browser",
      name: "Browser Web Speech",
      type: "browser",
      status: speechRecognition().isSupported() ? "connected" : "disconnected",
      capabilities: ["text-to-speech", "speech-to-text", "voice-selection"],
      latency: "< 100ms",
      cost: "Free",
      features: ["Real-time", "Multiple voices", "Language support"]
    },
    {
      id: "azure",
      name: "Azure Speech Services",
      type: "azure",
      status: "disconnected",
      capabilities: ["text-to-speech", "speech-to-text", "neural-voices", "custom-voices"],
      latency: "~ 200ms",
      cost: "$4/1M chars",
      features: ["Neural voices", "SSML", "Custom voices", "Batch synthesis"]
    },
    {
      id: "openai",
      name: "OpenAI TTS",
      type: "openai",
      status: "disconnected",
      capabilities: ["text-to-speech", "multiple-voices", "audio-quality"],
      latency: "~ 300ms",
      cost: "$15/1M chars",
      features: ["6 voices", "HD audio", "Multiple languages"]
    },
    {
      id: "elevenlabs",
      name: "ElevenLabs",
      type: "custom",
      status: "disconnected",
      capabilities: ["text-to-speech", "voice-cloning", "emotion-control"],
      latency: "~ 400ms",
      cost: "$1/1K chars",
      features: ["Voice cloning", "Emotion control", "Sound effects"]
    },
    {
      id: "coqui",
      name: "Coqui TTS",
      type: "custom",
      status: "disconnected",
      capabilities: ["text-to-speech", "open-source", "multilingual"],
      latency: "~ 250ms",
      cost: "Free/Open Source",
      features: ["Open source", "100+ languages", "Custom models"]
    }
  ])

  // Available voices
  const voices = createMemo<VoiceSettings[]>(() => [
    {
      id: "default",
      name: "Default Browser Voice",
      language: "en-US",
      gender: "neutral",
      age: "adult",
      style: "conversational",
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0
    },
    {
      id: "azure-emma",
      name: "Emma (Azure)",
      language: "en-US",
      gender: "female",
      age: "young",
      style: "friendly",
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      emotion: "cheerful"
    },
    {
      id: "openai-alloy",
      name: "Alloy (OpenAI)",
      language: "en-US",
      gender: "neutral",
      age: "young",
      style: "balanced",
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0
    },
    {
      id: "elevenlabs-rachel",
      name: "Rachel (ElevenLabs)",
      language: "en-US",
      gender: "female",
      age: "young",
      style: "professional",
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      emotion: "confident"
    }
  ])

  // Voice commands
  const voiceCommands = createMemo<SpeechCommand[]>(() => [
    {
      id: "new-session",
      phrase: "new session",
      action: "create_new_session",
      enabled: true,
      confidence: 0.9,
      category: "navigation"
    },
    {
      id: "stop-speaking",
      phrase: "stop speaking",
      action: "stop_speech",
      enabled: true,
      confidence: 0.95,
      category: "system"
    },
    {
      id: "save-work",
      phrase: "save work",
      action: "save_current_file",
      enabled: true,
      confidence: 0.85,
      category: "editing"
    },
    {
      id: "undo",
      phrase: "undo",
      action: "undo_last_action",
      enabled: true,
      confidence: 0.9,
      category: "editing"
    },
    {
      id: "help",
      phrase: "help",
      action: "show_help",
      enabled: true,
      confidence: 0.95,
      category: "system"
    }
  ])

  const handleStartRecording = () => {
    if (!speechRecognition().isSupported()) {
      alert("Speech recognition not supported in this browser")
      return
    }
    setIsRecording(true)
    setRecognizedText("")
    speechRecognition().start()
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    speechRecognition().stop()
  }

  const handleSpeak = async (text: string) => {
    if (!text.trim()) return
    
    setIsSpeaking(true)
    const settings: SpeechSettings = {
      enabled: true,
      autoSpeakAssistant: false,
      location: "local",
      provider: selectedProvider() as any,
      hasAzureKey: false,
      hasOpenAICompatibleKey: false,
      browserVoice: selectedVoice(),
      browserLang: "en-US",
      browserRate: 1.0,
      browserPitch: 1.0,
      azureRegion: "westus",
      azureVoice: "en-US-JennyNeural",
      azureFormat: "audio-24khz-48kbitrate-mono-mp3",
      openaiCompatibleBaseUrl: "https://api.openai.com/v1",
      openaiCompatibleModel: "tts-1",
      openaiCompatibleVoice: "alloy",
      openaiCompatibleResponseFormat: "mp3"
    }

    try {
      await speechController.speak(text, settings)
    } catch (error) {
      console.error("Speech error:", error)
    } finally {
      setIsSpeaking(false)
    }
  }

  const handleStopSpeaking = () => {
    speechController.stop()
    setIsSpeaking(false)
  }

  const currentProvider = createMemo(() => 
    providers().find(p => p.id === selectedProvider())
  )

  const currentVoice = createMemo(() => 
    voices().find(v => v.id === selectedVoice())
  )

  const systemStats = createMemo(() => ({
    totalProviders: providers().length,
    connectedProviders: providers().filter(p => p.status === "connected").length,
    totalVoices: voices().length,
    enabledCommands: voiceCommands().filter(c => c.enabled).length,
    supported: speechRecognition().isSupported()
  }))

  return (
    <div class={`comprehensive-speech-system ${props.className || ""}`}>
      <div class="p-6 space-y-6">
        {/* Header */}
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold">Speech System</h1>
            <p class="text-gray-600">Complete speech-to-text and text-to-speech functionality</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <div class="text-2xl font-bold text-green-600">
                {systemStats().connectedProviders}/{systemStats().totalProviders}
              </div>
              <div class="text-sm text-gray-600">Providers Connected</div>
            </div>
            <Badge variant={systemStats().supported ? "default" : "destructive"}>
              {systemStats().supported ? "Supported" : "Not Supported"}
            </Badge>
          </div>
        </div>

        {/* Status Alerts */}
        <Show when={!systemStats().supported}>
          <Alert class="border-red-200 bg-red-50">
            <Icon name="alert-triangle" class="h-4 w-4 text-red-600" />
            <AlertDescription>
              Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari for full functionality.
            </AlertDescription>
          </Alert>
        </Show>

        <Show when={systemStats().connectedProviders === 0}>
          <Alert class="border-orange-200 bg-orange-50">
            <Icon name="info" class="h-4 w-4 text-orange-600" />
            <AlertDescription>
              No speech providers are connected. Configure at least one provider to enable speech functionality.
            </AlertDescription>
          </Alert>
        </Show>

        {/* Main Interface */}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Speech Controls */}
          <div class="lg:col-span-2 space-y-6">
            {/* Speech Input/Output */}
            <Card class="p-6">
              <h3 class="text-lg font-semibold mb-4">Speech Interface</h3>
              
              {/* Speech Recognition */}
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <Label>Speech Recognition</Label>
                  <div class="flex items-center gap-2">
                    <div class={`w-2 h-2 rounded-full ${
                      isRecording() ? "bg-red-500 animate-pulse" : "bg-gray-500"
                    }`} />
                    <span class="text-sm text-gray-600">
                      {isRecording() ? "Recording..." : "Ready"}
                    </span>
                  </div>
                </div>
                
                <div class="flex gap-2">
                  <Button
                    variant={isRecording() ? "destructive" : "default"}
                    onClick={isRecording() ? handleStopRecording : handleStartRecording}
                    disabled={!systemStats().supported}
                  >
                    <Icon name={isRecording() ? "mic-off" : "mic"} class="w-4 h-4 mr-2" />
                    {isRecording() ? "Stop Recording" : "Start Recording"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setRecognizedText("")}
                  >
                    <Icon name="refresh-cw" class="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>

                <div class="min-h-[100px] p-3 border rounded-lg bg-gray-50">
                  <div class="text-sm text-gray-600 mb-1">Recognized:</div>
                  <div class="text-gray-900">
                    {recognizedText() || <span class="text-gray-500">Start speaking to see text...</span>}
                  </div>
                  <Show when={speechText()}>
                    <div class="text-sm text-blue-600 mt-2 italic">
                      {speechText()}
                    </div>
                  </Show>
                </div>
              </div>

              {/* Text-to-Speech */}
              <div class="space-y-4 mt-6">
                <div class="flex items-center justify-between">
                  <Label>Text-to-Speech</Label>
                  <div class="flex items-center gap-2">
                    <div class={`w-2 h-2 rounded-full ${
                      isSpeaking() ? "bg-green-500 animate-pulse" : "bg-gray-500"
                    }`} />
                    <span class="text-sm text-gray-600">
                      {isSpeaking() ? "Speaking..." : "Ready"}
                    </span>
                  </div>
                </div>

                <textarea
                  class="w-full p-3 border rounded-lg min-h-[80px]"
                  placeholder="Enter text to speak..."
                  value={speechText() || recognizedText()}
                  onInput={(e) => setSpeechText(e.target.value)}
                />

                <div class="flex gap-2">
                  <Button
                    onClick={() => handleSpeak(speechText() || recognizedText())}
                    disabled={!speechText() && !recognizedText()}
                  >
                    <Icon name="play" class="w-4 h-4 mr-2" />
                    Speak
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleStopSpeaking}
                    disabled={!isSpeaking()}
                  >
                    <Icon name="stop" class="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                </div>
              </div>
            </Card>

            {/* Voice Commands */}
            <Card class="p-6">
              <h3 class="text-lg font-semibold mb-4">Voice Commands</h3>
              <div class="space-y-3">
                <For each={voiceCommands()}>
                  {(command) => (
                    <div class="flex items-center justify-between p-3 border rounded-lg">
                      <div class="flex items-center gap-3">
                        <Switch
                          checked={command.enabled}
                          class="scale-75"
                        />
                        <div>
                          <div class="font-medium">"{command.phrase}"</div>
                          <div class="text-sm text-gray-600">{command.action}</div>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <Badge variant="outline" class="text-xs">
                          {command.category}
                        </Badge>
                        <div class="text-sm text-gray-500">
                          {Math.round(command.confidence * 100)}%
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Card>
          </div>

          {/* Configuration Panel */}
          <div class="space-y-6">
            {/* Provider Selection */}
            <Card class="p-6">
              <h3 class="text-lg font-semibold mb-4">Speech Provider</h3>
              <div class="space-y-3">
                <For each={providers()}>
                  {(provider) => (
                    <div
                      class={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedProvider() === provider.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedProvider(provider.id)}
                    >
                      <div class="flex items-center justify-between mb-2">
                        <div class="font-medium">{provider.name}</div>
                        <div class={`w-2 h-2 rounded-full ${
                          provider.status === "connected" ? "bg-green-500" :
                          provider.status === "testing" ? "bg-yellow-500" :
                          provider.status === "error" ? "bg-red-500" : "bg-gray-500"
                        }`} />
                      </div>
                      <div class="text-sm text-gray-600 space-y-1">
                        <div>Latency: {provider.latency}</div>
                        <div>Cost: {provider.cost}</div>
                        <div class="flex flex-wrap gap-1 mt-2">
                          <For each={provider.features}>
                            {(feature) => (
                              <Badge variant="outline" class="text-xs">
                                {feature}
                              </Badge>
                            )}
                          </For>
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Card>

            {/* Voice Selection */}
            <Card class="p-6">
              <h3 class="text-lg font-semibold mb-4">Voice Settings</h3>
              <div class="space-y-4">
                <div>
                  <Label>Voice</Label>
                  <Select value={selectedVoice()} onChange={setSelectedVoice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      <For each={voices()}>
                        {(voice) => (
                          <SelectItem value={voice.id}>
                            {voice.name}
                          </SelectItem>
                        )}
                      </For>
                    </SelectContent>
                  </Select>
                </div>

                <Show when={currentVoice()}>
                  <div class="space-y-3">
                    <div class="flex justify-between">
                      <span>Language</span>
                      <span class="font-medium">{currentVoice()?.language}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Gender</span>
                      <span class="font-medium capitalize">{currentVoice()?.gender}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Style</span>
                      <span class="font-medium capitalize">{currentVoice()?.style}</span>
                    </div>
                    <Show when={currentVoice()?.emotion}>
                      <div class="flex justify-between">
                        <span>Emotion</span>
                        <span class="font-medium capitalize">{currentVoice()?.emotion}</span>
                      </div>
                    </Show>
                  </div>
                </Show>

                {/* Voice Controls */}
                <div class="space-y-3">
                  <div>
                    <Label>Rate: {currentVoice()?.rate || 1.0}x</Label>
                    <Progress value={(currentVoice()?.rate || 1.0) * 50} class="mt-1" />
                  </div>
                  <div>
                    <Label>Pitch: {currentVoice()?.pitch || 1.0}x</Label>
                    <Progress value={(currentVoice()?.pitch || 1.0) * 50} class="mt-1" />
                  </div>
                  <div>
                    <Label>Volume: {Math.round((currentVoice()?.volume || 1.0) * 100)}%</Label>
                    <Progress value={(currentVoice()?.volume || 1.0) * 100} class="mt-1" />
                  </div>
                </div>
              </div>
            </Card>

            {/* System Stats */}
            <Card class="p-6">
              <h3 class="text-lg font-semibold mb-4">System Status</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span>Providers</span>
                  <span>{systemStats().connectedProviders}/{systemStats().totalProviders}</span>
                </div>
                <div class="flex justify-between">
                  <span>Voices</span>
                  <span>{systemStats().totalVoices}</span>
                </div>
                <div class="flex justify-between">
                  <span>Commands</span>
                  <span>{systemStats().enabledCommands} enabled</span>
                </div>
                <div class="flex justify-between">
                  <span>Browser Support</span>
                  <Badge variant={systemStats().supported ? "default" : "destructive"}>
                    {systemStats().supported ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Advanced Settings */}
        <Card class="p-6">
          <h3 class="text-lg font-semibold mb-4">Advanced Settings</h3>
          <Tabs value={activeTab()} onChange={setActiveTab}>
            <TabsList class="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="quality">Quality</TabsTrigger>
              <TabsTrigger value="commands">Commands</TabsTrigger>
              <TabsTrigger value="debug">Debug</TabsTrigger>
            </TabsList>

            <TabsContent value="general" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label>Auto-speak responses</Label>
                  <Switch />
                </div>
                <div class="space-y-2">
                  <Label>Continuous recognition</Label>
                  <Switch />
                </div>
                <div class="space-y-2">
                  <Label>Confidence threshold</Label>
                  <Input type="number" value="0.8" min="0" max="1" step="0.1" />
                </div>
                <div class="space-y-2">
                  <Label>Silence timeout (ms)</Label>
                  <Input type="number" value="2000" min="500" max="10000" step="100" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="quality" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label>Audio quality</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (fast)</SelectItem>
                      <SelectItem value="medium">Medium (balanced)</SelectItem>
                      <SelectItem value="high">High (quality)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="space-y-2">
                  <Label>Sample rate</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sample rate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16000">16 kHz</SelectItem>
                      <SelectItem value="22050">22.05 kHz</SelectItem>
                      <SelectItem value="24000">24 kHz</SelectItem>
                      <SelectItem value="44100">44.1 kHz</SelectItem>
                      <SelectItem value="48000">48 kHz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="space-y-2">
                  <Label>Audio format</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mp3">MP3</SelectItem>
                      <SelectItem value="wav">WAV</SelectItem>
                      <SelectItem value="ogg">OGG</SelectItem>
                      <SelectItem value="webm">WebM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="space-y-2">
                  <Label>Bitrate</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bitrate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="64">64 kbps</SelectItem>
                      <SelectItem value="128">128 kbps</SelectItem>
                      <SelectItem value="192">192 kbps</SelectItem>
                      <SelectItem value="256">256 kbps</SelectItem>
                      <SelectItem value="320">320 kbps</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="commands" class="space-y-4">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <Label>Custom Commands</Label>
                  <Button variant="outline" size="sm">
                    <Icon name="plus" class="w-4 h-4 mr-2" />
                    Add Command
                  </Button>
                </div>
                <div class="space-y-2">
                  <For each={voiceCommands().filter(c => c.category === "custom")}>
                    {(command) => (
                      <div class="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div class="font-medium">"{command.phrase}"</div>
                          <div class="text-sm text-gray-600">{command.action}</div>
                        </div>
                        <div class="flex items-center gap-2">
                          <Switch checked={command.enabled} />
                          <Button variant="ghost" size="sm">
                            <Icon name="edit" class="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="debug" class="space-y-4">
              <div class="space-y-4">
                <div class="space-y-2">
                  <Label>Debug mode</Label>
                  <Switch />
                </div>
                <div class="space-y-2">
                  <Label>Show confidence scores</Label>
                  <Switch />
                </div>
                <div class="space-y-2">
                  <Label>Log audio events</Label>
                  <Switch />
                </div>
                <div class="space-y-2">
                  <Label>Performance metrics</Label>
                  <Switch />
                </div>
                <div class="mt-4 p-3 border rounded-lg bg-gray-50">
                  <div class="text-sm font-medium mb-2">System Information</div>
                  <div class="text-xs space-y-1">
                    <div>User Agent: {navigator.userAgent}</div>
                    <div>Language: {navigator.language}</div>
                    <div>Platform: {navigator.platform}</div>
                    <div>Speech Recognition: {speechRecognition().isSupported() ? "Supported" : "Not Supported"}</div>
                    <div>Speech Synthesis: {window.speechSynthesis ? "Supported" : "Not Supported"}</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
