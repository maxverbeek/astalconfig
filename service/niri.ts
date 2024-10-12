import GObject, { property, register, signal } from "astal/gobject";
import GLib from "gi://GLib?version=2.0";
import Gio from "gi://Gio?version=2.0";
import Hyprland from "gi://AstalHyprland";

const hyprland = Hyprland.get_default()

for (const client of hyprland.get_clients()) {
  console.log(client.title)
}

@register({ GTypeName: 'Niri' })
export default class Niri extends GObject.Object {
  @property(String)
  declare myProp: string

  @signal(String, String)
  declare mySignal: (a: string, b: string) => void

  constructor() {
    super()
    this.connectSocket()
  }

  private connectSocket() {
    const path = GLib.getenv('NIRI_SOCKET')!
    const client = new Gio.SocketClient().connect(new Gio.UnixSocketAddress({ path }), null)

    client.get_output_stream().write(JSON.stringify("EventStream") + "\n", null)

    const inputstream = new Gio.DataInputStream({
      // closeBaseStream: true,
      baseStream: client.get_input_stream()
    })

    this.readLineSocket(inputstream, (stream, result) => {
      if (!stream) {
        console.error('not stream')
        return
      }

      const line = stream.read_line_finish(result)[0] ?? new Uint8Array([])
      console.log(new TextDecoder().decode(line))
    })
  }

  private readLineSocket(inputstream: Gio.DataInputStream, callback: (stream: Gio.DataInputStream | null, result: Gio.AsyncResult) => void) {
    inputstream.read_line_async(0, null, (stream: Gio.DataInputStream | null, result: Gio.AsyncResult) => {
      callback(stream, result)

      if (!stream) {
        return
      }

      this.readLineSocket(stream, callback)
    })
  }
}

