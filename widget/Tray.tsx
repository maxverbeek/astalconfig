import { Gtk } from "ags/gtk4"
import AstalTray from "gi://AstalTray?version=0.1"
import { createBinding, For } from "gnim"
import BarItem from "./BarItem"
import { theme } from "@/lib/constants"

export default function Tray() {
  const tray = AstalTray.get_default()
  const items = createBinding(tray, "items")

  const init = (btn: Gtk.MenuButton, item: AstalTray.TrayItem) => {
    btn.menuModel = item.menuModel
    btn.insert_action_group("dbusmenu", item.actionGroup)
    item.connect("notify::action-group", () => {
      btn.insert_action_group("dbusmenu", item.actionGroup)
    })
  }

  return (
    <BarItem class="bar-item no-hover">
      <box spacing={theme.bar.spacing}>
        <For each={items}>
          {(item) => (
            <menubutton class="tray-button" $={(self) => init(self, item)}>
              <image gicon={createBinding(item, "gicon")} />
            </menubutton>
          )}
        </For>
      </box>
    </BarItem>
  )
}
