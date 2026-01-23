import { icons } from "@/lib/constants";
import Brightness from "@/services/brightness";
import { QSSlider } from "@/widget/QSSlider";
import { createBinding } from "ags";

const brightness = Brightness.get_default()!

export default function BrightnessSlider() {
  const level = createBinding(brightness, "screen");

  return (
    <QSSlider
      level={level}
      icon={icons.brightness}
      onChangeValue={(value) => (brightness.screen = value)}
    />
  );
}
