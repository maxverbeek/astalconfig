import { App, Astal, Gdk, Gtk } from "astal/gtk3"
import { bind, Variable } from "astal"
import Apps from "gi://AstalApps"
import { Entry, Window } from "astal/gtk3/widget"

export const AppLauncherWindowName = 'applauncher'

function closeIfVisible() {
  const launcher = App.get_window(AppLauncherWindowName)!

  if (launcher.visible) {
    App.toggle_window(AppLauncherWindowName)
  }
}

function keyPressEventListener(window: Window, event: Gdk.Event) {
  const k = event.get_keyval()[1]

  if (k === Gdk["KEY_Escape"]) {
    closeIfVisible()
  }
}

const apps = new Apps.Apps({
  nameMultiplier: 3,
  executableMultiplier: 2,
  entryMultiplier: 2
})

const results = Variable(apps.fuzzy_query(""))

function openFirstResult(_entry: Entry) {
  const res = results.get()

  if (res.length > 0) {
    res[0].launch()
  }

  closeIfVisible()
}

function Launcher() {
  return <box vertical>
    <entry
      className="Entry"
      hexpand
      onChanged={({ text }) => results.set(apps.fuzzy_query(text))}
      onActivate={openFirstResult}
      setup={(self) => {
        // bit annoying but i cannot get a reference to this entry thingy to reset the text otherwise
        self.hook(App, 'window-toggled', (_, win) => {
          if (win.name === AppLauncherWindowName && !win.visible) {
            self.set_text("")
          }
        })
      }}
    ></entry>
    <scrollable vscroll={Gtk.PolicyType.NEVER}>
      <box vertical>{bind(results).as((applications) => applications.map(AppEntry))}</box>
    </scrollable>
  </box>
}

// Application type is not exported??
type Application = ReturnType<typeof apps.fuzzy_query>[number]

function AppEntry(application: Application) {
  return <box className="AppEntry">
    <icon icon={application.iconName}></icon><label label={application.name}></label>
  </box>
}

export default function Applauncher() {
  return <window
    name={AppLauncherWindowName}
    className="Applauncher"
    visible={false}
    keymode={Astal.Keymode.EXCLUSIVE}
    setup={(self) => {
      App.add_window(self)
      self.hook(self, 'key-press-event', keyPressEventListener)
    }}
  >
    <Launcher></Launcher>
  </window>
}
