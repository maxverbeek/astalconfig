import { createBinding, For, This } from "ags"
import app from "ags/gtk4/app"
import style from "./style.scss"
import Bar from "./windows/Bar"
import Niri from "./services/niri"

const niri = Niri.get_default()

app.start({
  css: style,
  // It's usually best to go with the default Adwaita theme
  // and built off of it, instead of allowing the system theme
  // to potentially mess something up when it is changed.
  // Note: `* { all:unset }` in css is not recommended.
  gtkTheme: "Adwaita",
  main() {
    const monitors = createBinding(app, "monitors")

    // whenever we notice that monitors appear/disappear, make a query to niri to repopulate the monitor information. Niri
    // does not recieve this over its eventbus. Moreover, niri does not get manufacturer names over the event stream. This
    // only happens when you query for outputs explicitly which is what is triggered here.
    monitors.subscribe(() => niri.reloadMonitors())

    return (
      <For each={monitors}>
        {(monitor) => (
          <This this={app}>
            <Bar gdkmonitor={monitor} />
          </This>
        )}
      </For>
    )
  },
})
