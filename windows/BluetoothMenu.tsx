import GObject from "gi://GObject"
import { App, Astal, ConstructProps, Gdk, Gtk, Widget, astalify } from "astal/gtk3"
import { Binding, Variable, bind } from "astal"
import AstalBluetooth from "gi://AstalBluetooth?version=0.1"
import AstalWp from "gi://AstalWp?version=0.1"
import AstalBattery from "gi://AstalBattery?version=0.1"

import { cn, percentage } from "../utils"
import MediaPlayer from "../widgets/MediaPlayer"
import AstalMpris from "gi://AstalMpris?version=0.1"

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
  const upower = new AstalBattery.UPower()
  const batteries = bind(upower, 'devices')

  const btinfo = Variable.derive([bind(bt, 'devices'), batteries], (devices, batteries) => {
    return devices.map(device => {
      return {
        device,
        battery: batteries.find(b => b.serial === device.address)
      }
    })
  })

  return <box vertical>
    {bind(btinfo).as(devices => devices.map(device => <Device btinfo={device} />))}
  </box>
}

type BtInfo = {
  device: AstalBluetooth.Device
  battery?: AstalBattery.Device
}

type DeviceProps = {
  btinfo: BtInfo
}

function Device({ btinfo: { device, battery } }: DeviceProps) {
  const title = battery
    ? Variable.derive([bind(device, 'alias'), bind(battery, 'percentage')], (d, p) => `${d} [${Math.floor(p * 100)}%]`)
    : Variable.derive([bind(device, 'alias')], (a) => a)
  return <box className="btdevice">
    <button
      className={cn('connect', { 'connected': bind(device, 'connected') })()}
      cursor="pointer"
      hexpand
      onClick={() => device.connect_device((result) => console.log(result))}
    >
      <box hexpand>
        <icon icon={device.icon}></icon>
        <label hexpand xalign={0} label={title()}></label>
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
    <eventbox
      onScroll={(_self, scroll) => {
        default_endpoint.volume = scroll.delta_y < 0 ? Math.min(1, default_endpoint.volume + 0.02) : Math.max(0, default_endpoint.volume - 0.02)
      }}>
      <box vertical>
        <box className="adjuster">
          <button
            cursor="pointer"
            className={cn('mute', { 'muted': bind(default_endpoint, 'mute') })()}
            onClick={() => default_endpoint.mute = !default_endpoint.mute}
          >
            <box className="volume">
              <icon icon={bind(default_endpoint, 'volumeIcon')} />
              <label label={bind(default_endpoint, 'volume').as(percentage)} />
            </box>
          </button>
          <slider
            hexpand
            cursor="pointer"
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
    </eventbox>
  </box>
}

export default function BluetoothMenu() {
  const audio = AstalWp.get_default()!.audio

  const speakers = bind(audio, 'speakers')
  const microphones = bind(audio, 'microphones')


  const player = bind(AstalMpris.get_default(), 'players').as(players => players.find(p => p.bus_name === 'org.mpris.MediaPlayer2.spotify'))

  return <window
    name="bluetooth"
    className="BluetoothMenu"
    setup={(self) => App.add_window(self)}
    keymode={Astal.Keymode.ON_DEMAND}
    visible={false}
    onFocusOutEvent={(self) => App.toggle_window(self.name)}
    anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}>
    <box className="AudioBluetoothMenu" clickThrough={false} vertical valign={Gtk.Align.START} halign={Gtk.Align.END}>
      <label label="Bluetooth" xalign={0} />
      <BtStatus />
      <label label="Audio" xalign={0} />
      <EndpointStatus default_endpoint={audio.default_speaker} endpoints={speakers} />
      <EndpointStatus default_endpoint={audio.default_microphone} endpoints={microphones} />
      <label label="Music" xalign={0} visible={player.as(Boolean)} />
      <box visible={player.as(Boolean)}>
        {player.as(p => p && <MediaPlayer player={p} />)}
      </box>
    </box>
  </window>
}
