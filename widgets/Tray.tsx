import AstalTray from "gi://AstalTray?version=0.1";
import { Astal, Gdk, Gtk } from "astal/gtk3";
import { bind } from "astal";

export default function Tray() {
  const tray = AstalTray.get_default()

  return <box>
    {bind(tray, "items").as(items => items.map(item => {
      const menu = item.create_menu()
      return <button
        tooltip_markup={bind(item, "tooltip_markup")}
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.CENTER}
        onClick={(self) => {
          menu?.popup_at_widget(self, Gdk.Gravity.SOUTH, Gdk.Gravity.NORTH, null)
        }}
        onDestroy={() => menu?.destroy()}
      >
        <icon g_icon={bind(item, "gicon")} />
      </button>
    }))}
  </box>
}

