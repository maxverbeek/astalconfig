import Gtk from "gi://Gtk";
import { NetworkPage } from "./pages/network";
import { MainPage } from "./pages/main";
import { BluetoothPage } from "./pages/bluetooth";
import { VolumePage } from "./pages/volume";
import { createEffect, createState } from "ags";
import AstalNetwork from "gi://AstalNetwork?version=0.1";
import AstalBluetooth from "gi://AstalBluetooth?version=0.1";
import { theme } from "@/lib/constants";
export const [qs_page, qs_page_set] = createState("main");

export function QuickSettingsModule() {
  console.log("QuickSettings: initializing module");
  const network = AstalNetwork.get_default();
  const bluetooth = AstalBluetooth.get_default();

  return (
    <stack
      transitionDuration={theme.quicksettings.transitionDuration}
      class={"stack"}
      vhomogeneous={false}
      hhomogeneous={false}
      interpolate_size={true}
      transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
      $={(self) => {
        createEffect(() => {
          const page = qs_page();
          console.log(`QuickSettings: switching to page ${page}`);
          self.set_visible_child_name(page);
        });
      }}
    >
      <MainPage />
      {network.wifi !== null && <NetworkPage />}
      {bluetooth.adapter !== null && <BluetoothPage />}
      <VolumePage />
    </stack>
  );
}
