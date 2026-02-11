import KubernetesCluster from "@/services/kubernetes";
import { createBinding, createComputed } from "gnim";
import BarItem from "./BarItem";
import { theme } from "@/lib/constants";

const kubernetes = KubernetesCluster.get_default()!

export default function KubernetesContext() {
  const clustername = createBinding(kubernetes, 'clusterName')
  const visible = createComputed(() => clustername() !== '')

  return <BarItem class="bar-item no-hover" visible={visible}>
    <box spacing={theme.bar.itemspacing}>
      <image class="kubernetes-icon" icon_name="kubernetes" />
      <label label={clustername} />
    </box>
  </BarItem>
}
