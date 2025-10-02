import AstalBattery from "gi://AstalBattery?version=0.1"
import AstalNetwork from "gi://AstalNetwork?version=0.1"
import { createBinding, With } from "gnim"
import Brightness from "../services/brightness"

function CurrentWifi(wifi: AstalNetwork.Wifi) {
  const icon = createBinding(wifi, "icon_name")
  const ssid = createBinding(wifi, "ssid")

  return <box>
    <image icon_name={icon} />
    <label label={ssid(s => s ?? '')} />
  </box>
}

function LaptopThings() {
  const astalnetwork = AstalNetwork.get_default()
  const battery = AstalBattery.get_default()
  const brightnessservice = Brightness.get_default()

  const wifi = createBinding(astalnetwork, "wifi")

  // TODO: derive this stuff from actual places
  const hasWifi = wifi(Boolean)
  const hasBattery = createBinding(battery, "isPresent")
  const hasBrightness = true

  if (!hasWifi && !hasBattery && !hasBrightness) {
    return <box visible={false}></box>
  }

  return <box>
    <box visible={hasWifi}>
      <With value={wifi}>
        {(wifi) => CurrentWifi(wifi)}
      </With>
    </box>
    <box visible={hasBattery}>
      <image icon_name={createBinding(battery, "iconName")} />
      <label label={createBinding(battery, "percentage")(p => `${Math.floor(p * 100)}%`)} />
    </box>
  </box>
}

export default LaptopThings
