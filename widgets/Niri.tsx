import Gdk from "gi://Gdk?version=4.0"
import Niri, { OutputsWithWorkspacesWithWindows, Window, WorkspaceWithWindows } from "../services/niri"
import { Accessor, createBinding, For } from "ags"
import Gtk from "gi://Gtk?version=4.0"

const niri = Niri.get_default()

// whenever we notice that monitors appear/disappear, make a query to niri to repopulate the monitor information. Niri
// does not recieve this over its eventbus. Moreover, niri does not get manufacturer names over the event stream. This
// only happens when you query for outputs explicitly which is what is triggered here.

function guessAppIcon(window: Window, iconTheme: Gtk.IconTheme) {
  if (window.title?.endsWith('Nvim')) {
    return 'neovim'
  }

  // Nvim runs in foot, but nvim is checked first
  if (window.app_id === 'foot') {
    return 'foot'
  }

  if (window.app_id === '' && window.title?.includes('Spotify')) {
    return 'spotify'
  }

  if (window.app_id === 'zen-alpha') {
    return 'zen-browser'
  }

  if (window.app_id === 'chromium-browser') {
    return 'chromium'
  }

  if (window.app_id === '1Password') {
    return '1password'
  }

  if (window.app_id === 'Slack') {
    return 'slack'
  }

  if (iconTheme.has_icon(window.app_id)) {
    return window.app_id
  }

  // default custom icon from lucide
  return 'circle-dashed'
}

function Workspace(workspace: WorkspaceWithWindows, showInactiveIcons: boolean, iconTheme: Gtk.IconTheme) {
  const traits = ['workspace']
  if (workspace.is_active) {
    traits.push('active')
  }

  if (workspace.windows.length > 0) {
    traits.push('populated')
  }

  const className = traits.join(' ')
  const showIcons = (workspace.is_active || showInactiveIcons) && workspace.windows.length > 0

  return <button onClicked={() => niri.focusWorkspaceId(workspace.id)} class={className}>
    <box spacing={showIcons ? 5 : 0}>
      <label class="ws-idx" label={workspace.idx.toString()} />
      {showIcons && workspace.windows.map(win => <image iconName={guessAppIcon(win, iconTheme)} />)}
    </box>
  </button>
}

export type WorkspacesProps = {
  forMonitor: Gdk.Monitor
  showInactiveIcons?: boolean
}

export default function Workspaces({ forMonitor, showInactiveIcons = false }: WorkspacesProps) {
  const filterWorkspacesForMonitor = (outputs: OutputsWithWorkspacesWithWindows, name: string) => {
    return Object.values(outputs)
      .filter(o => o.monitor?.name === name)
      .flatMap(o => Object.values(o.workspaces))
      .sort((a, b) => a.idx - b.idx)
  }

  const iconTheme = Gtk.IconTheme.get_for_display(forMonitor.display)

  const outputs = createBinding(niri, 'outputs') as Accessor<OutputsWithWorkspacesWithWindows>
  const workspacesForMe = outputs.as(os => filterWorkspacesForMonitor(os, forMonitor.connector))

  return <box class="Workspaces">
    <For each={workspacesForMe}>
      {(workspace) => Workspace(workspace, showInactiveIcons, iconTheme)}
    </For>
  </box>
}
