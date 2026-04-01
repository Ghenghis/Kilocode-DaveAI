import { createSignal, createEffect, createMemo, onCleanup, onMount, Component } from "solid-js"
import { Card } from "@opencode-ai/ui/card"
import { Button } from "@opencode-ai/ui/button"
import { Badge } from "@opencode-ai/ui/badge"
import { Icon } from "@opencode-ai/ui/icon"
import { Switch } from "@opencode-ai/ui/switch"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import { Input } from "@opencode-ai/ui/input"
import { Label } from "@opencode-ai/ui/label"
import { Alert, AlertDescription } from "@opencode-ai/ui/alert"
import { enhancedSpeechController, type EnhancedSpeechSettings, type VoiceCommand } from "@/utils/enhanced-speech-controller"

interface SpeechIntegrationProps {
  onTextRecognized?: (text: string, confidence: number) => void
  onCommandExecuted?: (command: string, action: string) => void
  onError?: (error: string, type: "recognition" | "synthesis") => void
  className?: string
}

export const SpeechIntegration: Component<SpeechIntegrationProps> = (props) => {
  const [isInitialized, setIsInitialized] = createSignal(false)
  const [isRecording, setIsRecording] = createSignal(false)
  const [isSpeaking, setIsSpeaking] = createSignal(false)
  const [currentText, setCurrentText] = createSignal("")
  const [lastCommand, setLastCommand] = createSignal("")
  const [showSettings, setShowSettings] = createSignal(false)
  const [selectedDevice, setSelectedDevice] = createSignal("")
  const [testMode, setTestMode] = createSignal(false)

  // Get controller state
  const isRecordingController = enhancedSpeechController.isRecording
  const isSpeakingController = enhancedSpeechController.isSpeaking
  const recognizedText = enhancedSpeechController.recognizedText
  const interimText = enhancedSpeechController.interimText
  const audioDevices = enhancedSpeechController.audioDevices
  const metrics = enhancedSpeechController.metrics
  const settings = enhancedSpeechController.settings

  // Initialize on mount
  onMount(async () => {
    try {
      const initialized = await enhancedSpeechController.initializeAudio()
      setIsInitialized(initialized)
      
      if (!initialized) {
        console.error("Failed to initialize speech system")
      }
    } catch (error) {
      console.error("Speech initialization error:", error)
    }
  })

  // Sync local state with controller
  createEffect(() => {
    setIsRecording(isRecordingController())
    setIsSpeaking(isSpeakingController())
    setCurrentText(recognizedText() + interimText())
  })

  // Listen for voice commands
  createEffect(() => {
    const handleVoiceCommand = (event: CustomEvent) => {
      const { phrase, action, category } = event.detail
      setLastCommand(`${phrase} → ${action}`)
      props.onCommandExecuted?.(phrase, action)
    }

    window.addEventListener("voiceCommand", handleVoiceCommand as EventListener)
    
    onCleanup(() => {
      window.removeEventListener("voiceCommand", handleVoiceCommand as EventListener)
    })
  })

  // Handle recognized text
  createEffect(() => {
    const text = recognizedText()
    if (text && props.onTextRecognized) {
      props.onTextRecognized(text, metrics().averageConfidence)
    }
  })

  // Handle errors
  createEffect(() => {
    const lastError = metrics().lastError
    if (lastError && props.onError) {
      props.onError(lastError, "recognition")
    }
  })

  const handleStartRecording = async () => {
    try {
      await enhancedSpeechController.startRecognition(selectedDevice())
    } catch (error) {
      console.error("Failed to start recording:", error)
      props.onError?.(error as string, "recognition")
    }
  }

  const handleStopRecording = () => {
    enhancedSpeechController.stopRecognition()
  }

  const handleSpeak = async (text: string) => {
    try {
      await enhancedSpeechController.speak(text)
    } catch (error) {
      console.error("Failed to speak:", error)
      props.onError?.(error as string, "synthesis")
    }
  }

  const handleStopSpeaking = () => {
    enhancedSpeechController.stopSpeaking()
  }

  const handleSettingsChange = (key: keyof EnhancedSpeechSettings, value: any) => {
    enhancedSpeechController.updateSettings({ [key]: value })
  }

  const handleAddVoiceCommand = (phrase: string, action: string, category: string) => {
    enhancedSpeechController.addVoiceCommand({
      phrase,
      action,
      category: category as any,
      enabled: true,
      confidence: 0.8
    })
  }

  const currentMetrics = createMemo(() => metrics())
  const currentSettings = createMemo(() => settings())
  const availableDevices = createMemo(() => audioDevices())

  return (
    <div class={`speech-integration ${props.className || ""}`}>
      {/* Mini Control Panel */}
      <Card class="p-4">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <Icon name="mic" class="w-5 h-5" />
            <h3 class="font-semibold">Speech Control</h3>
            <Badge variant={isInitialized() ? "default" : "destructive"}>
              {isInitialized() ? "Ready" : "Not Ready"}
            </Badge>
          </div>
          <div class="flex items-center gap-2">
            <Tooltip text="Settings">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings())}
              >
                <Icon name="settings" class="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip text="Test Mode">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTestMode(!testMode())}
              >
                <Icon name="flask" class="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Status Bar */}
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div class="text-center">
            <div class={`w-2 h-2 rounded-full mx-auto mb-1 ${
              isRecording() ? "bg-red-500 animate-pulse" : "bg-gray-500"
            }`} />
            <div class="text-xs text-gray-600">Recording</div>
          </div>
          <div class="text-center">
            <div class={`w-2 h-2 rounded-full mx-auto mb-1 ${
              isSpeaking() ? "bg-green-500 animate-pulse" : "bg-gray-500"
            }`} />
            <div class="text-xs text-gray-600">Speaking</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-bold">{currentMetrics().successfulRecognitions}</div>
            <div class="text-xs text-gray-600">Success</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-bold">{Math.round(currentMetrics().averageConfidence * 100)}%</div>
            <div class="text-xs text-gray-600">Accuracy</div>
          </div>
        </div>

        {/* Quick Controls */}
        <div class="flex gap-2 mb-4">
          <Button
            variant={isRecording() ? "destructive" : "default"}
            size="sm"
            onClick={isRecording() ? handleStopRecording : handleStartRecording}
            disabled={!isInitialized()}
          >
            <Icon name={isRecording() ? "mic-off" : "mic"} class="w-4 h-4 mr-2" />
            {isRecording() ? "Stop" : "Record"}
          </Button>
          <Button
            variant={isSpeaking() ? "destructive" : "default"}
            size="sm"
            onClick={isSpeaking() ? handleStopSpeaking : () => handleSpeak(currentText())}
            disabled={!isInitialized() || !currentText()}
          >
            <Icon name={isSpeaking() ? "stop" : "play"} class="w-4 h-4 mr-2" />
            {isSpeaking() ? "Stop" : "Speak"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentText("")}
          >
            <Icon name="refresh-cw" class="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>

        {/* Current Text Display */}
        <div class="min-h-[80px] p-3 border rounded-lg bg-gray-50">
          <div class="text-sm text-gray-600 mb-1">Current Text:</div>
          <div class="text-gray-900">
            {currentText() || <span class="text-gray-500">Start speaking to see text...</span>}
          </div>
          {interimText() && (
            <div class="text-sm text-blue-600 mt-2 italic">
              {interimText()}
            </div>
          )}
        </div>

        {/* Last Command */}
        {lastCommand() && (
          <div class="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
            <div class="text-sm text-blue-800">
              <Icon name="command" class="w-3 h-3 inline mr-1" />
              Last command: {lastCommand()}
            </div>
          </div>
        )}
      </Card>

      {/* Settings Panel */}
      <Show when={showSettings()}>
        <Card class="p-4 mt-4">
          <h4 class="font-semibold mb-4">Speech Settings</h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Settings */}
            <div class="space-y-3">
              <Label>Basic Settings</Label>
              <div class="flex items-center justify-between">
                <span>Enable Speech</span>
                <Switch
                  checked={currentSettings().enabled}
                  onChange={(checked) => handleSettingsChange("enabled", checked)}
                />
              </div>
              <div class="flex items-center justify-between">
                <span>Auto-speak Assistant</span>
                <Switch
                  checked={currentSettings().autoSpeakAssistant}
                  onChange={(checked) => handleSettingsChange("autoSpeakAssistant", checked)}
                />
              </div>
              <div class="flex items-center justify-between">
                <span>Continuous Recognition</span>
                <Switch
                  checked={currentSettings().continuousRecognition}
                  onChange={(checked) => handleSettingsChange("continuousRecognition", checked)}
                />
              </div>
            </div>

            {/* Device Selection */}
            <div class="space-y-3">
              <Label>Audio Device</Label>
              <select
                class="w-full p-2 border rounded"
                value={selectedDevice()}
                onChange={(e) => setSelectedDevice(e.target.value)}
              >
                <option value="">Default Device</option>
                {availableDevices()
                  .filter(device => device.kind === "audioinput")
                  .map(device => (
                    <option value={device.id}>{device.label}</option>
                  ))}
              </select>
            </div>

            {/* Voice Settings */}
            <div class="space-y-3">
              <Label>Voice Settings</Label>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span>Rate</span>
                  <Input
                    type="number"
                    value={currentSettings().rate}
                    min="0.5"
                    max="2"
                    step="0.1"
                    class="w-20"
                    onChange={(e) => handleSettingsChange("rate", parseFloat(e.target.value))}
                  />
                </div>
                <div class="flex justify-between">
                  <span>Pitch</span>
                  <Input
                    type="number"
                    value={currentSettings().pitch}
                    min="0"
                    max="2"
                    step="0.1"
                    class="w-20"
                    onChange={(e) => handleSettingsChange("pitch", parseFloat(e.target.value))}
                  />
                </div>
                <div class="flex justify-between">
                  <span>Volume</span>
                  <Input
                    type="number"
                    value={currentSettings().volume}
                    min="0"
                    max="1"
                    step="0.1"
                    class="w-20"
                    onChange={(e) => handleSettingsChange("volume", parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Recognition Settings */}
            <div class="space-y-3">
              <Label>Recognition Settings</Label>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span>Confidence Threshold</span>
                  <Input
                    type="number"
                    value={currentSettings().confidenceThreshold}
                    min="0"
                    max="1"
                    step="0.1"
                    class="w-20"
                    onChange={(e) => handleSettingsChange("confidenceThreshold", parseFloat(e.target.value))}
                  />
                </div>
                <div class="flex justify-between">
                  <span>Silence Timeout (ms)</span>
                  <Input
                    type="number"
                    value={currentSettings().silenceTimeout}
                    min="500"
                    max="10000"
                    step="100"
                    class="w-20"
                    onChange={(e) => handleSettingsChange("silenceTimeout", parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Test Mode */}
          <Show when={testMode()}>
            <div class="mt-4 p-3 border rounded-lg bg-yellow-50">
              <Label class="text-yellow-800">Test Mode</Label>
              <div class="mt-2 space-y-2">
                <Input
                  placeholder="Enter test text..."
                  value={currentText()}
                  onInput={(e) => setCurrentText(e.target.value)}
                />
                <div class="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSpeak("This is a test of the speech synthesis system.")}
                  >
                    Test Speech
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddVoiceCommand("test command", "test_action", "system")}
                  >
                    Add Test Command
                  </Button>
                </div>
              </div>
            </div>
          </Show>
        </Card>
      </Show>

      {/* Error Display */}
      <Show when={currentMetrics().lastError}>
        <Alert class="mt-4 border-red-200 bg-red-50">
          <Icon name="alert-triangle" class="h-4 w-4 text-red-600" />
          <AlertDescription>
            Error: {currentMetrics().lastError}
          </AlertDescription>
        </Alert>
      </Show>

      {/* Performance Metrics (Test Mode) */}
      <Show when={testMode()}>
        <Card class="p-4 mt-4">
          <h4 class="font-semibold mb-4">Performance Metrics</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div class="text-gray-600">Total Recognitions</div>
              <div class="font-bold">{currentMetrics().totalRecognitions}</div>
            </div>
            <div>
              <div class="text-gray-600">Success Rate</div>
              <div class="font-bold">
                {currentMetrics().totalRecognitions > 0 
                  ? Math.round((currentMetrics().successfulRecognitions / currentMetrics().totalRecognitions) * 100)
                  : 0}%
              </div>
            </div>
            <div>
              <div class="text-gray-600">Avg Confidence</div>
              <div class="font-bold">{Math.round(currentMetrics().averageConfidence * 100)}%</div>
            </div>
            <div>
              <div class="text-gray-600">Error Count</div>
              <div class="font-bold">{currentMetrics().errorCount}</div>
            </div>
          </div>
        </Card>
      </Show>
    </div>
  )
}
