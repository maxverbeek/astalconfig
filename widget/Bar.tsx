import { Gdk } from "ags/gtk4"
import { qs_page_set, QuickSettingsModule } from "@/modules/quicksettings/quicksettings"
import NiriWorkspaces from "./NiriWorkspaces"
import Clock from "./Clock"
import QuicksettingsBarButton, { batteryFlashClass } from "@/modules/quicksettings/barbutton"
import { theme } from "@/lib/constants"
import { createComputed } from "gnim"

type BarProps = {
  gdkmonitor: Gdk.Monitor
}

export default function Bar({ gdkmonitor }: BarProps) {
  const menuClass = createComputed(() => `bar-item ${batteryFlashClass()}`)

  return (
    <centerbox height_request={theme.bar.height} cssName="centerbox" class="bar">
      <NiriWorkspaces $type="start" gdkmonitor={gdkmonitor} />
      <box $type="end" spacing={theme.bar.spacing}>
        <menubutton class={menuClass}>
          <QuicksettingsBarButton />
          <popover class="quicksettings" autohide={true} onClosed={() => qs_page_set("main")}>
            <QuickSettingsModule />
          </popover>
        </menubutton>
        <Clock />
      </box>
    </centerbox>
  )
}
