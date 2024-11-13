import { AstalIO, Process, Variable } from "astal"
import GLib from "gi://GLib"

const home = GLib.getenv('HOME')!
const currentContext = Variable<string | null>(null)
const cluster = AstalIO.monitor_file(`${home}/.kube/config`, (file) => {

})

export default function CurrentCluster() {
  return <box>rs-devops</box>
}
