import { bind } from "astal"
import Niri, { Window } from "../service/niri"

const niri = new Niri()

function appnames(windows: Window[]) {
  return windows.map(w => w.title?.endsWith('NVIM') ? 'neovim BTW' : w.app_id).join(', ')
}

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

// bruh
const manufacturer2output: Record<string, string> = {
  'Dell Inc.': 'DP-3',
  'PNP(AOC)': 'DP-2'
}

export default function Workspaces({ onlyForOutput }: { onlyForOutput: string }) {
  const nirioutput = manufacturer2output[onlyForOutput]

  if (!nirioutput) {
    console.error(`couldn't find output for model ${onlyForOutput}`)
    return <box>no output</box>
  }

  return <box className="Workspaces">
    {bind(niri, 'outputs')
      .as(os => Object.values(os).filter(os => os.output === nirioutput).flatMap((o) => Object.values(o.workspaces))
        .map(ws => {
          const traits = []
          if (ws.is_active) {
            traits.push('active')
          }

          if (ws.windows.length > 0) {
            traits.push('populated')
          }

          const className = traits.join(' ')

          if (!ws.is_active) {
            return <button className={className}>{ws.idx}</button>
          }

          return <button className={className}>
            <box spacing={5}>
              <label className="ws-idx" label={ws.idx.toString()} />
              {ws.windows.map(win => <icon icon={guessAppIcon(win)} />)}
            </box>
          </button>
        }))}
  </box>
}
