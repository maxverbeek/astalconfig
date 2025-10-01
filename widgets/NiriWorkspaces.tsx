import Gdk from "gi://Gdk?version=4.0"
import Niri, { OutputsWithWorkspacesWithWindows, Window, WorkspaceWithWindows } from "../services/niri"
import Gtk from "gi://Gtk?version=4.0"
import { Accessor, createBinding, createComputed, For } from "ags"

const niri = Niri.get_default()

function guessAppIcon(window: Window, display: Gdk.Display) {
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

  if (Gtk.IconTheme.get_for_display(display).has_icon(window.app_id)) {
    return window.app_id
  }

  if (Gtk.IconTheme.get_for_display(display).has_icon(window.app_id.toLowerCase())) {
    return window.app_id.toLowerCase()
  }

  // default custom icon from lucide
  return 'circle-dashed'
}

function Workspace(workspace: WorkspaceWithWindows, showInactiveIcons: boolean, monitor: Gdk.Monitor) {
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
      {showIcons && workspace.windows.map(win => <image iconName={guessAppIcon(win, monitor.display)} />)}
    </box>
  </button>
}

export type WorkspacesProps = {
  forMonitor: Gdk.Monitor
  showInactiveIcons?: boolean
}

function getMonitorName(gdkmonitor: Gdk.Monitor) {
  return gdkmonitor.connector
  // const display = Gdk.Display.get_default()!;
  // const screen = display.get_default_screen();
  // for (let i = 0; i < display.get_n_monitors(); ++i) {
  //   if (gdkmonitor === display.get_monitor(i))
  //     return screen.get_monitor_plug_name(i);
  // }
}

export default function Workspaces({ forMonitor, showInactiveIcons = false }: WorkspacesProps) {
  // hacky way to get the connector name (e.g. DP-2)
  const monitorName = getMonitorName(forMonitor)!

  const filterWorkspacesForMonitor = (outputs: OutputsWithWorkspacesWithWindows, name: string) => {
    return Object.values(outputs)
      .filter(o => o.monitor?.name === name)
      .flatMap(o => Object.values(o.workspaces))
      .sort((a, b) => a.idx - b.idx)
  }

  // The two binds with a derived variable are because I noticed that when turning montors off and on, the manufacturer
  // field was not set. I thought this would emit a signal when it is set afterwards (hence the binds) but that doesn't
  // happen. I've added a setTimeout workaround in app.ts. Because of this workaround I technically don't need the
  // bind(forMonitor, 'manufacturer') statement, but I left it in here to remind myself how this works xD
  const outputs = createBinding(niri, 'outputs') as Accessor<OutputsWithWorkspacesWithWindows>

  const workspacesForMe = createComputed((get) => filterWorkspacesForMonitor(get(outputs), monitorName))
  /* const workspacesForMe = Variable.derive([outputs, monitorMake], filterWorkspacesForMonitor) */

  return <box class="Workspaces">
    <For each={workspacesForMe}>
      {w => Workspace(w, showInactiveIcons, forMonitor)}
    </For>
  </box>
}
