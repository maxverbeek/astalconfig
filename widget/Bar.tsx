import { App, Variable, Astal, Gtk, bind, Gdk } from "astal"
import Niri, { Window } from "../service/niri"

const niri = new Niri()
const time = Variable<string>("").poll(1000, "date")

function appnames(windows: Window[]) {
  return windows.map(w => w.title?.endsWith('NVIM') ? 'neovim BTW' : w.app_id).join(', ')
}

// bruh
const manufacturer2output: Record<string, string> = {
  'Dell Inc.': 'DP-3',
  'PNP(AOC)': 'DP-2'
}

function Workspaces({ onlyForOutput }: { onlyForOutput: string }) {
  const nirioutput = manufacturer2output[onlyForOutput]

  if (!nirioutput) {
    console.error(`couldn't find output for model ${onlyForOutput}`)
    return <box>no output</box>
  }

  return <box>
    {bind(niri, 'outputs')
      .as(os => Object.values(os).filter(os => os.output === nirioutput).flatMap((o) => Object.values(o.workspaces))
        .map(ws => {
          const text = ws.is_active ? `${ws.idx} (${appnames(ws.windows)})` : `${ws.idx}`
          return <button>{text}</button>
        }))}
  </box>
}

export default function Bar(monitor: Gdk.Monitor) {
  return <window
    className="Bar"
    gdkmonitor={monitor}
    exclusivity={Astal.Exclusivity.EXCLUSIVE}
    anchor={Astal.WindowAnchor.TOP
      | Astal.WindowAnchor.LEFT
      | Astal.WindowAnchor.RIGHT}
    application={App}>
    <box>
      <Workspaces onlyForOutput={monitor.manufacturer}></Workspaces>
    </box>
  </window>
}
