import { Gdk, Gtk } from "ags/gtk4";
import { onCleanup } from "ags";
import app from "ags/gtk4/app";
import {
  attachHoverScroll,
} from "../lib/utils";
import { theme } from "../lib/constants";

type FormatData = Record<string, JSX.Element>;

type BarItemProps = JSX.IntrinsicElements["box"] & {
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

function parseFormat(format: string, data: FormatData): JSX.Element[] {
  const regex = /\{([^:}]+):?([^}]*)\}|([^{}]+)/g;

  return format
    .split(" ")
    .filter((group) => group.trim() !== "")
    .map((group) => {
      const matches = Array.from(group.matchAll(regex));

      const elements = matches.map((match) => {
        const [_, key, size, text] = match;

        if (key) {
          const trimmedKey = key.trim();
          if (data && trimmedKey in data) {
            return data[trimmedKey];
          }
          return <label label={`{${trimmedKey}}`} hexpand={isVertical} />;
        }

        return <label label={text} hexpand={isVertical} />;
      });

      if (elements.length === 1) {
        return elements[0];
      }

      return <box>{elements}</box>;
    });
}

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
  window = "",
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
  const content = format ? parseFormat(format, data) : children;

  return (
    <box
      class={"bar-item"}
      $={(self) => {
        if (window) {
          const appconnect = app.connect("window-toggled", (_, win) => {
            if (win.name === window) {
              self[win.visible ? "add_css_class" : "remove_css_class"](
                "active",
              );
            }
          });
          onCleanup(() => app.disconnect(appconnect));

          attachHoverScroll(self, ({ dy }) => {
            handleScroll(dy, onScrollUp, onScrollDown);
          });
        }
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
        {content}
      </box>
    </box>
  );
}
