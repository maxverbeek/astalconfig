import GObject, { register, property } from "astal/gobject"
import { readFile, readFileAsync } from "astal/file"
import { interval } from "astal"
import GLib from "gi://GLib"

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

  #cpus: string[] = []
  #cpuUsage: number = 0
  #cpuStats: CpuTime = { total: 1, idle: 0 }
  #memory: MemoryUsage

  @property(Number)
  get cpuUsage() { return this.#cpuUsage }

  @property(Object)
  get memory() { return this.#memory }

  constructor() {
    super()

    // actually i'll ignore this because /proc/stat gives a total on the first line and i can't be bothered to add the individual CPU usages
    this.#cpus = this.findCPUs()
    this.#memory = this.getMemoryUsage()

    this.watchCPU()
    this.watchMemory()
  }

  private findCPUs(): string[] {
    const file = readFile("/sys/devices/system/cpu/present") // comma separated ranges like 1,2-3,5

    const numbers = file.split(",")
      .flatMap(range => {
        if (range.includes("-")) {
          const [start, end] = range.split("-").map(Number);
          return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        }
        return [Number(range)];
      });

    // we want strings because they're actually file paths
    return numbers.map(n => `${n}`)
  }

  private watchCPU() {
    this.#cpuStats = this.getCPUUsage()
    // 5 seconds
    interval(5000, () => {
      const usage = this.getCPUUsage()
      const dtotal = usage.total - this.#cpuStats.total
      const didle = usage.idle - this.#cpuStats.idle

      this.#cpuUsage = (dtotal - didle) / dtotal
      this.#cpuStats = usage

      this.notify('cpu-usage')
    })
  }

  private watchMemory() {
    // 20 seconds
    interval(20000, () => {
      const usage = this.getMemoryUsage()
      this.#memory = usage
      this.notify('memory')
    })
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
