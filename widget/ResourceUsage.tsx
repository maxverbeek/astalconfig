import { Gtk } from "ags/gtk4";
import Usage from "@/services/usage";
import { createBinding, createComputed, createState } from "gnim";
import BarItem from "./BarItem";
import { icons, theme } from "@/lib/constants";

const usage = Usage.get_default()

export default function ResourceUsage() {
  const cpu = createBinding(usage, 'cpuUsage')
  const mem = createBinding(usage, 'memoryPercent')
  const [hovered, setHovered] = createState(false)

  const cpuLabel = createComputed(() => `${Math.round(cpu() * 100)}%`)
  const memLabel = createComputed(() => `${Math.round(mem() * 100)}%`)

  const { revealThreshold, mediumThreshold, highThreshold } = theme.usage

  const revealCpu = createComputed(() => hovered() || cpu() > revealThreshold)
  const revealMem = createComputed(() => hovered() || mem() > revealThreshold)

  const cpuClass = createComputed(() => {
    const c = cpu()
    if (c > highThreshold) return 'cpu high'
    if (c > mediumThreshold) return 'cpu medium'
    return 'cpu'
  })

  const memClass = createComputed(() => {
    const m = mem()
    if (m > highThreshold) return 'memory high'
    if (m > mediumThreshold) return 'memory medium'
    return 'memory'
  })

  return <BarItem class="bar-item no-hover">
    <Gtk.EventControllerMotion onEnter={() => setHovered(true)} onLeave={() => setHovered(false)} />
    <box spacing={theme.bar.itemspacing} class="resource-usage">
      <box class={cpuClass}>
        <image icon_name={icons.cpu} />
        <revealer transition_duration={200} transition_type={Gtk.RevealerTransitionType.SLIDE_LEFT} reveal_child={revealCpu}>
          <label label={cpuLabel} />
        </revealer>
      </box>
      <box class={memClass}>
        <image icon_name={icons.memory} />
        <revealer transition_duration={200} transition_type={Gtk.RevealerTransitionType.SLIDE_LEFT} reveal_child={revealMem}>
          <label label={memLabel} />
        </revealer>
      </box>
    </box>
  </BarItem>
}
