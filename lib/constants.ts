import { Gtk } from "ags/gtk4";
import { indexForLevel } from "./utils";

export const theme = {
  bar: {
    spacing: 10,
    itemspacing: 5,
    height: 40,
    orientation: Gtk.Orientation.HORIZONTAL,
  },

  quicksettings: {
    transitionDuration: 200,
    buttonwidth: 200,
  },

  clock: {
    dateformat: '%a %d %b',
    timeformat: '%H:%M',
  },

  spacing: 10,

  workspaces: {
    spacing: 5,
    showEmpty: false
  },

  window: {
    padding: 15,
  },

  "icon-size": {
    normal: 24,
  }
}

export const icons = {
  arrow: {
    left: "lucide-chevron-left-symbolic",
    right: "lucide-chevron-right-symbolic",
    down: "lucide-chevron-down-symbolic",
    up: "lucide-chevron-up-symbolic",
  },

  powermenu: {
    sleep: "ds-moon-symbolic",
    reboot: "ds-refresh-cw-symbolic",
    logout: "ds-log-out-symbolic",
    shutdown: "ds-power-symbolic",
  },

  workspaces: {
    unknown_icon: "lucide-asterisk-symbolic"
  },

  check: 'check',
  bluetooth: {
    on: 'lucide-bluetooth-symbolic',
    off: 'lucide-bluetooth-off-symbolic',
    connected: 'lucide-bluetooth-connected-symbolic',
    searching: 'lucide-bluetooth-searching-symbolic',
  },
  refresh: 'lucide-refresh-cw-symbolic',
  brightness: 'lucide-sun-symbolic',

  battery: {
    order: [
      'lucide-battery-warning-symbolic',
      'lucide-battery-symbolic',
      'lucide-battery-low-symbolic',
      'lucide-battery-medium-symbolic',
      'lucide-battery-full-symbolic',
    ],

    levels: [0, 0.1, 0.25, 0.4, 0.75],

    charging: 'lucide-battery-charging-symbolic',
  },

  wifi: {
    order: [
      'lucide-wifi-zero-symbolic',
      'lucide-wifi-low-symbolic',
      'lucide-wifi-high-symbolic',
      'lucide-wifi-symbolic',
    ],

    levels: [0, 0.25, 0.50, 0.75],

    off: 'lucide-wifi-off-symbolic',
    syncing: 'lucide-wifi-sync-symbolic',
  }
}
