import { Gtk } from "astal/gtk3"
import { Variable } from "../../../../../nix/store/x9p0zmv4h5wi8ln6wwip7bbgb7mmdpbd-astal-gjs/share/astal/gjs"

type MenuProps = {
  child: JSX.Element
}
function Menu({ child }: MenuProps) {
  const opened = Variable(false)

  return <revealer transition_type={Gtk.RevealerTransitionType.SLIDE_DOWN} reveal_child={opened()}>
    {child}
  </revealer>
}
