import app from "ags/gtk4/app"
import Astal from "gi://Astal?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import { onCleanup } from "ags"
import Wireless from "../widgets/Wireless"
import AudioOutput from "../widgets/AudioOutput"
import Battery from "../widgets/Battery"
import Tray from "../widgets/Tray"
import Clock from "../widgets/Clock"
import NiriWorkspaces from "../widgets/NiriWorkspaces"

export default function Bar({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  let win: Astal.Window
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

  onCleanup(() => {
    // Root components (windows) are not automatically destroyed.
    // When the monitor is disconnected from the system, this callback
    // is run from the parent <For> which allows us to destroy the window
    win.destroy()
  })

  return (
    <window
      $={(self) => (win = self)}
      visible
      namespace="my-bar"
      name={`bar-${gdkmonitor.connector}`}
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <centerbox>
        <box $type="start">
          <NiriWorkspaces showInactiveIcons forMonitor={gdkmonitor} />
        </box>
        <box $type="end">
          <Wireless />
          <AudioOutput />
          <Battery />
          <Tray />
          <Clock />
        </box>
      </centerbox>
    </window>
  )
}
