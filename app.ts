import style from "./style.scss"
import { App, Gdk, Gtk } from "astal/gtk3"
import Bar from "./windows/Bar"
import BluetoothMenu from "./windows/BluetoothMenu"
import Applauncher from "./windows/Applauncher"
import NotificationPopups from "./windows/Notifications"

App.start({
  icons: `./icons`,
  css: style,
  main() {
    const bars = new Map<Gdk.Monitor, Gtk.Widget>()

    for (const gdkmonitor of App.get_monitors()) {
      bars.set(gdkmonitor, Bar(gdkmonitor))
    }

    App.connect("monitor-added", (_, gdkmonitor) => {
      const addLater = () => {
        if (gdkmonitor.manufacturer) {
          bars.set(gdkmonitor, Bar(gdkmonitor))
          return
        }

        // I've noticed that the manufacturer is not set after turning on a monitor. This is a nasty workaround
        // because signals do not seem to work here. I think it could have something to do with niri only
        // setting this information after a little while
        console.log('Manufacturer was null, checking again in 500ms')
        setTimeout(addLater, 500)
      }

      addLater()
    })

    App.connect("monitor-removed", (_, gdkmonitor) => {
      bars.get(gdkmonitor)?.destroy()
      bars.delete(gdkmonitor)
    })

    App.get_monitors().map(NotificationPopups)

    const applauncher = Applauncher()
    const btmenu = BluetoothMenu()
  },
})
