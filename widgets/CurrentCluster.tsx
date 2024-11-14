import KubernetesCluster from "../service/kubernetes"
import { bind } from "astal"

const k8s = KubernetesCluster.get_default()

export default function CurrentCluster() {
  return <box
    className="CurrentCluster"
  /* visible={bind(k8s, 'isProduction')} */
  >
    <icon icon="kubernetes" />
    <label label={bind(k8s, 'clusterName').as(cn => cn ?? 'Unknown')} />
  </box>
}
