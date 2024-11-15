import Gtk from "gi://Gtk?version=3.0"
import { Variable, bind } from "astal"
import Usage from "../service/usage"
import { cn, percentage } from "../utils"

const usage = Usage.get_default()

export default function ResourceUsage() {

  const cpu = bind(usage, 'cpuUsage')
  const mem = bind(usage, 'memory').as(mem => mem.percentage)

  const revealCPU = cpu.as(cpu => cpu > 0.8)
  const revealMemory = mem.as(mem => mem > 0.8)
  const hovered = Variable(false)

  const reveal = Variable.derive([revealCPU, revealMemory, hovered], (rc, rm, hovered) => hovered || rc || rm)

  return <box className="ResourceUsage">
    <eventbox onHover={() => hovered.set(true)} onHoverLost={() => hovered.set(false)}>
      <box>
        <box
          className={cn('cpu', {
            'medium': cpu.as(c => c > 0.6 && c <= 0.9),
            'high': cpu.as(c => c > 0.9)
          })()}
        >
          <icon icon="processor-symbolic" />
          <revealer reveal_child={reveal()} transition_type={Gtk.RevealerTransitionType.SLIDE_LEFT}>
            <label label={cpu.as(percentage)} />
          </revealer>
        </box>
        <box
          className={cn('memory', {
            'medium': mem.as(c => c > 0.6 && c <= 0.9),
            'high': mem.as(c => c > 0.9)
          })()}
        >
          <icon icon="memory-stick-symbolic" />
          <revealer reveal_child={reveal()} transition_type={Gtk.RevealerTransitionType.SLIDE_LEFT}>
            <label label={mem.as(percentage)} />
          </revealer>
        </box>
      </box>
    </eventbox>
  </box>
}
