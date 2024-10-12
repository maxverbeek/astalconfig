import { App } from "astal"
import style from "inline:./style.css"
import Bar from "./widget/Bar"
import Niri from "./service/niri"

const niri = new Niri()

niri.connect('my-signal', (niri, str, num) => {
  console.log(str, num, niri)
})

App.start({
  css: style,
  main() {
    Bar(0)
    // Bar(1) // initialize other monitors
  },
})
