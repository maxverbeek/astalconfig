import { Gtk } from "ags/gtk4";

export const theme = {
  bar: {
    spacing: 4,
    orientation: Gtk.Orientation.HORIZONTAL,
  },

  quicksettings: {
    transitionDuration: 200,
    buttonwidth: 200,
  },

  spacing: 10,

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

  check: 'check',
  bluetooth: 'lucide-bluetooth-symbolic',
  refresh: 'lucide-refresh-cw-symbolic',
  brightness: 'lucide-sun-symbolic'
}
