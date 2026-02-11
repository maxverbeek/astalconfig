import { icons, theme } from "@/lib/constants";
import { batteryIconFn, wifiIconFn } from "@/lib/utils";
import { Gtk } from "ags/gtk4";
import AstalBattery from "gi://AstalBattery?version=0.1";
import AstalBluetooth from "gi://AstalBluetooth?version=0.1";
import AstalNetwork from "gi://AstalNetwork?version=0.1";
import { Accessor, createBinding, createComputed, createState } from "gnim";

const battery = AstalBattery.get_default()!
const bluetooth = AstalBluetooth.get_default()!
const network = AstalNetwork.get_default()!

type HoverProps = {
  hovered: Accessor<boolean>
}

function BatteryIcon({ hovered }: HoverProps) {
  const percetangefloat = createBinding(battery, 'percentage')
  const visible = createBinding(battery, 'is_present')
  const charging = createBinding(battery, 'charging')
  const drainicon = percetangefloat(batteryIconFn)
  const perc = percetangefloat(p => `${Math.round(p * 100)}%`)
  const icon = createComputed(() => charging() ? icons.battery.charging : drainicon())

  const imgclass = createComputed(() => {
    const c = ['battery-icon']
    if (percetangefloat() < 0.2) {
      c.push('critical')
    } else if (percetangefloat() < 0.2) {
      c.push('verylow')
    } else if (percetangefloat() < 0.3) {
      c.push('low')
    }

    if (charging()) {
      c.push('charging')
    }

    return c.join(' ')
  })

  const revealed = createComputed(() => hovered() || percetangefloat() < 0.25)

  return <box spacing={theme.bar.itemspacing}>
    <image visible={visible} class={imgclass} icon_name={icon} />
    <revealer transition_duration={200} transition_type={Gtk.RevealerTransitionType.SLIDE_LEFT} reveal_child={revealed}>
      <label label={perc} />
    </revealer>
  </box>
}

function WifiIcon({ hovered }: HoverProps) {
  const visible = createBinding(network, 'primary')(p => p === AstalNetwork.Primary.WIFI)
  const icon = createBinding(network.wifi, 'strength')(wifiIconFn)
  const ssid = createBinding(network.wifi, 'ssid')


  return <box spacing={theme.bar.itemspacing}>
    <image visible={visible} class="wifi-icon" icon_name={icon} />
    <revealer transition_duration={200} transition_type={Gtk.RevealerTransitionType.SLIDE_LEFT} reveal_child={hovered}>
      <label label={ssid} />
    </revealer>
  </box>
}

function BluetoothIcon() {
  const powered = createBinding(bluetooth, 'isPowered')
  const connected = createBinding(bluetooth, 'isConnected')

  const icon = createComputed(() => {
    if (!powered()) return icons.bluetooth.off
    if (connected()) return icons.bluetooth.connected
    return icons.bluetooth.on
  })

  const klass = createComputed(() => connected() ? `bluetooth-icon connected` : `bluetooth-icon`)

  return <image class={klass} icon_name={icon} />
}

const batteryCritical = createBinding(battery, 'percentage')(p => p < 0.1)
const charging = createBinding(battery, 'charging')
export const batteryFlashClass = createComputed(() => batteryCritical() && !charging())(shouldflash => shouldflash ? 'battery-critical-bgflash' : '')

export default function QuicksettingsBarButton({ opened }: { opened: Accessor<boolean> }) {
  const [hovered, setHovered] = createState(false)
  const expanded = createComputed(() => hovered() || opened())

  return <box spacing={theme.bar.itemspacing}>
    <Gtk.EventControllerMotion onEnter={() => setHovered(true)} onLeave={() => setHovered(false)} />
    <BatteryIcon hovered={expanded} />
    <WifiIcon hovered={expanded} />
    <BluetoothIcon />
  </box>
}
