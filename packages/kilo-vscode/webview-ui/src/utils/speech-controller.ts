import { getVSCodeAPI } from "../context/vscode"

export type SpeechProvider = "browser" | "azure" | "openaiCompatible"
export type SpeechSettings = {
  enabled: boolean
  autoSpeakAssistant: boolean
  location: "local" | "cloud"
  provider: SpeechProvider
  hasAzureKey: boolean
  hasOpenAICompatibleKey: boolean
  browserVoice: string
  browserLang: string
  browserRate: number
  browserPitch: number
  azureRegion: string
  azureVoice: string
  azureFormat: string
  openaiCompatibleBaseUrl: string
  openaiCompatibleModel: string
  openaiCompatibleVoice: string
  openaiCompatibleResponseFormat: string
}

class SpeechController {
  private audio?: HTMLAudioElement
  private currentRequestId?: string
  private pendingListener?: (event: MessageEvent) => void
  private currentAudioUrl?: string

  stop() {
    window.speechSynthesis?.cancel()
    if (this.pendingListener) {
      window.removeEventListener("message", this.pendingListener)
      this.pendingListener = undefined
    }
    if (this.audio) {
      this.audio.pause()
      this.audio.src = ""
      this.audio = undefined
    }
    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl)
      this.currentAudioUrl = undefined
    }
    this.currentRequestId = undefined
  }

  async speak(text: string, settings: SpeechSettings) {
    const clean = text
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\s+/g, " ")
      .trim()
    if (!settings.enabled || !clean) return
    this.stop()
    if (settings.provider === "browser") {
      const utterance = new SpeechSynthesisUtterance(clean)
      utterance.lang = settings.browserLang || "en-GB"
      utterance.rate = settings.browserRate || 1
      utterance.pitch = settings.browserPitch || 1
      const voices = window.speechSynthesis?.getVoices?.() ?? []
      const voice =
        voices.find((v) => v.name === settings.browserVoice) ?? voices.find((v) => v.lang === utterance.lang)
      if (voice) utterance.voice = voice
      window.speechSynthesis?.speak(utterance)
      return
    }

    const requestId = crypto.randomUUID()
    this.currentRequestId = requestId
    const api = getVSCodeAPI()
    const playFromChunk = (event: MessageEvent) => {
      const message = event.data as any
      if (message?.type === "speechError" && (!message.requestId || message.requestId === requestId)) {
        window.removeEventListener("message", playFromChunk)
        if (this.pendingListener === playFromChunk) this.pendingListener = undefined
        if (this.currentRequestId === requestId) this.currentRequestId = undefined
        console.error("[Kilo TTS]", message.error)
        return
      }
      if (message?.type !== "speechAudioChunk" || message.requestId !== requestId) return
      window.removeEventListener("message", playFromChunk)
      if (this.pendingListener === playFromChunk) this.pendingListener = undefined
      if (this.currentRequestId !== requestId) return
      this.currentRequestId = undefined
      const blob = this.base64ToBlob(message.data, message.mimeType)
      const url = URL.createObjectURL(blob)
      this.currentAudioUrl = url
      this.audio = new Audio(url)
      this.audio.onended = () => {
        if (this.currentAudioUrl === url) this.currentAudioUrl = undefined
        URL.revokeObjectURL(url)
        this.audio = undefined
      }
      this.audio.play().catch((error) => console.error("[Kilo TTS] play failed", error))
    }
    this.pendingListener = playFromChunk
    window.addEventListener("message", playFromChunk)
    api.postMessage({ type: "synthesizeSpeech", requestId, provider: settings.provider, text: clean } as any)
  }

  private base64ToBlob(base64: string, mimeType: string) {
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
    return new Blob([bytes], { type: mimeType })
  }
}

export const speechController = new SpeechController()
