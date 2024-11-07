import Apps from "gi://AstalApps"
import { App, Astal, Gdk, Gtk } from "astal/gtk3"
import { Variable } from "astal"

const MAX_ITEMS = 8

function AppButton({ app }: { app: Apps.Application }) {
  return <button className="AppButton" onClicked={() => app.launch()}>
    <box>
      <icon icon={app.iconName} />
      <box valign={Gtk.Align.CENTER} vertical>
        <label
          className="name"
          truncate
          xalign={0}
          label={app.name}
        />
        {app.description && <label
          className="description"
          wrap
          xalign={0}
          label={app.description}
        />}
      </box>
    </box>
  </button>
}

export default function Applauncher() {
  const apps = new Apps.Apps({
    nameMultiplier: 3,
    executableMultiplier: 2,
    entryMultiplier: 2
  })
  const list = Variable(apps.fuzzy_query("").slice(0, MAX_ITEMS))
  const hide = () => App.get_window("launcher")!.hide()

  function search(text: string) {
    list.set(apps.fuzzy_query(text).slice(0, MAX_ITEMS))
  }

  function openfirst() {
    const first = list.get()[0]
    if (first) {
      first.launch()
      hide()
    }
  }

  return <window
    name="launcher"
    exclusivity={Astal.Exclusivity.IGNORE}
    keymode={Astal.Keymode.ON_DEMAND}
    application={App}
    visible={false}
    onShow={() => list.set(apps.get_list().slice(0, MAX_ITEMS))}
    onKeyPressEvent={function(self, event: Gdk.Event) {
      if (event.get_keyval()[1] === Gdk.KEY_Escape)
        App.toggle_window(self.name)
    }}>
    <box>
      <box hexpand={false} vertical>
        <box widthRequest={500} className="Applauncher" vertical>
          <entry
            placeholderText="Search"
            onChanged={({ text }) => search(text)}
            onActivate={() => openfirst()}
            setup={(self) => {
              // bit annoying but i cannot get a reference to this entry thingy to reset the text otherwise
              self.hook(App, 'window-toggled', (_, win) => {
                if (win.name === 'launcher' && !win.visible) {
                  self.set_text("")
                }
              })
            }}
          />
          <box spacing={6} vertical>
            {list(list => list.map(app => (
              <AppButton app={app} />
            )))}
          </box>
          <box visible={list(l => l.length === 0)}>
            <icon icon="system-search-symbolic" />
            No match found
          </box>
        </box>
      </box>
    </box>
  </window>
}
