import { GLib, Variable } from "astal"
import { Gtk } from "astal/gtk3"

export default function DateTime({ timefmt = "%H:%M", datefmt = "%a %d %b" }) {
  const time = Variable<string>("").poll(1000, () => GLib.DateTime.new_now_local().format(timefmt)!)
  const date = Variable<string>("").poll(1000, () => GLib.DateTime.new_now_local().format(datefmt)!)

  return <box className="DateTime" spacing={3}>
    <label className="date" onDestroy={() => date.drop()} label={date()} />
    <label className="dot" label="•"></label>
    {/* <icon icon="dot" halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} /> */}
    <label className="time" onDestroy={() => time.drop()} label={time()} />
  </box>
}
