import { theme } from "@/lib/constants";
import { Gtk } from "ags/gtk4";
import VolumeSlider from "./items/volumeSlider";
import BrightnessSlider from "./items/brightnessSlider";

export function QSSliders() {
  const sliders = [<VolumeSlider />, <BrightnessSlider />]

  return (
    <box
      spacing={theme.spacing}
      orientation={Gtk.Orientation.VERTICAL}
      class={"sliders"}
    >
      {sliders}
    </box>
  );
}
