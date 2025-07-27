import app from "ags/gtk4/app"
import Astal from "gi://Astal?version=4.0"
import Gdk from "gi://Gdk?version=4.0"

import Clock from "../widgets/Clock"
import Mpris from "../widgets/Mpris"
import Tray from "../widgets/Tray"
import Wireless from "../widgets/Wireless"
import AudioOutput from "../widgets/AudioOutput"
import Battery from "../widgets/Battery"
import Niri from "../widgets/Niri"


export default function Bar({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

  return (
    <window
      visible
      name="bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <centerbox>
        <box $type="start">
          <Niri forMonitor={gdkmonitor} showInactiveIcons />
          <Clock />
          <Mpris />
        </box>
        <box $type="end">
          <Tray />
          <Wireless />
          <AudioOutput />
          <Battery />
        </box>
      </centerbox>
    </window>
  )
}
