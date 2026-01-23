import { Gtk } from "ags/gtk4";
import { QSSliders } from "../sliders";
import { QSButtons } from "../buttons";
import AstalBattery from "gi://AstalBattery?version=0.1";
import { createBinding } from "ags";
import { theme, icons } from "@/lib/constants";

const battery = AstalBattery.get_default();

function Power() {
  return (
    <button
      class={"qs-header-button"}
      tooltipText={"Power Menu"}
      focusOnClick={false}
    >
      <image iconName={icons.powermenu.shutdown} pixelSize={20} />
    </button>
  );
}

function Battery() {
  return (
    <button
      cssClasses={["qs-header-button", "battery-button"]}
      visible={createBinding(battery, "isPresent")}
      focusOnClick={false}
    >
      <box spacing={theme.spacing}>
        <image iconName={battery.icon_name} pixelSize={24} />
        <label
          label={createBinding(battery, "percentage").as(
            (p) => `${Math.floor(p * 100)}%`,
          )}
        />
      </box>
    </button>
  );
}

export function Header() {
  return (
    <box spacing={theme.spacing} class={"header"} hexpand={false}>
      <Battery />
    </box>
  );
}

export function MainPage() {
  return (
    <box
      $type={"named"}
      name={"main"}
      class={"qs-main-page"}
      orientation={Gtk.Orientation.VERTICAL}
      spacing={theme.spacing}
    >
      <Header />
      <QSButtons />
      <QSSliders />
      {/* <MprisPlayers /> */}
    </box>
  );
}
