import GObject, { register, getter } from "ags/gobject"
import { monitorFile, readFileAsync } from "ags/file"
import GLib from "gi://GLib"

const home = GLib.getenv('HOME')!
const kubeconfigPath = `${home}/.kube/config`

@register({ GTypeName: "KubernetesCluster" })
export default class KubernetesCluster extends GObject.Object {

  static instance: KubernetesCluster
  static get_default() {
    if (!this.instance) {
      this.instance = new KubernetesCluster()
    }

    return this.instance
  }

  #clusterName: string | null = null
  #isProduction: boolean = false

  @getter(String)
  get clusterName() { return this.#clusterName || "" }

  @getter(Boolean)
  get isProduction() { return this.#isProduction }

  constructor() {
    super()

    this.#clusterName = null

    monitorFile(kubeconfigPath, async _file => {
      this.sync()
    })

    this.sync()
  }

  private async sync() {
    const contents = await readFileAsync(kubeconfigPath)
    const match = contents.match(/^current-context: ([^\s]+)\s*$/m)

    if (match && match[1]) {
      this.#clusterName = this.getClusterName(match[1])
      this.#isProduction = this.determineProd(this.#clusterName)
    } else {
      this.#clusterName = null
      this.#isProduction = false
    }

    this.notify('cluster-name')
    this.notify('is-production')
  }

  private getClusterName(fqdn: string) {
    const teleportMatch = fqdn.match(/^teleport\.\S+\.dev-(.+)$/)

    if (teleportMatch && teleportMatch[1]) {
      return teleportMatch[1]
    }

    return fqdn
  }

  private determineProd(name: string) {
    return name.includes('master') || name.includes('prod') || name === 'rs-devops'
  }
}
