import { Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import AstalApps from "gi://AstalApps?version=0.1";
import AstalNiri from "gi://AstalNiri?version=0.1";

type ScrollInfo = {
  dx: number;
  dy: number;
  hovered: boolean;
  shift: boolean;
}

type ScrollHandler = (info: ScrollInfo) => void;

export function attachHoverScroll(box: Gtk.Box, onScroll: ScrollHandler): void {
  let hovered = false;

  const motion = new Gtk.EventControllerMotion();
  motion.connect("enter", () => (hovered = true));
  motion.connect("leave", () => (hovered = false));
  box.add_controller(motion);

  const scrollCtrl = new Gtk.EventControllerScroll({
    flags:
      Gtk.EventControllerScrollFlags.VERTICAL |
      Gtk.EventControllerScrollFlags.DISCRETE,
  });

  scrollCtrl.connect("scroll", (_ctrl, dx, dy) => {
    if (!hovered) return Gdk.EVENT_PROPAGATE;

    const state = _ctrl.get_current_event_state?.() ?? 0;
    const shift = (state & Gdk.ModifierType.SHIFT_MASK) !== 0;

    onScroll({ dx, dy, hovered, shift });

    return Gdk.EVENT_STOP;
  });

  scrollCtrl.set_propagation_phase(Gtk.PropagationPhase.BUBBLE);
  box.add_controller(scrollCtrl);
}

export function toggleWindow(name: string): void {
  const win = app.get_window(name);
  if (!win) {
    console.warn(`Window "${name}" not found`);
    return;
  }

  if (win.visible) {
    win.hide();
  } else {
    win.show();
  }
}

export function toggleQsModule(name: string): void {
  toggleWindow("quicksettings");
  qs_page_set(name);
}

const appInfoCache = new Map<string, AstalApps.Application | null>();
const MAX_CACHE_SIZE = 50;

let appManager: AstalApps.Apps | null = null;

function getAppManager(): AstalApps.Apps {
  if (!appManager) {
    appManager = new AstalApps.Apps();
  }
  return appManager;
}

function addToCache(key: string, value: AstalApps.Application | null): void {
  if (appInfoCache.size >= MAX_CACHE_SIZE) {
    const firstKey = appInfoCache.keys().next().value;
    if (firstKey) appInfoCache.delete(firstKey);
  }
  appInfoCache.set(key, value);
}

function findAppInList(
  appId: string,
  appList: AstalApps.Application[],
): AstalApps.Application | null {
  const searchTerm = appId.toLowerCase();

  for (const app of appList) {
    if (
      app.entry?.toLowerCase() === searchTerm ||
      app.iconName === appId ||
      app.name === appId ||
      app.wm_class === appId
    ) {
      return app;
    }
  }

  for (const app of appList) {
    if (app.entry?.toLowerCase().includes(searchTerm)) {
      return app;
    }
  }

  return null;
}

export function getAppInfo(appId: string): AstalApps.Application | null {
  if (!appId) return null;

  if (appInfoCache.has(appId)) {
    return appInfoCache.get(appId)!;
  }

  const manager = getAppManager();
  const appList = manager.get_list();

  const match = findAppInList(appId, appList);

  addToCache(appId, match);
  return match;
}

export function guessBarIcon(win: AstalNiri.Window): string {
  const appInfo = getAppInfo(win.app_id)

  if (win.title.endsWith('Nvim')) {
    return 'neovim'
  }

  if (!appInfo) {
    return "unknown-app-symbolic"
  }

  return appInfo.icon_name
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {

  let inThrottle: boolean = false;
  let lastArgs: Parameters<T> | null = null;
  let lastContext: ThisParameterType<T> | null = null;

  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this;

    if (inThrottle) {
      // Queue the latest arguments for the trailing edge execution
      lastArgs = args;
      lastContext = context;
    } else {
      // Leading edge execution
      func.apply(context, args);
      inThrottle = true;

      const handleTimeout = () => {
        if (lastArgs) {
          // Trailing edge execution
          func.apply(lastContext, lastArgs);
          lastArgs = null;
          lastContext = null;

          // Restart the cycle
          setTimeout(handleTimeout, limit);
        } else {
          inThrottle = false;
        }
      };

      setTimeout(handleTimeout, limit);
    }
  };
}
