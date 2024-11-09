import GObject from "gi://GObject"
import { App, ConstructProps, Gtk, astalify } from "astal/gtk3"
import { Variable, bind } from "astal"
import AstalBluetooth from "gi://AstalBluetooth?version=0.1"

// subclass, register, define constructor props
class Popover extends astalify(Gtk.Popover) {
  static { GObject.registerClass(this) }

  constructor(props: ConstructProps<
    Popover,
    Gtk.Popover.ConstructorProps,
    {} // signals of Gtk.Popover have to be manually typed
  >) {
    super(props as any)
  }
}

export default function Bluetooth() {

  const bt = AstalBluetooth.get_default()

  const connected = bind(bt, "is_connected")
  const className = connected.as(c => c ? "Bluetooth connected" : "Bluetooth")

  const icon = bind(bt, "is_powered").as(c => c ? "bluetooth-active-symbolic" : "bluetooth-disabled-symbolic")

  return <box vertical>
    <button
      className={className}
      onClick={() => {
        App.toggle_window('bluetooth')
      }}
    >
      <icon icon={icon}></icon>
    </button>
  </box>
}
