import GObject, { register, getter } from "ags/gobject"
import { readFile } from "ags/file"

type MemoryUsage = { percentage: number, total: number, used: number, free: number, available: number }

type CpuTime = { total: number, idle: number }

@register({ GTypeName: "Usage" })
export default class Usage extends GObject.Object {

  static instance: Usage
  static get_default() {
    if (!this.instance) {
      this.instance = new Usage()
    }

    return this.instance
  }

  #cpuUsage: number = 0
  #cpuStats: CpuTime = { total: 1, idle: 0 }

  #memoryPercent: number = 0
  #memoryTotal: number = 0
  #memoryUsed: number = 0
  #memoryFree: number = 0
  #memoryAvailable: number = 0

  @getter(Number)
  get cpuUsage() { return this.#cpuUsage }

  @getter(Number)
  get memoryPercent() { return this.#memoryPercent }

  @getter(Number)
  get memoryTotal() { return this.#memoryTotal }

  @getter(Number)
  get memoryUsed() { return this.#memoryUsed }

  @getter(Number)
  get memoryFree() { return this.#memoryFree }

  @getter(Number)
  get memoryAvailable() { return this.#memoryAvailable }

  constructor() {
    super()

    this.setMemoryFields(this.getMemoryUsage())

    this.watchCPU()
    this.watchMemory()
  }

  private watchCPU() {
    this.#cpuStats = this.getCPUUsage()
    // 5 seconds
    setInterval(() => {
      const usage = this.getCPUUsage()
      const dtotal = usage.total - this.#cpuStats.total
      const didle = usage.idle - this.#cpuStats.idle

      this.#cpuUsage = (dtotal - didle) / dtotal
      this.#cpuStats = usage

      this.notify('cpu-usage')
    }, 5000)
  }

  private setMemoryFields(usage: MemoryUsage) {
    this.#memoryPercent = usage.percentage
    this.#memoryTotal = usage.total
    this.#memoryUsed = usage.used
    this.#memoryFree = usage.free
    this.#memoryAvailable = usage.available
  }

  private watchMemory() {
    // 20 seconds
    setInterval(() => {
      this.setMemoryFields(this.getMemoryUsage())
      this.notify('memory-percent')
      this.notify('memory-total')
      this.notify('memory-used')
      this.notify('memory-free')
      this.notify('memory-available')
    }, 20000)
  }

  private getCPUUsage(): CpuTime {
    const stat = readFile('/proc/stat')
    const cputotal = stat.slice(0, stat.indexOf("\n"))

    const cputotalTimes = cputotal.replace(/cpu\d*\s+(?=\d)/, '').split(' ').map(Number)
    const idle = cputotalTimes[3] + cputotalTimes[4]
    const total = cputotalTimes.reduce((a, b) => a + b, 0) // sum

    return { total, idle }
  }

  private getMemoryUsage(): MemoryUsage {
    const meminfo = readFile('/proc/meminfo')
      .split("\n")
      .map(line => this.parseMemoryLine(line))

    const dict = Object.fromEntries(meminfo.map(info => [info.name, info.usage]))

    const total = dict["MemTotal"]
    const free = dict["MemFree"]
    const available = dict["MemAvailable"]

    const used = total - free
    const percentage = (total - available) / total

    return { percentage, total, free, available, used }
  }

  private parseMemoryLine(line: string): { name: string, usage: number } {
    const name = line.slice(0, line.indexOf(':'))
    const usageKb = Number(line.slice(line.indexOf(':')).replace(/^\D/, '').replace(/ kB$/, ''))

    const usage = usageKb * 1024

    return { name, usage }
  }
}
