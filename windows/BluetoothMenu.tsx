import GObject from "gi://GObject"
import { App, Astal, ConstructProps, Gdk, Gtk, Widget, astalify } from "astal/gtk3"
import { Variable, bind } from "astal"
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

function Adjuster(endpoint: AstalWp.Endpoint) {

  return <box className="adjuster">
    <button
      cursor="pointer"
      className={cn({ 'muted': bind(endpoint, 'mute') })()}
      onClick={() => endpoint.mute = !endpoint.mute}
    >
      <box className="volume">
        <icon icon={bind(endpoint, 'volumeIcon')} />
        <label label={bind(endpoint, 'volume').as(v => `${Math.floor(v * 100)}%`)} />
      </box>
    </button>
    <slider
      hexpand
      onDragged={({ value }) => endpoint.volume = value}
      value={bind(endpoint, "volume")}
    />
  </box>
}

function AudioStatus() {
  const audio = AstalWp.get_default()!.audio

  const speakers = bind(audio, 'speakers')
  const microphones = bind(audio, 'microphones')

  return <box vertical className="audiostatus">
    <box vertical className="speakers">
      {Adjuster(audio.default_speaker)}
      {speakers.as(endpoints => endpoints.map(Endpoint))}
    </box>
    <box className="divider" />
    <box vertical className="microphones">
      {Adjuster(audio.default_microphone)}
      {microphones.as(endpoints => endpoints.map(Endpoint))}
    </box>
  </box>
}

export default function BluetoothMenu() {
  return <window
    name="bluetooth"
    className="BluetoothMenu"
    setup={(self) => App.add_window(self)}
    visible={false}
    anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}>
    <box widthRequest={400} orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.START}>
      <label label="Bluetooth" xalign={0} />
      <BtStatus />
      <label label="Audio" xalign={0} />
      <AudioStatus />
    </box>
  </window>
}
