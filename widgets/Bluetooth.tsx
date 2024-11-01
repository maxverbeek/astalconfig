import { App } from "astal/gtk3"

export default function Bluetooth() {

  return <button onClick={() => App.toggle_window('bluetooth')}>
    <icon icon="bluetooth"></icon>
  </button>
}
