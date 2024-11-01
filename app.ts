import style from "inline:./style.css"
import { App, Gdk, Gtk } from "astal/gtk3"
import Bar from "./windows/Bar"
import BluetoothMenu from "./windows/BluetoothMenu"

App.start({
  icons: `./icons`,
  css: style,
  main() {
    const bars = new Map<Gdk.Monitor, Gtk.Widget>()

    for (const gdkmonitor of App.get_monitors()) {
      bars.set(gdkmonitor, Bar(gdkmonitor))
    }

    App.connect("monitor-added", (_, gdkmonitor) => {
      bars.set(gdkmonitor, Bar(gdkmonitor))
    })

    App.connect("monitor-removed", (_, gdkmonitor) => {
      bars.get(gdkmonitor)?.destroy()
      bars.delete(gdkmonitor)
    })

    const btmenu = BluetoothMenu()
  },
})
