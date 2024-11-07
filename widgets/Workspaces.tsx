import { App, Gdk, astalify } from "astal/gtk3"
import { Variable, bind } from "astal"
import Niri, { OutputsWithWorkspacesWithWindows, Window, WorkspaceWithWindows } from "../service/niri"

const niri = new Niri()

// whenever we notice that monitors appear/disappear, make a query to niri to repopulate the monitor information. Niri
// does not recieve this over its eventbus. Moreover, niri does not get manufacturer names over the event stream. This
// only happens when you query for outputs explicitly which is what is triggered here.
App.connect('monitor-added', () => niri.reloadMonitors())
App.connect('monitor-removed', () => niri.reloadMonitors())

function guessAppIcon(window: Window) {
  if (window.title?.endsWith('NVIM')) {
    return 'neovim'
  }

  // Nvim runs in foot, but nvim is checked first
  if (window.app_id === 'foot') {
    return 'foot'
  }

  if (window.app_id === '' && window.title?.includes('Spotify')) {
    return 'spotify'
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

  // default custom icon from lucide
  return 'circle-dashed'
}

function Workspace(workspace: WorkspaceWithWindows) {
  console.log(`drawing workspace ${workspace.output} ${workspace.idx}`)
  const traits = []
  if (workspace.is_active) {
    traits.push('active')
  }

  if (workspace.windows.length > 0) {
    traits.push('populated')
  }

  const className = traits.join(' ')

  if (!workspace.is_active) {
    return <button className={className}>{workspace.idx}</button>
  }

  return <button className={className}>
    <box spacing={5}>
      <label className="ws-idx" label={workspace.idx.toString()} />
      {workspace.windows.map(win => <icon icon={guessAppIcon(win)} />)}
    </box>
  </button>
}

export default function Workspaces({ forMonitor }: { forMonitor: Gdk.Monitor }) {
  const filterWorkspacesForMonitor = (outputs: OutputsWithWorkspacesWithWindows, monitorMake: string) => {
    return Object.values(outputs)
      .filter(o => o.monitor?.make === monitorMake)
      .flatMap(o => Object.values(o.workspaces))
  }

  // The two binds with a derived variable are because I noticed that when turning montors off and on, the manufacturer
  // field was not set. I thought this would emit a signal when it is set afterwards (hence the binds) but that doesn't
  // happen. I've added a setTimeout workaround in app.ts. Because of this workaround I technically don't need the
  // bind(forMonitor, 'manufacturer') statement, but I left it in here to remind myself how this works xD
  const outputs = bind(niri, 'outputs')
  const monitorMake = bind(forMonitor, 'manufacturer')

  const workspacesForMe = Variable.derive([outputs, monitorMake], filterWorkspacesForMonitor)

  return <box className="Workspaces">
    {workspacesForMe(ws => ws.map(Workspace))}
  </box>
}
