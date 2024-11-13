import Battery from "gi://AstalBattery"
import { bind } from "astal"
import { percentage } from "../utils"

const battery = Battery.get_default()

export default function LaptopStuff() {
  return <box className="LaptopStuff">
    <label label={bind(battery, 'percentage').as(percentage)} />
  </box>
}
