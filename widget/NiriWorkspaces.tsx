import { Gdk } from "ags/gtk4";
import BarItem, { BarItemProps } from "./BarItem";

type NiriWorkspacesProps = {
  gdkmonitor: Gdk.Monitor
} & BarItemProps

export default function NiriWorkspaces({ gdkmonitor, ...rest }: NiriWorkspacesProps) {
  return <BarItem {...rest}></BarItem>
}
