import app from "ags/gtk4/app"
import style from "./styles/index.scss"
import Bar from "./widget/Bar"
import { createBinding, createComputed, createState, For, onCleanup, This } from "ags"
import { Astal, Gtk } from "ags/gtk4"
import AstalNotifd from "gi://AstalNotifd?version=0.1"
import Notification from "./widget/Notification"
import { theme } from "./lib/constants"

const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

const notifd = AstalNotifd.get_default()!

function BarWindows() {
  const monitors = createBinding(app, "monitors")

  return (
    <For each={monitors}>
      {(monitor) => (
        <This this={app}>
          <window
            $={(self) => onCleanup(() => self.destroy())}
            visible
            name="bar"
            class="Bar"
            gdkmonitor={monitor}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            anchor={TOP | LEFT | RIGHT}
            application={app}>
            <Bar gdkmonitor={monitor} />
          </window>
        </This>
      )}
    </For>
  )
}

function NotificationWindow() {
  const [notifications, setNotifications] = createState<AstalNotifd.Notification[]>([])

  const notifiedHandler = notifd.connect("notified", (_, id, replaced) => {
    const notification = notifd.get_notification(id)!

    if (replaced && notifications.peek().some((n) => n.id === id)) {
      setNotifications((ns) => ns.map((n) => (n.id === id ? notification : n)))
    } else {
      setNotifications((ns) => [notification, ...ns])
    }
  })

  const resolvedHandler = notifd.connect("resolved", (_, id) => {
    setNotifications((ns) => ns.filter((n) => n.id !== id))
  })

  onCleanup(() => {
    notifd.disconnect(notifiedHandler)
    notifd.disconnect(resolvedHandler)
  })

  const dnd = createBinding(notifd, "dont_disturb")

  const visiblity = createComputed(() => notifications().length > 0 && !dnd())

  return (
    <window
      visible={visiblity}
      name="notifications"
      class="notifications"
      anchor={TOP | RIGHT}
    >
      <box orientation={Gtk.Orientation.VERTICAL} spacing={theme.notifications.spacebetween}>
        <For each={notifications}>
          {(notification) => <Notification notification={notification} />}
        </For>
      </box>
    </window>
  )

}

function main() {
  BarWindows()
  NotificationWindow()
}

app.start({
  instanceName: INSTANCE_NAME ?? 'ags',
  css: style,
  icons: `${SRC}/icons`,
  main,
})
