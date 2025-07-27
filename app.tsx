import { Gtk } from "ags/gtk4"
import Bar from "./windows/Bar"
import style from "./style.scss"
import { createBinding, For } from "ags"
import app from "ags/gtk4/app"

app.start({
  css: style,
  icons: `${SRC}/icons`,
  main() {
    const monitors = createBinding(app, 'monitors')

    return <For each={monitors} cleanup={(win) => (win as Gtk.Window).destroy()}>
      {(monitor) => <Bar gdkmonitor={monitor} />}
    </For>
  }
})
