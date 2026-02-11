import { Gdk, Gtk } from "ags/gtk4";
import BarItem from "./BarItem";
import AstalNiri from "gi://AstalNiri?version=0.1";
import { createBinding, createComputed, For, With } from "gnim";
import { guessBarIcon } from "@/lib/utils";
import { theme } from "@/lib/constants";

const niri = AstalNiri.get_default()!

type WorkspacesProps = {
  output: AstalNiri.Output
}

function Workspaces({ output }: WorkspacesProps) {
  const workspaces = createBinding(output, "workspaces").as(ws => ws.sort((a, b) => a.idx - b.idx))
  return <box spacing={theme.bar.spacing}>
    <For each={workspaces}>
      {workspace => <Workspace workspace={workspace} />}
    </For>
  </box>
}

type WorkspaceProps = {
  workspace: AstalNiri.Workspace
}

function Workspace({ workspace }: WorkspaceProps) {
  const windows = createBinding(workspace, "windows")
  const klass = createBinding(workspace, 'is_active')(a => a ? 'bar-item active' : 'bar-item')
  const visible = createComputed(() => windows().length > 0 || theme.workspaces.showEmpty)

  return <BarItem overflow={Gtk.Overflow.HIDDEN} onPrimaryClick={() => workspace.focus()} visible={visible} class={klass}>
    <box spacing={theme.bar.itemspacing}>
      <label label={createBinding(workspace, "idx").as(String)} />
      <box spacing={theme.bar.itemspacing} class="window-icons" visible={createComputed(() => windows().length > 0)}>
        <For each={windows}>
          {(win) => {
            const focused = createBinding(win, 'is_focused')
            return <image class={focused(f => f ? 'focused' : '')} icon_name={guessBarIcon(win)} />

          }}
        </For>
      </box>
    </box>
  </BarItem>
}

type NiriWorkspacesProps = {
  gdkmonitor: Gdk.Monitor
}

export default function NiriWorkspaces({ gdkmonitor, ...rest }: NiriWorkspacesProps) {
  const output = createBinding(niri, "outputs").as(outputs => outputs.find(o => o.model === gdkmonitor.model))

  return <box {...rest}>
    <With value={output}>
      {value => value && <Workspaces output={value} />}
    </With>
  </box>
}
