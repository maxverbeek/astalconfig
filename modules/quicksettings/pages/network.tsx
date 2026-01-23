import { Gtk } from "ags/gtk4";
import { theme } from "@/lib/constants";
import { NetworkModule } from "@/modules/network/network";

export function NetworkPage() {
  return (
    <box
      $type={"named"}
      name={"network"}
      class={"qs-menu-page"}
      orientation={Gtk.Orientation.VERTICAL}
      spacing={theme.spacing}
    >
      <NetworkModule showArrow />
    </box>
  );
}
