import GObject from "gi://GObject"
import { App, Astal, ConstructProps, Gdk, Gtk, Widget, astalify } from "astal/gtk3"
import { Binding, Variable, bind } from "astal"
import AstalBluetooth from "gi://AstalBluetooth?version=0.1"
import AstalWp from "gi://AstalWp?version=0.1"

import { cn } from "../utils/className"

// this stuff is massively annoying to implement, so I'll just use buttons for each audio option
class ComboBox extends astalify(Gtk.ComboBox) {
  static { GObject.registerClass(this) }

  constructor(props: ConstructProps<
    ComboBox,
    Gtk.ComboBox.ConstructorProps,
    {}
  >) {
    super(props as any)
  }
}


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
      className={cn('connect', { 'connected': bind(device, 'connected') })()}
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

function Endpoint(endpoint: AstalWp.Endpoint) {
  const iconName = Variable.derive([bind(endpoint, 'mediaClass'), bind(endpoint, 'mute')], (mediaClass, mute) => {
    if (mediaClass === AstalWp.MediaClass.AUDIO_SPEAKER) {
      return mute ? 'audio-volume-muted-symbolic' : 'audio-volume-high-symbolic'
    }

    if (mediaClass === AstalWp.MediaClass.AUDIO_MICROPHONE) {
      return mute ? 'microphone-sensitivity-muted-symbolic' : 'microphone-sensitivity-high-symbolic'
    }

    return 'circle-dashed'
  })

  return <box>
    <button
      cursor="pointer"
      className={cn('endpoint', { 'default': bind(endpoint, 'is_default') })()}
      onClick={() => endpoint.is_default = true}
    >
      <box hexpand>
        <icon icon={iconName()} />
        <label label={bind(endpoint, 'description')} />
      </box>
    </button>
  </box>
}

type EndpointStatusProps = {
  default_endpoint: AstalWp.Endpoint,
  endpoints: Binding<AstalWp.Endpoint[]>
}

function EndpointStatus({ default_endpoint, endpoints }: EndpointStatusProps) {
  const show = Variable(false)

  App.connect('window-toggled', (_app, win) => {
    if (win.name === 'bluetooth' && win.visible) {
      show.set(false)
    }
  })

  return <box vertical className="audiostatus">
    <box vertical>
      <box className="adjuster">
        <button
          cursor="pointer"
          className={cn('mute', { 'muted': bind(default_endpoint, 'mute') })()}
          onClick={() => default_endpoint.mute = !default_endpoint.mute}
        >
          <box className="volume">
            <icon icon={bind(default_endpoint, 'volumeIcon')} />
            <label label={bind(default_endpoint, 'volume').as(v => `${Math.floor(v * 100)}%`)} />
          </box>
        </button>
        <slider
          hexpand
          onDragged={({ value }) => default_endpoint.volume = value}
          value={bind(default_endpoint, "volume")}
        />
        <button cursor="pointer" className="expander" onClick={() => show.set(!show.get())}>
          <icon icon={show(s => s ? 'pan-down-symbolic' : 'pan-end-symbolic')}></icon>
        </button>
      </box>
      <revealer reveal_child={show()} transition_type={Gtk.RevealerTransitionType.SLIDE_DOWN}>
        <box vertical>
          {endpoints.as(endpoints => endpoints.map(Endpoint))}
        </box>
      </revealer>
    </box>
  </box>
}

export default function BluetoothMenu() {
  const audio = AstalWp.get_default()!.audio

  const speakers = bind(audio, 'speakers')
  const microphones = bind(audio, 'microphones')

  return <window
    name="bluetooth"
    className="BluetoothMenu"
    setup={(self) => App.add_window(self)}
    visible={false}
    anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT}>
    {/* this eventbox supposedly covers the entire screen and makes it so this closes when you click next to the window. However it also
    triggers when clicking inside of child elements that don't register click events (such as the box) */}
    <eventbox onClick={() => App.toggle_window('bluetooth')}>
      <box className="AudioBluetoothMenu" clickThrough={false} vertical valign={Gtk.Align.START} halign={Gtk.Align.END}>
        <label label="Bluetooth" xalign={0} />
        <BtStatus />
        <label label="Audio" xalign={0} />
        <EndpointStatus default_endpoint={audio.default_speaker} endpoints={speakers} />
        <EndpointStatus default_endpoint={audio.default_microphone} endpoints={microphones} />
      </box>
    </eventbox>
  </window>
}
