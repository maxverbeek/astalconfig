import app from "ags/gtk4/app"
import style from "./style.scss"
import Bar from "./windows/Bar"
import { createBinding, For } from "ags"
import { Gtk } from "ags/gtk4"

app.start({
  css: style,
  main() {
    const monitors = createBinding(app, 'monitors')

    return <For each={monitors} cleanup={(win) => (win as Gtk.Window).destroy()}>
      {(monitor) => <Bar gdkmonitor={monitor} />}
    </For>
  }
})
