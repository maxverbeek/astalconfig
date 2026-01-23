import { QSButton } from "@/widget/QSButton";
import { createBinding, createComputed } from "ags";
import AstalNetwork from "gi://AstalNetwork?version=0.1";
import { qs_page_set } from "../quicksettings";

const network = AstalNetwork.get_default();

export default function NetworkButton() {
  const wifi = network.wifi;
  const wired = network.wired;
  const connectivity = createBinding(network, "connectivity");
  const primary = createBinding(network, "primary");

  const enabled = createComputed(() => {
    connectivity();
    if (
      primary() === AstalNetwork.Primary.WIRED &&
      network.wired.internet === AstalNetwork.Internet.CONNECTED
    )
      return true;
    if (wifi !== null) return wifi.enabled;
  });

  const subtitle = createComputed(() => {
    connectivity();
    if (primary() === AstalNetwork.Primary.WIRED) {
      if (wired.internet === AstalNetwork.Internet.CONNECTED) {
        return "Wired";
      }
    }
    if (primary() === AstalNetwork.Primary.WIFI) {
      return wifi.ssid;
    }
    return "";
  });

  const networkIcon = createComputed(() => {
    if (primary() === AstalNetwork.Primary.WIFI) {
      return wifi.icon_name
    }

    if (primary() === AstalNetwork.Primary.WIRED) {
      return wired.icon_name
    }

    return ""
  })

  return (
    <QSButton
      icon={networkIcon}
      label={"Internet"}
      subtitle={subtitle((text) => (text !== "" ? text : "None"))}
      onClicked={() => {
        if (
          network.primary === AstalNetwork.Primary.WIFI ||
          network.primary === AstalNetwork.Primary.UNKNOWN
        ) {
          wifi.set_enabled(!wifi.enabled);
        }
      }}
      onArrowClicked={() => {
        wifi.scan();
        qs_page_set("network");
      }}
      arrow={network.wifi !== null ? "separate" : "none"}
      ArrowClasses={enabled((p) => {
        const classes = ["arrow"];
        p && classes.push("active");
        return classes;
      })}
      ButtonClasses={enabled((p) => {
        const classes = ["qs-button-box-arrow"];
        p && classes.push("active");
        return classes;
      })}
    />
  );
}
