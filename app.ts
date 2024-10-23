import { App, Gdk, Gtk } from "astal"
import style from "inline:./style.css"
import Bar from "./widget/Bar"

App.start({
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
  },
})
