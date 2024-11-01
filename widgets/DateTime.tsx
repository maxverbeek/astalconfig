import { GLib, Variable } from "astal"
import { Gtk } from "astal/gtk3"

export default function DateTime({ timefmt = "%H:%M", datefmt = "%a %d %b" }) {
  const time = Variable<string>("").poll(1000, () => GLib.DateTime.new_now_local().format(timefmt)!)
  const date = Variable<string>("").poll(1000, () => GLib.DateTime.new_now_local().format(datefmt)!)

  return <box className="DateTime" spacing={2}>
    <label onDestroy={() => date.drop()} label={date()} />
    <icon icon="dot" halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />
    <label onDestroy={() => time.drop()} label={time()} />
  </box>
}
