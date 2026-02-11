import { createComputed } from "ags";
import BarItem from "./BarItem";
import { createPoll } from "ags/time";
import GLib from "gi://GLib?version=2.0";
import { theme } from "@/lib/constants";

export default function Clock() {
  const datetime = createPoll(GLib.DateTime.new_now_local(), 1000, () => GLib.DateTime.new_now_local())

  const date = createComputed(() => datetime().format(theme.clock.dateformat) || '')
  const time = createComputed(() => datetime().format(theme.clock.timeformat) || '')

  return <BarItem class="clock">
    <box spacing={theme.bar.itemspacing}>
      <label class="date" label={date} />
      <label label="•" />
      <label class="time" label={time} />
    </box>
  </BarItem>
}
