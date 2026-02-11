import { Gdk } from "ags/gtk4"
import { qs_page_set, QuickSettingsModule } from "@/modules/quicksettings/quicksettings"
import NiriWorkspaces from "./NiriWorkspaces"
import Clock from "./Clock"
import QuicksettingsBarButton, { batteryFlashClass } from "@/modules/quicksettings/barbutton"
import { theme } from "@/lib/constants"
import { createComputed, createState } from "gnim"
import Tray from "./Tray"
import KubernetesContext from "./KubernetesContext"

type BarProps = {
  gdkmonitor: Gdk.Monitor
}

export default function Bar({ gdkmonitor }: BarProps) {
  const menuClass = createComputed(() => `bar-item ${batteryFlashClass()}`)
  const [qsopened, setQsOpened] = createState(false)

  return (
    <centerbox height_request={theme.bar.height} cssName="centerbox" class="bar">
      <NiriWorkspaces $type="start" gdkmonitor={gdkmonitor} />
      <box $type="end" spacing={theme.bar.spacing}>
        <KubernetesContext />
        <menubutton class={menuClass}>
          <QuicksettingsBarButton opened={qsopened} />
          <popover
            class="quicksettings"
            autohide={true}
            onClosed={() => {
              qs_page_set("main")
              setQsOpened(false)
            }}
            onShow={() => setQsOpened(true)}
          >
            <QuickSettingsModule />
          </popover>
        </menubutton>
        <Tray />
        <Clock />
      </box>
    </centerbox>
  )
}
