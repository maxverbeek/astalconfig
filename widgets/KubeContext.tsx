import { createBinding } from "gnim"
import KubernetesCluster from "../services/kubernetes"

function KubeContext() {
  const kubernetes = KubernetesCluster.get_default()

  const clustername = createBinding(kubernetes, "clusterName")(name => name ?? 'Unknown')
  const classname = createBinding(kubernetes, "isProduction")(isprod => isprod ? 'kubernetes prod' : 'kubernetes')

  return <box class={classname}>
    <image icon_name="kubernetes" />
    <label label={clustername} />
  </box>
}


export default KubeContext
