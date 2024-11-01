import { App, Astal, Gtk } from "astal/gtk3"
import { bind } from "astal"
import AstalBluetooth from "gi://AstalBluetooth?version=0.1"

function BtStatus() {
  const bt = AstalBluetooth.get_default()

  return <box vertical>
    {bind(bt, "devices").as(devices => devices.map(device => <Device device={device} />))}
  </box>
}

type DeviceProps = {
  device: AstalBluetooth.Device
}

function Device({ device }: DeviceProps) {
  return <box className="btdevice">
    <button hexpand onClick={() => device.connect_device((result) => console.log(result))}>
      <box hexpand>
        <icon icon={device.icon}></icon>
        {bind(device, "alias").as(alias => <label hexpand xalign={0} label={alias}></label>)}
        {bind(device, "connecting").as(c => <Gtk.Spinner active visible={c}></Gtk.Spinner>)}
      </box>
    </button>
    {bind(device, "connected").as(v => v && <button onClick={() => device.disconnect_device((result) => console.log(result))}>
      <icon icon="window-close"></icon>
    </button>
    )}
  </box>
}

export default function BluetoothMenu() {
  const bt = AstalBluetooth.get_default()

  return <window
    name="bluetooth"
    className="BluetoothMenu"
    setup={(self) => App.add_window(self)}
    visible={false}
    anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}>
    <box orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.START}>
      <label label="Bluetooth" xalign={0} />
      {!bt.is_connected && <label xalign={0} label="disconnected" />}
      <BtStatus />
    </box>
  </window>
}
