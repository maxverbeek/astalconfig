import AstalBattery from "gi://AstalBattery?version=0.1"
import AstalNetwork from "gi://AstalNetwork?version=0.1"
import { Accessor, createBinding, createComputed, createState, With } from "gnim"
import Brightness from "../services/brightness"
import Gtk from "gi://Gtk?version=4.0"

function CurrentWifi(wifi: AstalNetwork.Wifi, hovered: Accessor<boolean>) {
  const icon = createBinding(wifi, "icon_name")
  const ssid = createBinding(wifi, "ssid")

  const insecure = ssid(ssid => ['Plus Ultra Guests', 'BusinessCenter'].includes(ssid))

  return <box class={insecure(s => s ? "wifi insecure" : "wifi")}>
    <image icon_name={icon} />
    <revealer reveal_child={hovered} transition_type={Gtk.RevealerTransitionType.SLIDE_LEFT}>
      <label label={ssid(s => s ?? '')} />
    </revealer>
  </box>
}

function pct(percentage: number): string {
  return `${Math.floor(percentage * 100)}%`
}

function LaptopThings() {
  const astalnetwork = AstalNetwork.get_default()
  const battery = AstalBattery.get_default()
  const brightnessservice = Brightness.get_default()

  const wifi = createBinding(astalnetwork, "wifi")

  const hasWifi = wifi(Boolean)
  const hasBattery = createBinding(battery, "isPresent")
  const hasBrightness = createBinding(brightnessservice, "hasScreen")

  const handleScroll = (dx: number, dy: number) => {
    brightnessservice.screen += Math.min(Math.max(-dy - dx, -0.02), 0.02)
  }

  const [hovered, setHovered] = createState(false)

  return <box visible={createComputed(get => get(hasWifi) || get(hasBattery) || get(hasBrightness))}>
    <Gtk.EventControllerScroll
      $={(ecs) => { ecs.flags = Gtk.EventControllerScrollFlags.BOTH_AXES | Gtk.EventControllerScrollFlags.DISCRETE }}
      onScroll={(_source, dx, dy) => handleScroll(dx, dy)}
    />
    <Gtk.EventControllerMotion onEnter={() => setHovered(true)} onLeave={() => setHovered(false)} />
    <box visible={hasWifi}>
      <With value={wifi}>
        {(wifi) => CurrentWifi(wifi, hovered)}
      </With>
    </box>
    <box visible={hasBattery}>
      <image icon_name={createBinding(battery, "iconName")} />
      <revealer reveal_child={hovered} transition_type={Gtk.RevealerTransitionType.SLIDE_LEFT}>
        <label label={createBinding(battery, "percentage")(pct)} />
      </revealer>
    </box>
    <box visible={hasBrightness}>
      <image icon_name="display-brightness-symbolic" />

      <revealer reveal_child={hovered} transition_type={Gtk.RevealerTransitionType.SLIDE_LEFT}>
        <label label={createBinding(brightnessservice, "screen")(pct)} />
      </revealer>
    </box>
  </box>
}

export default LaptopThings
