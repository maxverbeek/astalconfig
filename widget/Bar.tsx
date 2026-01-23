import { Gtk, Gdk } from "ags/gtk4"
import { createPoll } from "ags/time"
import { QuickSettingsModule } from "@/modules/quicksettings/quicksettings"
import NiriWorkspaces from "./NiriWorkspaces"

type BarProps = {
  gdkmonitor: Gdk.Monitor
}

export default function Bar({ gdkmonitor }: BarProps) {
  const time = createPoll("", 1000, "date")

  return (
    <centerbox cssName="centerbox">
      <NiriWorkspaces $type="start" gdkmonitor={gdkmonitor} />
      <box $type="center" />
      <box $type="end">
        <menubutton>
          <label label="quicksettings" />
          <popover class="quicksettings" autohide={false}>
            <QuickSettingsModule />
          </popover>
        </menubutton>
        <menubutton hexpand halign={Gtk.Align.CENTER}>
          <label label={time} />
          <popover>
            <Gtk.Calendar />
          </popover>
        </menubutton>
      </box>
    </centerbox>
  )
}
