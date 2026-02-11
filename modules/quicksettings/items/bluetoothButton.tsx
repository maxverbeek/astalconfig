import { icons } from "@/lib/constants";
import { QSButton } from "@/widget/QSButton";
import { createBinding, createComputed } from "ags";
import AstalBluetooth from "gi://AstalBluetooth?version=0.1";
import { qs_page_set } from "../quicksettings";

const bluetooth = AstalBluetooth.get_default()!

export default function BluetoothButton() {
  const powered = createBinding(bluetooth, "isPowered");
  const connected = createBinding(bluetooth, "isConnected");
  const devices = createBinding(bluetooth, "devices");
  const device = createComputed(
    () => (connected(), devices().find((device) => device.connected)),
  );

  return (
    <QSButton
      icon={icons.bluetooth.on}
      label={"Bluetooth"}
      subtitle={device((d) => (d ? d.alias : "None"))}
      arrow={"separate"}
      onClicked={() => bluetooth.toggle()}
      onArrowClicked={() => qs_page_set("bluetooth")}
      ArrowClasses={powered((p) => {
        const classes = ["arrow"];
        p && classes.push("active");
        return classes;
      })}
      ButtonClasses={powered((p) => {
        const classes = ["qs-button-box-arrow"];
        p && classes.push("active");
        return classes;
      })}
    />
  );
}
