import { Gdk, Gtk } from "ags/gtk4";
import {
  attachHoverScroll,
} from "../lib/utils";
import { theme } from "../lib/constants";

type FormatData = Record<string, JSX.Element>;

export type BarItemProps = JSX.IntrinsicElements["box"] & {
  window?: string;
  children?: any;
  format?: string;
  data?: FormatData;
  onPrimaryClick?: string | null | Function;
  onSecondaryClick?: string | null | Function;
  onMiddleClick?: string | null | Function;
  onScrollDown?: string | null | Function;
  onScrollUp?: string | null | Function;
};

const isVertical = theme.bar.orientation === Gtk.Orientation.VERTICAL

function handleClick(
  button: number,
  onPrimary?: string | null | Function,
  onSecondary?: string | null | Function,
  onMiddle?: string | null | Function,
) {
  let handler: string | Function | null | undefined;

  if (button === Gdk.BUTTON_PRIMARY) handler = onPrimary;
  if (button === Gdk.BUTTON_SECONDARY) handler = onSecondary;
  if (button === Gdk.BUTTON_MIDDLE) handler = onMiddle;

  if (!handler || handler === "default") return;

  if (typeof handler === "function") {
    handler();
  }

  console.warn(`cannot execute ${handler}`)
}

function handleScroll(
  dy: number,
  onUp?: string | null | Function,
  onDown?: string | null | Function,
) {
  const handler = dy < 0 ? onUp : dy > 0 ? onDown : null;

  if (!handler || handler === "default") return;

  if (typeof handler === "function") {
    handler();
  }

  console.warn(`cannot execute ${handler}`)
}

export default function BarItem({
  children,
  format,
  data = {},
  onPrimaryClick = "default",
  onSecondaryClick = "default",
  onMiddleClick = "default",
  onScrollUp = "default",
  onScrollDown = "default",
  ...rest
}: BarItemProps) {
  return (
    <box
      class={"bar-item"}
      $={(self) => {
        attachHoverScroll(self, ({ dy }) => {
          handleScroll(dy, onScrollUp, onScrollDown);
        });
      }}
      {...rest}
    >
      <Gtk.GestureClick
        onPressed={(ctrl) => {
          handleClick(
            ctrl.get_current_button(),
            onPrimaryClick,
            onSecondaryClick,
            onMiddleClick,
          );
        }}
        button={0}
      />
      <box
        class={"content"}
        orientation={theme.bar.orientation}
        spacing={theme.bar.spacing}
        hexpand={isVertical}
      >
        {children}
      </box>
    </box>
  );
}
