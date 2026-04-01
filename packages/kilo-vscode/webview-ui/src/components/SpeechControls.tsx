import { Component, For, Show, createSignal, createEffect, onMount } from "solid-js"
import { Card } from "@kilocode/kilo-ui/card"
import { Button } from "@kilocode/kilo-ui/button"
import { Badge } from "@kilocode/kilo-ui/badge"
import { Select } from "@kilocode/kilo-ui/select"
import { Switch } from "@kilocode/kilo-ui/switch"
import { useVSCode } from "../context/vscode"
import { useStatusMonitor } from "../services/StatusMonitor"

interface SpeechStatus {
  isRecording: boolean
  isSpeaking: boolean
  isProcessing: boolean
  recognizedText: string
  interimText: string
  currentProvider: string
  currentVoice: string
  confidence: number
  errors: Array<{
    timestamp: Date
    message: string
    type: string
  }>
}

interface VoiceCommand {
  id: string
  phrase: string
  action: string
  enabled: boolean
  category: string
}

const SpeechControls: Component = () => {
  const vscode = useVSCode()
  const statusMonitor = useStatusMonitor()
  
  // State
  const [speechStatus, setSpeechStatus] = createSignal<SpeechStatus>({
    isRecording: false,
    isSpeaking: false,
    isProcessing: false,
    recognizedText: "",
    interimText: "",
    currentProvider: "browser",
    currentVoice: "default",
    confidence: 0,
    errors: []
  })
  
  const [voiceCommands, setVoiceCommands] = createSignal<VoiceCommand[]>([])
  const [testText, setTestText] = createSignal("Hello, this is a test of the speech system.")
  const [showAdvanced, setShowAdvanced] = createSignal(false)
  const [selectedProvider, setSelectedProvider] = createSignal("browser")
  const [selectedVoice, setSelectedVoice] = createSignal("default")
  const [confidenceThreshold, setConfidenceThreshold] = createSignal(0.8)
  const [continuousMode, setContinuousMode] = createSignal(false)
  
  // Get speech feature status
  const speechFeatureStatus = createMemo(() => 
    statusMonitor.getFeatureStatus('speech')()
  )

  // Setup message handlers
  onMount(() => {
    vscode.onMessage((message) => {
      switch (message.type) {
        case "speechStatus":
          setSpeechStatus(message.data)
          break
        case "speechResult":
          handleSpeechResult(message.data)
          break
        case "voiceCommands":
          setVoiceCommands(message.data)
          break
        case "speechError":
          handleSpeechError(message.data)
          break
      }
    })
    
    // Request initial status
    vscode.postMessage({
      type: "speech",
      action: "getStatus"
    })
    
    vscode.postMessage({
      type: "speech",
      action: "getVoiceCommands"
    })
  })

  // Handle speech recognition result
  const handleSpeechResult = (data: {
    text: string
    isFinal: boolean
    confidence: number
  }) => {
    setSpeechStatus(prev => ({
      ...prev,
      recognizedText: prev.recognizedText + (data.isFinal ? data.text : ""),
      interimText: data.isFinal ? "" : data.text,
      confidence: data.confidence
    }))
  }

  // Handle speech error
  const handleSpeechError = (data: {
    error: string
    type: string
  }) => {
    setSpeechStatus(prev => ({
      ...prev,
      errors: [...prev.errors, {
        timestamp: new Date(),
        message: data.error,
        type: data.type
      }].slice(-10) // Keep last 10 errors
    }))
  }

  // Start recording
  const startRecording = () => {
    vscode.postMessage({
      type: "speech",
      action: "startRecording",
      provider: selectedProvider(),
      voice: selectedVoice(),
      confidenceThreshold: confidenceThreshold(),
      continuous: continuousMode()
    })
  }

  // Stop recording
  const stopRecording = () => {
    vscode.postMessage({
      type: "speech",
      action: "stopRecording"
    })
  }

  // Start speaking
  const startSpeaking = () => {
    vscode.postMessage({
      type: "speech",
      action: "speak",
      text: testText(),
      provider: selectedProvider(),
      voice: selectedVoice()
    })
  }

  // Stop speaking
  const stopSpeaking = () => {
    vscode.postMessage({
      type: "speech",
      action: "stopSpeaking"
    })
  }

  // Toggle voice command
  const toggleVoiceCommand = (commandId: string, enabled: boolean) => {
    vscode.postMessage({
      type: "speech",
      action: "toggleVoiceCommand",
      commandId,
      enabled
    })
  }

  // Clear recognized text
  const clearText = () => {
    setSpeechStatus(prev => ({
      ...prev,
      recognizedText: "",
      interimText: ""
    }))
  }

  // Get status color
  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-500' : 'text-gray-500'
  }

  // Get provider options
  const providerOptions = [
    { value: "browser", label: "Browser Web Speech" },
    { value: "azure", label: "Azure Speech" },
    { value: "openai", label: "OpenAI TTS" },
    { value: "elevenlabs", label: "ElevenLabs" },
    { value: "coqui", label: "Coqui TTS" }
  ]

  return (
    <div class="p-4 space-y-4">
      {/* Speech Status */}
      <Card class="p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold">Speech Controls</h3>
          <div class="flex items-center space-x-2">
            <Badge variant={speechFeatureStatus().working ? "secondary" : "destructive"}>
              {speechFeatureStatus().enabled ? 
                (speechFeatureStatus().working ? 'Working' : 'Broken') : 
                'Disabled'
              }
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => statusMonitor.toggleFeature('speech', !speechFeatureStatus().enabled)}
            >
              {speechFeatureStatus().enabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </div>
        
        {/* Status Indicators */}
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="text-center">
            <div class={`w-3 h-3 rounded-full mx-auto mb-1 ${getStatusColor(speechStatus().isRecording)} bg-current`} />
            <div class="text-sm">Recording</div>
          </div>
          <div class="text-center">
            <div class={`w-3 h-3 rounded-full mx-auto mb-1 ${getStatusColor(speechStatus().isSpeaking)} bg-current`} />
            <div class="text-sm">Speaking</div>
          </div>
          <div class="text-center">
            <div class={`w-3 h-3 rounded-full mx-auto mb-1 ${getStatusColor(speechStatus().isProcessing)} bg-current`} />
            <div class="text-sm">Processing</div>
          </div>
        </div>

        {/* Control Buttons */}
        <div class="grid grid-cols-2 gap-2">
          <Button
            variant={speechStatus().isRecording ? "destructive" : "default"}
            onClick={speechStatus().isRecording ? stopRecording : startRecording}
            disabled={!speechFeatureStatus().enabled || !speechFeatureStatus().working}
          >
            {speechStatus().isRecording ? '🔴 Stop Recording' : '🎤 Start Recording'}
          </Button>
          <Button
            variant={speechStatus().isSpeaking ? "destructive" : "default"}
            onClick={speechStatus().isSpeaking ? stopSpeaking : startSpeaking}
            disabled={!speechFeatureStatus().enabled || !speechFeatureStatus().working}
          >
            {speechStatus().isSpeaking ? '🔇 Stop Speaking' : '🔊 Test Speak'}
          </Button>
        </div>
      </Card>

      {/* Recognition Results */}
      <Card class="p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold">Recognition Results</h3>
          <div class="flex items-center space-x-2">
            <Show when={speechStatus().confidence > 0}>
              <Badge variant="outline" class="text-xs">
                {Math.round(speechStatus().confidence * 100)}% confidence
              </Badge>
            </Show>
            <Button
              variant="outline"
              size="sm"
              onClick={clearText}
            >
              Clear
            </Button>
          </div>
        </div>
        
        <div class="space-y-2">
          <div class="p-3 bg-gray-50 rounded min-h-[60px] font-mono text-sm">
            <Show when={speechStatus().recognizedText || speechStatus().interimText}>
              <div>
                <Show when={speechStatus().recognizedText}>
                  <div class="text-green-700">{speechStatus().recognizedText}</div>
                </Show>
                <Show when={speechStatus().interimText}>
                  <div class="text-gray-500 italic">{speechStatus().interimText}</div>
                </Show>
              </div>
            </Show>
            <Show when={!speechStatus().recognizedText && !speechStatus().interimText}>
              <div class="text-gray-400">Start recording to see results...</div>
            </Show>
          </div>
        </div>
      </Card>

      {/* Provider Settings */}
      <Card class="p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold">Provider Settings</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced())}
          >
            {showAdvanced() ? 'Hide' : 'Show'} Advanced
          </Button>
        </div>
        
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">Provider</label>
              <Select
                value={selectedProvider()}
                onChange={setSelectedProvider}
                options={providerOptions}
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Voice</label>
              <Select
                value={selectedVoice()}
                onChange={setSelectedVoice}
                options={[
                  { value: "default", label: "Default" },
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" }
                ]}
              />
            </div>
          </div>
          
          <Show when={showAdvanced()}>
            <div class="space-y-3 pt-3 border-t">
              <div>
                <label class="block text-sm font-medium mb-1">
                  Confidence Threshold: {Math.round(confidenceThreshold() * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={confidenceThreshold()}
                  onInput={(e) => setConfidenceThreshold(parseFloat(e.currentTarget.value))}
                  class="w-full"
                />
              </div>
              
              <div class="flex items-center space-x-2">
                <Switch
                  checked={continuousMode()}
                  onChange={setContinuousMode}
                />
                <label class="text-sm font-medium">Continuous Mode</label>
              </div>
            </div>
          </Show>
        </div>
      </Card>

      {/* Test Input */}
      <Card class="p-4">
        <h3 class="font-semibold mb-3">Test Text-to-Speech</h3>
        <div class="space-y-3">
          <textarea
            value={testText()}
            onInput={(e) => setTestText(e.currentTarget.value)}
            placeholder="Enter text to speak..."
            class="w-full p-2 border rounded min-h-[60px] resize-none"
          />
          <Button
            onClick={startSpeaking}
            disabled={!speechFeatureStatus().enabled || !speechFeatureStatus().working || !testText().trim()}
          >
            🔊 Speak Text
          </Button>
        </div>
      </Card>

      {/* Voice Commands */}
      <Card class="p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold">Voice Commands</h3>
          <Badge variant="outline" class="text-xs">
            {voiceCommands().filter(cmd => cmd.enabled).length} active
          </Badge>
        </div>
        
        <div class="space-y-2">
          <For 
            each={voiceCommands()}
            fallback={
              <div class="text-gray-500 text-sm">No voice commands configured</div>
            }
          >
            {(command) => (
              <div class="flex items-center justify-between p-2 rounded border">
                <div class="flex items-center space-x-2">
                  <Switch
                    checked={command.enabled}
                    onChange={(enabled) => toggleVoiceCommand(command.id, enabled)}
                  />
                  <div>
                    <div class="font-medium">{command.phrase}</div>
                    <div class="text-sm text-gray-600">{command.action}</div>
                  </div>
                </div>
                <Badge variant="outline" class="text-xs">
                  {command.category}
                </Badge>
              </div>
            )}
          </For>
        </div>
      </Card>

      {/* Recent Errors */}
      <Show when={speechStatus().errors.length > 0}>
        <Card class="p-4">
          <h3 class="font-semibold mb-3">Recent Errors</h3>
          <div class="space-y-2">
            <For each={speechStatus().errors}>
              {(error) => (
                <div class="p-2 rounded border border-red-200 bg-red-50">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-red-700">{error.type}</span>
                    <span class="text-xs text-gray-500">
                      {error.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div class="text-sm text-red-600">{error.message}</div>
                </div>
              )}
            </For>
          </div>
        </Card>
      </Show>
    </div>
  )
}

export default SpeechControls
