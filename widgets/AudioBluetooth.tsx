import Wireplumber from "gi://AstalWp"
import { bind } from "astal"
import { cn, percentage } from "../utils"
import { App, Astal } from "astal/gtk3"
import AstalBluetooth from "gi://AstalBluetooth?version=0.1"

export default function AudioBluetooth() {
  const audio = Wireplumber.get_default()?.audio
  const speaker = audio?.get_default_speaker()!
  const mic = audio?.get_default_microphone()!

  const audioVolText = bind(speaker, "volume").as(vol => `Speaker volume ${percentage(vol)}`)
  const micVolText = bind(mic, "volume").as(vol => `Mic volume ${percentage(vol)}`)

  const bt = AstalBluetooth.get_default()
  const bluetoothIcon = bind(bt, "is_powered").as(c => c ? "bluetooth-active-symbolic" : "bluetooth-disabled-symbolic")

  return <box className="AudioBluetooth">
    <button
      onClick={(_self, click) => {
        if (click.button === Astal.MouseButton.PRIMARY) {
          App.toggle_window('bluetooth')
        } else if (click.button === Astal.MouseButton.SECONDARY) {
          speaker.set_mute(!speaker.get_mute())
        }
      }}

      onScroll={(_self, scroll) => {
        speaker.volume = scroll.delta_y < 0 ? Math.min(1, speaker.volume + 0.02) : Math.max(0, speaker.volume - 0.02)
      }}
    >
      <box>
        <icon
          icon={bluetoothIcon}
          className={cn('Bluetooth', { connected: bind(bt, 'is_connected') })()}
        />
        <icon
          icon={bind(speaker, "volume_icon")}
          tooltip_text={audioVolText}
          className={cn('Audio', { muted: bind(speaker, 'mute') })()}
        />
        <icon
          icon={bind(mic, "volume_icon")}
          tooltip_text={micVolText}
          className={cn('Microphone', { muted: bind(mic, 'mute') })()}
        />
      </box>
    </button>
  </box>
}
