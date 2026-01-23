import { QSSlider } from "@/widget/QSSlider";
import { createBinding } from "ags";
import AstalWp from "gi://AstalWp?version=0.1";
import { qs_page_set } from "../quicksettings";
import { icons, theme } from "@/lib/constants";

const wp = AstalWp.get_default()!

export default function VolumeSlider() {
  const speaker = wp.get_default_speaker();
  const level = createBinding(speaker, "volume");

  return (
    <box spacing={theme.spacing}>
      <QSSlider
        level={level}
        icon={speaker.icon}
        onChangeValue={(value) => speaker.set_volume(value)}
      />
      <button
        onClicked={() => qs_page_set("volume")}
        class={"slider-button"}
        focusOnClick={false}
      >
        <image
          iconName={icons.arrow.right}
          pixelSize={theme["icon-size"].normal}
        />
      </button>
    </box>
  );
}

