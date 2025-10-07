import AstalBluetooth from 'gi://AstalBluetooth?version=0.1'
import Wireplumber from 'gi://AstalWp'
import Gtk from 'gi://Gtk?version=4.0'
import { createBinding, For } from 'gnim'

const { HORIZONTAL, VERTICAL } = Gtk.Orientation

function percentage(perc: number): string {
  return `${Math.floor(perc * 100)}%`
}

type AudioSliderProps = {
  endpoint: Wireplumber.Endpoint
}

function AudioSlider({ endpoint }: AudioSliderProps) {
  const vol = createBinding(endpoint, "volume")
  const volpct = vol(percentage)
  return <box>
    <button onClicked={() => endpoint.mute = !endpoint.mute}>
      <box>
        <image icon_name={createBinding(endpoint, "volume_icon")} />
        <label label={volpct} />
      </box>
    </button>
    <slider
      widthRequest={260}
      onChangeValue={({ value }) => endpoint.set_volume(value)}
      value={createBinding(endpoint, "volume")}
    />
  </box>
}

function BluetoothDevices() {
  const bt = AstalBluetooth.get_default()

  const visible = createBinding(bt, "adapters")(adapters => adapters.length > 0)
  const devices = createBinding(bt, "devices")

  return <box orientation={VERTICAL} visible={visible}>
    <For each={devices}>
      {device => <box>
        <button
          onClicked={() => device.connect_device((result) => console.log("connect device", result))}
          hexpand
        >
          <box>
            <image icon_name={createBinding(device, "icon")} />
            <label label={createBinding(device, "name")} />
            <Gtk.Spinner visible={createBinding(device, "connecting")} />
          </box>
        </button>
        <button
          visible={createBinding(device, "connected")}
          icon_name="window-close-symbolic"
          onClicked={() => device.disconnect_device((result) => console.log("disconnect device", result))}
        />
      </box>}
    </For>
  </box>
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
      <box orientation={VERTICAL}>
        <AudioSlider endpoint={defaultSpeaker} />
        <AudioSlider endpoint={defaultMicrophone} />
        <BluetoothDevices />
      </box>
    </popover>
  </menubutton>
}

export default BluetoothAudioMenu
