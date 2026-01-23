import app from "ags/gtk4/app"
import style from "./styles/index.scss"
import Bar from "./widget/Bar"
import { createBinding, For, onCleanup, This } from "ags"
import { Astal } from "ags/gtk4"

function main() {
  const monitors = createBinding(app, "monitors")
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

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

app.start({
  css: style,
  icons: `${SRC}/icons`,
  main,
})
