import { App, Astal, Gdk, Gtk } from "astal/gtk3"
import DateTime from "../widgets/DateTime"
import Audio from "../widgets/Audio"
import Bluetooth from "../widgets/Bluetooth"
import Workspaces from "../widgets/Workspaces"
import Tray from "../widgets/Tray"
import Media from "../widgets/Media"

export default function Bar(monitor: Gdk.Monitor) {
  return <window
    className="Bar"
    gdkmonitor={monitor}
    exclusivity={Astal.Exclusivity.EXCLUSIVE}
    anchor={Astal.WindowAnchor.TOP
      | Astal.WindowAnchor.LEFT
      | Astal.WindowAnchor.RIGHT}
    application={App}>
    <centerbox>
      <box hexpand halign={Gtk.Align.START}>
        <Workspaces onlyForOutput={monitor.manufacturer}></Workspaces>
      </box>
      <box hexpand>
        <Media />
      </box>
      <box hexpand halign={Gtk.Align.END}>
        <Audio />
        <Bluetooth />
        <Tray />
        <DateTime />
      </box>
    </centerbox>
  </window>
}
