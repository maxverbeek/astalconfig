import AstalBluetooth from 'gi://AstalBluetooth?version=0.1'
import Wireplumber from 'gi://AstalWp'
import { createBinding } from 'gnim'

function percentage(perc: number): string {
  return `${Math.floor(perc * 100)}%`
}

function BluetoothAudioMenu() {

  const bt = AstalBluetooth.get_default()
  const { defaultSpeaker, defaultMicrophone } = Wireplumber.get_default()

  const speakerVolume = createBinding(defaultSpeaker, 'volume')(percentage)
  const speakerIcon = createBinding(defaultSpeaker, 'volume_icon')

  const microphoneVolume = createBinding(defaultMicrophone, 'volume')(percentage)
  const microphoneIcon = createBinding(defaultMicrophone, 'volume_icon')

  const bluetoothIcon = createBinding(bt, "is_powered")(c => c ? "bluetooth-active-symbolic" : "bluetooth-disabled-symbolic")

  return <menubutton>
    <box>
      <image icon_name={bluetoothIcon} />
      <image tooltip_text={speakerVolume} icon_name={speakerIcon} />
      <image tooltip_text={microphoneVolume} icon_name={microphoneIcon} />
    </box>
    <popover>
    </popover>
  </menubutton>
}

export default BluetoothAudioMenu
