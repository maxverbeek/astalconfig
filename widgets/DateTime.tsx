import { GLib, Variable } from "astal"

export default function DateTime({ format = "%a %d %b, %H:%M" }) {
  const time = Variable<string>("").poll(1000, () =>
    GLib.DateTime.new_now_local().format(format)!)

  return <label className="DateTime" onDestroy={() => time.drop()} label={time()} />
}
