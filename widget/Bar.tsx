import { App, Variable, Astal, Gtk, bind } from "astal"
import Niri, { Window } from "../service/niri"

const niri = new Niri()
const time = Variable<string>("").poll(1000, "date")

function appnames(windows: Window[]) {
  return windows.map(w => w.title?.endsWith('NVIM') ? 'neovim BTW' : w.app_id).join(', ')
}

function Workspaces() {
  return <box>
    {bind(niri, 'outputs')
      .as(os => Object.values(os).flatMap((o) => Object.values(o.workspaces))
        .map(ws => {
          const text = ws.is_active ? `${ws.idx} (${appnames(ws.windows)})` : `${ws.idx}`
          return <button>{text}</button>
        }))}
  </box>
}

export default function Bar(monitor: number) {
  return <window
    className="Bar"
    monitor={monitor}
    exclusivity={Astal.Exclusivity.EXCLUSIVE}
    anchor={Astal.WindowAnchor.TOP
      | Astal.WindowAnchor.LEFT
      | Astal.WindowAnchor.RIGHT}
    application={App}>
    <Workspaces></Workspaces>
  </window>
}
