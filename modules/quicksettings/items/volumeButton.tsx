import { QSButton } from "@/widget/QSButton";
import { createBinding, createComputed } from "ags";
import AstalWp from "gi://AstalWp?version=0.1";
import { qs_page_set } from "../quicksettings";

const wp = AstalWp.get_default();

export default function VolumeButton() {
  const speaker = wp.get_default_speaker();
  const mute = createBinding(speaker, "mute");
  const volume = createBinding(speaker, "volume");
  const level = createComputed(() => {
    if (mute()) return "";
    else return `${Math.floor(volume() * 100)}%`;
  });

  const volumeUp = () => speaker.set_volume(speaker.volume + 0.01)
  const volumeDown = () => speaker.set_volume(speaker.volume - 0.01)

  return (
    <QSButton
      icon={speaker.icon}
      label={"Volume"}
      subtitle={level((level) => (level !== "" ? level : "None"))}
      onClicked={() => speaker.set_mute(!speaker.get_mute())}
      onArrowClicked={() => qs_page_set("volume")}
      onScrollUp={() => volumeUp()}
      onScrollDown={() => volumeDown()}
      arrow={"separate"}
      ArrowClasses={mute((p) => {
        const classes = ["arrow"];
        !p && classes.push("active");
        return classes;
      })}
      ButtonClasses={mute((p) => {
        const classes = ["qs-button-box-arrow"];
        !p && classes.push("active");
        return classes;
      })}
    />
  );
}
