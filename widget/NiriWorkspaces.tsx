import { Gdk } from "ags/gtk4";
import BarItem from "./BarItem";
import AstalNiri from "gi://AstalNiri?version=0.1";
import { createBinding, For, With } from "gnim";
import { guessBarIcon } from "@/lib/utils";

const niri = AstalNiri.get_default()!

type WorkspacesProps = {
  output: AstalNiri.Output
}

function Workspaces({ output }: WorkspacesProps) {
  const workspaces = createBinding(output, "workspaces").as(ws => ws.sort((a, b) => a.idx - b.idx))
  return <BarItem>
    <For each={workspaces}>
      {workspace => <Workspace workspace={workspace} />}
    </For>
  </BarItem>
}

type WorkspaceProps = {
  workspace: AstalNiri.Workspace
}

function Workspace({ workspace }: WorkspaceProps) {
  const windows = createBinding(workspace, "windows")

  return <box>
    <label label={createBinding(workspace, "idx").as(String)} />
    <box>
      <For each={windows}>
        {(win) => {
          return <image icon_name={guessBarIcon(win)} />
        }}
      </For>
    </box>
  </box>
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
