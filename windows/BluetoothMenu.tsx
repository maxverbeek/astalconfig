import GObject from "gi://GObject"
import { App, Astal, ConstructProps, Gtk, astalify } from "astal/gtk3"
import { bind } from "astal"
import AstalBluetooth from "gi://AstalBluetooth?version=0.1"

// subclass, register, define constructor props
class Spinner extends astalify(Gtk.Spinner) {
  static { GObject.registerClass(this) }

  constructor(props: ConstructProps<
    Spinner,
    Gtk.Spinner.ConstructorProps,
    {}
  >) {
    super(props as any)
  }
}

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
    <button
      className="connect"
      cursor="pointer"
      hexpand
      onClick={() => device.connect_device((result) => console.log(result))}
    >
      <box hexpand>
        <icon icon={device.icon}></icon>
        {bind(device, "alias").as(alias => <label hexpand xalign={0} label={alias}></label>)}
        <Spinner
          visible={bind(device, "connecting")}
          setup={(self) => {
            bind(device, "connecting").subscribe(connecting => {
              connecting ? self.start() : self.stop()
            })
          }}
        ></Spinner>
      </box>
    </button>
    <button
      className="disconnect"
      cursor="pointer"
      visible={bind(device, "connected")}
      onClick={() => device.disconnect_device((result) => console.log(result))}
    >
      <icon icon="window-close-symbolic"></icon>
    </button>
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
    <box widthRequest={400} orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.START}>
      <label label="Bluetooth" xalign={0} />
      <BtStatus />
    </box>
  </window>
}
