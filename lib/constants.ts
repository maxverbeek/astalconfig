import { Gtk } from "ags/gtk4";

export const theme = {
  bar: {
    spacing: 10,
    itemspacing: 6,
    height: 40,
    orientation: Gtk.Orientation.HORIZONTAL,
  },

  notifications: {
    spacebetween: 16,
    spacing: 8,
    timeoutseconds: 3,
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
    small: 16,
    normal: 24,
  },

  usage: {
    revealThreshold: 0.8,
    mediumThreshold: 0.6,
    highThreshold: 0.9,
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
  close: 'lucide-x-symbolic',

  bluetooth: {
    on: 'lucide-bluetooth-symbolic',
    off: 'lucide-bluetooth-off-symbolic',
    connected: 'lucide-bluetooth-connected-symbolic',
    searching: 'lucide-bluetooth-searching-symbolic',
  },
  refresh: 'lucide-refresh-cw-symbolic',
  brightness: 'lucide-sun-symbolic',
  cpu: 'lucide-cpu-symbolic',
  memory: 'lucide-memory-symbolic',

  battery: {
    order: [
      'lucide-battery-warning-symbolic',
      'lucide-battery-symbolic',
      'lucide-battery-low-symbolic',
      'lucide-battery-medium-symbolic',
      'lucide-battery-full-symbolic',
    ],

    // interpretation: larger than 0 -> order[0].. larger than 0.1 -> order[1].. larger than 0.25 -> order[2] etc...
    // these values are weird because the battery icon has 3 cells and im choosing switch point so that the actual battery
    // value is closest to the value that a cell represents (1/3, 2/3, 3/3) with some outliers at the bottom because
    // there are some critical icons.
    levels: [0, 0.1, 1 / 6, 0.5, 5 / 6],

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
  },

  sound: {
    headphones: 'lucide-headphones-symbolic',
    microphone: 'lucide-microphone-symbolic',
  }
}
