import { createEffect, createMemo, For, Show, type Accessor, type JSX } from "solid-js"
import {
  DragDropProvider,
  DragDropSensors,
  DragOverlay,
  SortableProvider,
  closestCenter,
  type DragEvent,
} from "@thisbeyond/solid-dnd"
import { ConstrainDragXAxis } from "@/utils/solid-dnd"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Tooltip, TooltipKeybind } from "@opencode-ai/ui/tooltip"
import { Badge } from "@opencode-ai/ui/badge"
import { type LocalProject } from "@/context/layout"
import { sidebarExpanded } from "./sidebar-shell-helpers"

// Feature status for sidebar indicators
const sidebarFeatures = [
  { id: "openai", name: "OpenAI", icon: "bot", status: "disconnected", category: "provider" },
  { id: "anthropic", name: "Anthropic", icon: "bot", status: "disconnected", category: "provider" },
  { id: "openrouter", name: "OpenRouter", icon: "bot", status: "disconnected", category: "provider" },
  { id: "openhands", name: "OpenHands", icon: "bot", status: "disconnected", category: "provider" },
  { id: "terminal", name: "Terminal", icon: "terminal", status: "missing", category: "tool" },
  { id: "prompt-composer", name: "Prompt Composer", icon: "edit", status: "missing", category: "tool" },
  { id: "context-manager", name: "Context Manager", icon: "layers", status: "missing", category: "tool" },
  { id: "browser-automation", name: "Browser Automation", icon: "globe", status: "missing", category: "tool" },
  { id: "git-operations", name: "Git Operations", icon: "git-branch", status: "working", category: "tool" },
  { id: "agent-manager", name: "Agent Manager", icon: "users", status: "missing", category: "tool" }
]

export const SidebarContent = (props: {
  mobile?: boolean
  opened: Accessor<boolean>
  aimMove: (event: MouseEvent) => void
  projects: Accessor<LocalProject[]>
  renderProject: (project: LocalProject) => JSX.Element
  handleDragStart: (event: unknown) => void
  handleDragEnd: () => void
  handleDragOver: (event: DragEvent) => void
  openProjectLabel: JSX.Element
  openProjectKeybind: Accessor<string | undefined>
  onOpenProject: () => void
  renderProjectOverlay: () => JSX.Element
  settingsLabel: Accessor<string>
  settingsKeybind: Accessor<string | undefined>
  onOpenSettings: () => void
  helpLabel: Accessor<string>
  onOpenHelp: () => void
  renderPanel: () => JSX.Element
}): JSX.Element => {
  const expanded = createMemo(() => sidebarExpanded(props.mobile, props.opened()))
  const placement = () => (props.mobile ? "bottom" : "right")
  let panel: HTMLDivElement | undefined

  createEffect(() => {
    const el = panel
    if (!el) return
    if (expanded()) {
      el.removeAttribute("inert")
      return
    }
    el.setAttribute("inert", "")
  })

  return (
    <div class="flex h-full w-full min-w-0 overflow-hidden">
      <div
        data-component="sidebar-rail"
        class="w-16 shrink-0 bg-background-base flex flex-col items-center overflow-hidden"
        onMouseMove={props.aimMove}
      >
        <div class="flex-1 min-h-0 w-full flex flex-col">
          {/* AI Providers Section */}
          <div class="px-3 py-2 border-b border-border-weak-base">
            <div class="text-xs text-text-weak font-medium mb-2">AI</div>
            <div class="flex flex-col items-center gap-2">
              <For each={sidebarFeatures.filter(f => f.category === "provider")}>
                {(feature) => (
                  <Tooltip
                    placement={placement()}
                    value={
                      <div class="flex items-center gap-2">
                        <span>{feature.name}</span>
                        <div class={`w-2 h-2 rounded-full ${
                          feature.status === "working" ? "bg-green-500" : 
                          feature.status === "disconnected" ? "bg-red-500" : "bg-gray-500"
                        }`} />
                      </div>
                    }
                  >
                    <div class="relative">
                      <IconButton
                        icon={feature.icon}
                        variant="ghost"
                        size="large"
                        aria-label={feature.name}
                        class={
                          feature.status === "working" ? "text-green-500" : 
                          feature.status === "disconnected" ? "text-red-500" : "text-gray-500"
                        }
                      />
                      <div class="absolute -top-1 -right-1">
                        <div class={`w-2 h-2 rounded-full ${
                          feature.status === "working" ? "bg-green-500" : 
                          feature.status === "disconnected" ? "bg-red-500" : "bg-gray-500"
                        }`} />
                      </div>
                    </div>
                  </Tooltip>
                )}
              </For>
            </div>
          </div>

          {/* Tools Section */}
          <div class="px-3 py-2 border-b border-border-weak-base">
            <div class="text-xs text-text-weak font-medium mb-2">Tools</div>
            <div class="flex flex-col items-center gap-2">
              <For each={sidebarFeatures.filter(f => f.category === "tool")}>
                {(feature) => (
                  <Tooltip
                    placement={placement()}
                    value={
                      <div class="flex items-center gap-2">
                        <span>{feature.name}</span>
                        <div class={`w-2 h-2 rounded-full ${
                          feature.status === "working" ? "bg-green-500" : 
                          feature.status === "missing" ? "bg-orange-500" : "bg-gray-500"
                        }`} />
                      </div>
                    }
                  >
                    <div class="relative">
                      <IconButton
                        icon={feature.icon}
                        variant="ghost"
                        size="large"
                        aria-label={feature.name}
                        class={
                          feature.status === "working" ? "text-green-500" : 
                          feature.status === "missing" ? "text-orange-500" : "text-gray-500"
                        }
                      />
                      <div class="absolute -top-1 -right-1">
                        <div class={`w-2 h-2 rounded-full ${
                          feature.status === "working" ? "bg-green-500" : 
                          feature.status === "missing" ? "bg-orange-500" : "bg-gray-500"
                        }`} />
                      </div>
                    </div>
                  </Tooltip>
                )}
              </For>
            </div>
          </div>

          {/* Projects Section */}
          <div class="flex-1 min-h-0 w-full">
            <DragDropProvider
              onDragStart={props.handleDragStart}
              onDragEnd={props.handleDragEnd}
              onDragOver={props.handleDragOver}
              collisionDetector={closestCenter}
            >
              <DragDropSensors />
              <ConstrainDragXAxis />
              <div class="h-full w-full flex flex-col items-center gap-3 px-3 py-3 overflow-y-auto no-scrollbar">
                <SortableProvider ids={props.projects().map((p) => p.worktree)}>
                  <For each={props.projects()}>{(project) => props.renderProject(project)}</For>
                </SortableProvider>
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
              <DragOverlay>{props.renderProjectOverlay()}</DragOverlay>
            </DragDropProvider>
          </div>
        </div>
        <div class="shrink-0 w-full pt-3 pb-6 flex flex-col items-center gap-2">
          <TooltipKeybind placement={placement()} title={props.settingsLabel()} keybind={props.settingsKeybind() ?? ""}>
            <IconButton
              icon="settings-gear"
              variant="ghost"
              size="large"
              onClick={props.onOpenSettings}
              aria-label={props.settingsLabel()}
            />
          </TooltipKeybind>
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

      <div
        ref={(el) => {
          panel = el
        }}
        classList={{ "flex h-full min-h-0 min-w-0 overflow-hidden": true, "pointer-events-none": !expanded() }}
        aria-hidden={!expanded()}
      >
        {props.renderPanel()}
      </div>
    </div>
  )
}
