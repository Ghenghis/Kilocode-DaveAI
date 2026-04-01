import { createSignal, createMemo, For, Show, type Accessor, type JSX } from "solid-js"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Tooltip, TooltipKeybind } from "@opencode-ai/ui/tooltip"
import { Badge } from "@opencode-ai/ui/badge"
import { Icon } from "@opencode-ai/ui/icon"
import { type LocalProject } from "@/context/layout"
import { useCommand } from "@/context/command"

export interface SidebarFeature {
  id: string
  name: string
  icon: string
  description: string
  enabled: boolean
  working: boolean
  category: "provider" | "tool" | "ui" | "integration"
  onClick: () => void
  badge?: string
  keybind?: string
}

export const EnhancedSidebarRail = (props: {
  mobile?: boolean
  opened: Accessor<boolean>
  projects: Accessor<LocalProject[]>
  renderProject: (project: LocalProject) => JSX.Element
  onOpenProject: () => void
  openProjectLabel: JSX.Element
  openProjectKeybind: Accessor<string | undefined>
  settingsLabel: Accessor<string>
  settingsKeybind: Accessor<string | undefined>
  onOpenSettings: () => void
  helpLabel: Accessor<string>
  onOpenHelp: () => void
  features: Accessor<SidebarFeature[]>
}) => {
  const command = useCommand()
  const [expandedFeature, setExpandedFeature] = createSignal<string | null>(null)
  
  const placement = () => (props.mobile ? "bottom" : "right")
  
  const getStatusColor = (feature: SidebarFeature) => {
    if (!feature.enabled) return "text-gray-400"
    if (feature.working) return "text-green-500"
    return "text-red-500"
  }
  
  const getStatusBadge = (feature: SidebarFeature) => {
    if (!feature.enabled) return null
    if (feature.working) return <Badge variant="default" class="w-2 h-2 bg-green-500" />
    return <Badge variant="destructive" class="w-2 h-2 bg-red-500" />
  }

  return (
    <div class="flex h-full w-full min-w-0 overflow-hidden">
      <div
        data-component="sidebar-rail"
        class="w-16 shrink-0 bg-background-base flex flex-col items-center overflow-hidden"
      >
        {/* Features Section */}
        <div class="flex-1 min-h-0 w-full flex flex-col">
          {/* AI Providers */}
          <div class="px-3 py-2 border-b border-border-weak-base">
            <div class="text-xs text-text-weak font-medium mb-2">AI</div>
            <div class="flex flex-col items-center gap-2">
              <For each={props.features().filter(f => f.category === "provider")}>
                {(feature) => (
                  <Tooltip
                    placement={placement()}
                    value={
                      <div class="flex items-center gap-2">
                        <span>{feature.name}</span>
                        <Show when={feature.badge}>
                          <Badge variant="outline" class="text-xs">{feature.badge}</Badge>
                        </Show>
                      </div>
                    }
                  >
                    <div class="relative">
                      <IconButton
                        icon={feature.icon}
                        variant="ghost"
                        size="large"
                        onClick={feature.onClick}
                        class={getStatusColor(feature)}
                        aria-label={feature.name}
                      />
                      <div class="absolute -top-1 -right-1">
                        {getStatusBadge(feature)}
                      </div>
                    </div>
                  </Tooltip>
                )}
              </For>
            </div>
          </div>

          {/* Tools */}
          <div class="px-3 py-2 border-b border-border-weak-base">
            <div class="text-xs text-text-weak font-medium mb-2">Tools</div>
            <div class="flex flex-col items-center gap-2">
              <For each={props.features().filter(f => f.category === "tool")}>
                {(feature) => (
                  <Tooltip
                    placement={placement()}
                    value={
                      <div class="flex items-center gap-2">
                        <span>{feature.name}</span>
                        <Show when={feature.keybind}>
                          <span class="text-icon-base text-12-medium">{feature.keybind}</span>
                        </Show>
                      </div>
                    }
                  >
                    <div class="relative">
                      <IconButton
                        icon={feature.icon}
                        variant="ghost"
                        size="large"
                        onClick={feature.onClick}
                        class={getStatusColor(feature)}
                        aria-label={feature.name}
                      />
                      <div class="absolute -top-1 -right-1">
                        {getStatusBadge(feature)}
                      </div>
                    </div>
                  </Tooltip>
                )}
              </For>
            </div>
          </div>

          {/* Projects */}
          <div class="flex-1 min-h-0 w-full">
            <div class="px-3 py-2">
              <div class="text-xs text-text-weak font-medium mb-2">Projects</div>
              <div class="flex flex-col items-center gap-2 overflow-y-auto no-scrollbar">
                <For each={props.projects()}>
                  {(project) => props.renderProject(project)}
                </For>
                <Tooltip
                  placement={placement()}
                  value={
                    <div class="flex items-center gap-2">
                      <span>{props.openProjectLabel}</span>
                      <Show when={!props.mobile && !!props.openProjectKeybind()}>
                        <span class="text-icon-base text-12-medium">{props.openProjectKeybind()}</span>
                      </Show>
                    </div>
                  }
                >
                  <IconButton
                    icon="plus"
                    variant="ghost"
                    size="large"
                    onClick={props.onOpenProject}
                    aria-label={typeof props.openProjectLabel === "string" ? props.openProjectLabel : undefined}
                  />
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div class="shrink-0 w-full pt-3 pb-6 flex flex-col items-center gap-2">
          {/* Terminal */}
          <TooltipKeybind placement={placement()} title="Terminal" keybind={command.keybind("terminal.toggle") || ""}>
            <IconButton
              icon="terminal"
              variant="ghost"
              size="large"
              onClick={() => command.run("terminal.toggle")}
              aria-label="Terminal"
            />
          </TooltipKeybind>

          {/* Prompt Composer */}
          <TooltipKeybind placement={placement()} title="Prompt Composer" keybind={command.keybind("prompt.composer") || ""}>
            <IconButton
              icon="edit"
              variant="ghost"
              size="large"
              onClick={() => command.run("prompt.composer")}
              aria-label="Prompt Composer"
            />
          </TooltipKeybind>

          {/* Context Manager */}
          <TooltipKeybind placement={placement()} title="Context Manager" keybind={command.keybind("context.manager") || ""}>
            <IconButton
              icon="layers"
              variant="ghost"
              size="large"
              onClick={() => command.run("context.manager")}
              aria-label="Context Manager"
            />
          </TooltipKeybind>

          {/* Settings */}
          <TooltipKeybind placement={placement()} title={props.settingsLabel()} keybind={props.settingsKeybind() ?? ""}>
            <IconButton
              icon="settings-gear"
              variant="ghost"
              size="large"
              onClick={props.onOpenSettings}
              aria-label={props.settingsLabel()}
            />
          </TooltipKeybind>

          {/* Help */}
          <Tooltip placement={placement()} value={props.helpLabel()}>
            <IconButton
              icon="help"
              variant="ghost"
              size="large"
              onClick={props.onOpenHelp}
              aria-label={props.helpLabel()}
            />
          </Tooltip>
        </div>
      </div>

      {/* Panel Content */}
      <div class="flex h-full min-h-0 min-w-0 overflow-hidden">
        {/* This would be the panel content */}
      </div>
    </div>
  )
}
