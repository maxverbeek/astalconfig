import { Accessor, createBinding, createComputed, createState } from "gnim"
import Usage, { MemoryUsage } from "../services/usage"
import Gtk from "gi://Gtk?version=4.0"

function percentage(num: number): string {
  return `${Math.round(num * 100)}%`
}

function ResourceUsage() {
  const usage = Usage.get_default()

  const cpu = createBinding(usage, 'cpuUsage')
  const memory = createBinding(usage, 'memory')(m => (m as MemoryUsage).percentage)

  const statusBinding = (usageBinding: Accessor<number>) => createComputed(get => {
    const u = get(usageBinding)

    if (u < 0.6) return ''
    if (u < 0.8) return ' normal'
    return ' busy'
  })

  const [hovered, setHovered] = createState(false)
  const expandedCpu = createComputed(get => get(hovered) || get(cpu) > 0.6)
  const expandedMemory = createComputed(get => get(hovered) || get(memory) > 0.8)

  const cpuClass = createComputed(get => "cpu" + get(statusBinding(cpu)))
  const memClass = createComputed(get => "memory" + get(statusBinding(cpu)))

  return <box>
    <Gtk.EventControllerMotion onEnter={() => setHovered(true)} onLeave={() => setHovered(false)} />
    <box class={cpuClass}>
      <image icon_name="processor-symbolic" />
      <revealer transition_type={Gtk.RevealerTransitionType.SLIDE_LEFT} reveal_child={expandedCpu}>
        <label label={cpu(percentage)} />
      </revealer>
    </box>
    <box class={memClass}>
      <image icon_name="memory-stick-symbolic" />
      <revealer transition_type={Gtk.RevealerTransitionType.SLIDE_LEFT} reveal_child={expandedMemory}>
        <label label={memory(percentage)} />
      </revealer>
    </box>
  </box>
}

export default ResourceUsage
