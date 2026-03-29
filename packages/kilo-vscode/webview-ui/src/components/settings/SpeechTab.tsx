import { Component, Show, createMemo, createSignal, onCleanup, onMount } from "solid-js"
import { Card } from "@kilocode/kilo-ui/card"
import { Input } from "@kilocode/kilo-ui/input"
import { Select } from "@kilocode/kilo-ui/select"
import { Switch } from "@kilocode/kilo-ui/switch"
import SettingsRow from "./SettingsRow"
import { useVSCode } from "../../context/vscode"
import type { ExtensionMessage } from "../../types/messages"
import { speechController, type SpeechSettings } from "../../utils/speech-controller"

type ProviderOption = { value: string; label: string }

const locationOptions: ProviderOption[] = [
  { value: "local", label: "Local" },
  { value: "cloud", label: "Cloud" },
]
const providerOptions: Record<string, ProviderOption[]> = {
  local: [
    { value: "browser", label: "Browser Web Speech" },
    { value: "openaiCompatible", label: "Custom OpenAI-compatible" },
  ],
  cloud: [
    { value: "azure", label: "Azure Speech" },
    { value: "openaiCompatible", label: "Custom OpenAI-compatible" },
  ],
}

const testVoiceSamples = {
  browser: "Speech test. Browser voice is active.",
  azure: "Speech test. Azure voice is active.",
  openaiCompatible: "Speech test. Custom speech provider is active.",
} as const

const SpeechTab: Component = () => {
  const vscode = useVSCode()
  const [enabled, setEnabled] = createSignal(true)
  const [autoSpeakAssistant, setAutoSpeakAssistant] = createSignal(false)
  const [location, setLocation] = createSignal<"local" | "cloud">("local")
  const [provider, setProvider] = createSignal<"browser" | "azure" | "openaiCompatible">("browser")
  const [browserVoice, setBrowserVoice] = createSignal("")
  const [browserLang, setBrowserLang] = createSignal("en-GB")
  const [browserRate, setBrowserRate] = createSignal("1")
  const [browserPitch, setBrowserPitch] = createSignal("1")
  const [azureRegion, setAzureRegion] = createSignal("westus")
  const [azureVoice, setAzureVoice] = createSignal("en-GB-MaisieNeural")
  const [azureFormat, setAzureFormat] = createSignal("audio-24khz-48kbitrate-mono-mp3")
  const [openaiBaseUrl, setOpenaiBaseUrl] = createSignal("http://127.0.0.1:8000/v1")
  const [openaiModel, setOpenaiModel] = createSignal("tts-1")
  const [openaiVoice, setOpenaiVoice] = createSignal("alloy")
  const [openaiFormat, setOpenaiFormat] = createSignal("mp3")
  const [azureKey, setAzureKey] = createSignal("")
  const [openaiKey, setOpenAIKey] = createSignal("")
  const [hasAzureKey, setHasAzureKey] = createSignal(false)
  const [hasOpenAIKey, setHasOpenAIKey] = createSignal(false)
  const [testText, setTestText] = createSignal("Hello from Kilo speech. This is a quick playback test.")

  const currentSettings = createMemo<SpeechSettings>(() => ({
    enabled: enabled(),
    autoSpeakAssistant: autoSpeakAssistant(),
    location: location(),
    provider: provider(),
    hasAzureKey: hasAzureKey(),
    hasOpenAICompatibleKey: hasOpenAIKey(),
    browserVoice: browserVoice(),
    browserLang: browserLang(),
    browserRate: Number(browserRate()) || 1,
    browserPitch: Number(browserPitch()) || 1,
    azureRegion: azureRegion(),
    azureVoice: azureVoice(),
    azureFormat: azureFormat(),
    openaiCompatibleBaseUrl: openaiBaseUrl(),
    openaiCompatibleModel: openaiModel(),
    openaiCompatibleVoice: openaiVoice(),
    openaiCompatibleResponseFormat: openaiFormat(),
  }))

  const refreshSpeechSettings = () => vscode.postMessage({ type: "requestSpeechSettings" })
  const unsubscribe = vscode.onMessage((message: ExtensionMessage) => {
    if (message.type !== "speechSettingsLoaded") return
    const s = message.settings
    setEnabled(s.enabled)
    setAutoSpeakAssistant(s.autoSpeakAssistant)
    setLocation(s.location)
    setProvider(s.provider)
    setBrowserVoice(s.browserVoice)
    setBrowserLang(s.browserLang)
    setBrowserRate(String(s.browserRate))
    setBrowserPitch(String(s.browserPitch))
    setAzureRegion(s.azureRegion)
    setAzureVoice(s.azureVoice)
    setAzureFormat(s.azureFormat)
    setOpenaiBaseUrl(s.openaiCompatibleBaseUrl)
    setOpenaiModel(s.openaiCompatibleModel)
    setOpenaiVoice(s.openaiCompatibleVoice)
    setOpenaiFormat(s.openaiCompatibleResponseFormat)
    setHasAzureKey(s.hasAzureKey)
    setHasOpenAIKey(s.hasOpenAICompatibleKey)
  })

  onMount(refreshSpeechSettings)
  onCleanup(() => {
    speechController.stop()
    unsubscribe()
  })

  const save = (key: string, value: unknown) => vscode.postMessage({ type: "updateSetting", key, value })
  const saveSecret = (secretKey: "azureApiKey" | "openaiCompatibleApiKey", value: string) => {
    vscode.postMessage({ type: "saveSpeechSecret", secretKey, value })
    setTimeout(refreshSpeechSettings, 50)
  }
  const clearSecret = (secretKey: "azureApiKey" | "openaiCompatibleApiKey") => {
    vscode.postMessage({ type: "clearSpeechSecret", secretKey })
    setTimeout(refreshSpeechSettings, 50)
  }
  const runTest = async () => {
    const sample = testText().trim() || testVoiceSamples[provider()]
    await speechController.speak(sample, currentSettings())
  }

  return <div>
    <Card>
      <SettingsRow title="Enable assistant speech" description="Adds speak and stop controls for assistant replies.">
        <Switch checked={enabled()} onChange={(checked) => { setEnabled(checked); save("speech.enabled", checked) }} hideLabel>Enable assistant speech</Switch>
      </SettingsRow>
      <SettingsRow title="Auto-speak completed replies" description="Automatically speak the latest completed assistant reply.">
        <Switch checked={autoSpeakAssistant()} onChange={(checked) => { setAutoSpeakAssistant(checked); save("speech.autoSpeakAssistant", checked) }} hideLabel>Auto-speak completed replies</Switch>
      </SettingsRow>
      <SettingsRow title="Location" description="Choose whether speech runs locally or through a cloud provider.">
        <Select options={locationOptions} current={locationOptions.find((o) => o.value === location())} value={(o) => o.value} label={(o) => o.label} onSelect={(o) => { if (!o) return; setLocation(o.value as any); save("speech.location", o.value); const next = providerOptions[o.value as "local" | "cloud"][0]?.value; if (next) { setProvider(next as any); save("speech.provider", next) } }} variant="secondary" size="small" triggerVariant="settings" />
      </SettingsRow>
      <SettingsRow title="Provider" description="Select the speech provider inside the chosen location group." last>
        <Select options={providerOptions[location()]} current={providerOptions[location()].find((o) => o.value === provider())} value={(o) => o.value} label={(o) => o.label} onSelect={(o) => { if (!o) return; setProvider(o.value as any); save("speech.provider", o.value) }} variant="secondary" size="small" triggerVariant="settings" />
      </SettingsRow>
    </Card>

    <Show when={provider() === "browser"}>
      <Card>
        <SettingsRow title="Browser voice name" description="Optional exact voice name from speechSynthesis.getVoices().">
          <Input value={browserVoice()} onInput={(e) => setBrowserVoice(e.currentTarget.value)} onBlur={() => save("speech.browserVoice", browserVoice())} />
        </SettingsRow>
        <SettingsRow title="Language" description="BCP-47 language tag for browser speech.">
          <Input value={browserLang()} onInput={(e) => setBrowserLang(e.currentTarget.value)} onBlur={() => save("speech.browserLang", browserLang())} />
        </SettingsRow>
        <SettingsRow title="Rate" description="Browser speech rate between 0.5 and 2.0.">
          <Input value={browserRate()} onInput={(e) => setBrowserRate(e.currentTarget.value)} onBlur={() => save("speech.browserRate", Number(browserRate()) || 1)} />
        </SettingsRow>
        <SettingsRow title="Pitch" description="Browser speech pitch between 0.0 and 2.0." last>
          <Input value={browserPitch()} onInput={(e) => setBrowserPitch(e.currentTarget.value)} onBlur={() => save("speech.browserPitch", Number(browserPitch()) || 1)} />
        </SettingsRow>
      </Card>
    </Show>

    <Show when={provider() === "azure"}>
      <Card>
        <SettingsRow title="Azure region" description="Matches your Azure Speech resource region, for example westus.">
          <Input value={azureRegion()} onInput={(e) => setAzureRegion(e.currentTarget.value)} onBlur={() => save("speech.azureRegion", azureRegion())} />
        </SettingsRow>
        <SettingsRow title="Azure voice" description="Default is en-GB-MaisieNeural.">
          <Input value={azureVoice()} onInput={(e) => setAzureVoice(e.currentTarget.value)} onBlur={() => save("speech.azureVoice", azureVoice())} />
        </SettingsRow>
        <SettingsRow title="Azure format" description="Output format used by Azure REST synthesis.">
          <Input value={azureFormat()} onInput={(e) => setAzureFormat(e.currentTarget.value)} onBlur={() => save("speech.azureFormat", azureFormat())} />
        </SettingsRow>
        <SettingsRow title="Azure API key" description={hasAzureKey() ? "A key is already stored securely in VS Code SecretStorage." : "Stored securely in VS Code SecretStorage."} last>
          <div style={{ display: "flex", gap: "8px", width: "100%" }}>
            <Input type="password" value={azureKey()} onInput={(e) => setAzureKey(e.currentTarget.value)} placeholder={hasAzureKey() ? "Saved" : "Paste Azure Speech key"} />
            <button class="button" onClick={() => { if (azureKey().trim()) saveSecret("azureApiKey", azureKey().trim()); setAzureKey("") }}>Save</button>
            <button class="button" onClick={() => clearSecret("azureApiKey")}>Clear</button>
          </div>
        </SettingsRow>
      </Card>
    </Show>

    <Show when={provider() === "openaiCompatible"}>
      <Card>
        <SettingsRow title="Base URL" description="Supports local or cloud OpenAI-compatible /audio/speech endpoints.">
          <Input value={openaiBaseUrl()} onInput={(e) => setOpenaiBaseUrl(e.currentTarget.value)} onBlur={() => save("speech.openaiCompatibleBaseUrl", openaiBaseUrl())} />
        </SettingsRow>
        <SettingsRow title="Model" description="Speech model name exposed by the endpoint.">
          <Input value={openaiModel()} onInput={(e) => setOpenaiModel(e.currentTarget.value)} onBlur={() => save("speech.openaiCompatibleModel", openaiModel())} />
        </SettingsRow>
        <SettingsRow title="Voice" description="Voice identifier exposed by the endpoint.">
          <Input value={openaiVoice()} onInput={(e) => setOpenaiVoice(e.currentTarget.value)} onBlur={() => save("speech.openaiCompatibleVoice", openaiVoice())} />
        </SettingsRow>
        <SettingsRow title="Response format" description="mp3 is the safest default.">
          <Input value={openaiFormat()} onInput={(e) => setOpenaiFormat(e.currentTarget.value)} onBlur={() => save("speech.openaiCompatibleResponseFormat", openaiFormat())} />
        </SettingsRow>
        <SettingsRow title="API key" description={hasOpenAIKey() ? "A key is already stored securely in VS Code SecretStorage." : "Optional. Stored securely in VS Code SecretStorage."} last>
          <div style={{ display: "flex", gap: "8px", width: "100%" }}>
            <Input type="password" value={openaiKey()} onInput={(e) => setOpenAIKey(e.currentTarget.value)} placeholder={hasOpenAIKey() ? "Saved" : "Optional bearer token"} />
            <button class="button" onClick={() => { saveSecret("openaiCompatibleApiKey", openaiKey().trim()); setOpenAIKey("") }}>Save</button>
            <button class="button" onClick={() => clearSecret("openaiCompatibleApiKey")}>Clear</button>
          </div>
        </SettingsRow>
      </Card>
    </Show>

    <Card>
      <SettingsRow title="Test text" description="Use this to verify the currently selected provider, voice, and output format.">
        <Input value={testText()} onInput={(e) => setTestText(e.currentTarget.value)} />
      </SettingsRow>
      <SettingsRow title="Live test" description="Runs a real speech request using the active provider and your current settings." last>
        <div style={{ display: "flex", gap: "8px", width: "100%", "justify-content": "flex-end", "flex-wrap": "wrap" }}>
          <button class="button" onClick={() => setTestText(testVoiceSamples[provider()])}>Use sample</button>
          <button class="button" onClick={() => void runTest()}>Test speech</button>
          <button class="button" onClick={() => speechController.stop()}>Stop</button>
        </div>
      </SettingsRow>
    </Card>
  </div>
}

export default SpeechTab
