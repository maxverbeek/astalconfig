import AstalNetwork from "gi://AstalNetwork?version=0.1"
import AstalBattery from "gi://AstalBattery?version=0.1"
import { bind, Variable } from "astal"
import { cn, percentage } from "../utils"

// copied this from the docs example
import AstalBrightness from "../service/brightness"
import Gtk from "gi://Gtk?version=3.0"

const network = AstalNetwork.get_default()
const battery = AstalBattery.get_default()
const brightness = AstalBrightness.get_default()

function WifiIcon() {
  const wifi = network.get_wifi()

  if (wifi) {
    const notIsoProof = bind(wifi, 'ssid').as(ssid => ssid.includes('BusinessCenter'))

    return <icon
      icon={bind(wifi, 'icon_name')}
      tooltip_text={bind(wifi, 'ssid')}
      className={cn({ 'wifi-danger': notIsoProof })()}
    />
  }

  return null
}

function BatteryIcon() {
  return <icon
    className="battery"
    icon={bind(battery, 'battery_icon_name')}
    tooltip_text={bind(battery, 'percentage').as(percentage)}
  />
}

function BrightnessIcon() {
  return <icon icon="display-brightness-symbolic" tooltip_text={bind(brightness, 'screen').as(percentage)} />
}

const batteryLevels: [number, string][] = [
  [0.1, 'battery-critical'],
  [0.25, 'battery-low'],
  [0.5, 'battery-needs-juice'],
  [100, ''] // positive infinity --- no special class added
]

export default function LaptopStuff() {
  const batteryLevelClass = bind(battery, 'percentage').as(perc => batteryLevels.find(([level, _]) => level >= perc)![1])
  const batteryCharging = bind(battery, 'charging')
  const batteryClass = Variable.derive([batteryLevelClass, batteryCharging], (level, charging) => charging ? '' : level)

  const hoverReveal = Variable(false)

  // define the class here so that CSS can be applied to the entire widget instead of just the battery icon
  return <eventbox
    onScroll={(_self, scroll) => {
      brightness.screen = scroll.delta_y < 0 ? Math.min(1, brightness.screen + 0.02) : Math.max(0, brightness.screen - 0.02)
    }}
    onHover={() => hoverReveal.set(true)}
    onHoverLost={() => hoverReveal.set(false)}>
    <box className={batteryClass(cls => `LaptopStuff ${cls}`)}>
      <WifiIcon />
      <revealer
        reveal_child={hoverReveal()}
        transition_type={Gtk.RevealerTransitionType.SLIDE_LEFT}
      >
        {bind(network.wifi!, 'ssid')}
      </revealer>
      <BatteryIcon />
      <revealer
        reveal_child={hoverReveal()}
        transition_type={Gtk.RevealerTransitionType.SLIDE_LEFT}
      >
        {bind(battery, 'percentage').as(percentage)}
      </revealer>
      <BrightnessIcon />
      <revealer
        reveal_child={hoverReveal()}
        transition_type={Gtk.RevealerTransitionType.SLIDE_LEFT}
      >
        <label label={bind(brightness, 'screen').as(percentage)} css="margin-right: 0.8rem" />
      </revealer>
    </box>
  </eventbox>

}
