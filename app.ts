import app from "ags/gtk4/app"
import style from "./styles/index.scss"
import Bar from "./widget/Bar"

app.start({
  css: style,
  icons: `${SRC}/icons`,
  main() {
    app.get_monitors().map(Bar)
  },
})
