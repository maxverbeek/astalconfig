import { Gtk } from "ags/gtk4";
import { createBinding, For } from "ags";
import AstalWp from "gi://AstalWp?version=0.1";
import Pango from "gi://Pango?version=1.0";
import { theme, icons } from "@/lib/constants";
import { qs_page_set } from "../quicksettings/quicksettings";
import { getAppInfo } from "@/lib/utils";

const wp = AstalWp.get_default()!;

function Header({ showArrow = false }: { showArrow?: boolean }) {
  return (
    <box class={"header"} spacing={theme.spacing}>
      {showArrow && (
        <button
          cssClasses={["qs-header-button", "qs-page-prev"]}
          focusOnClick={false}
          onClicked={() => qs_page_set("main")}
        >
          <image
            iconName={icons.arrow.left}
            pixelSize={theme["icon-size"].normal}
          />
        </button>
      )}
      <label
        label={"Volume"}
        halign={Gtk.Align.START}
        valign={Gtk.Align.CENTER}
      />
      <box hexpand />
    </box>
  );
}

function StreamsList() {
  const audio = wp.audio!;
  const streams = createBinding(audio, "streams");

  return (
    <box
      orientation={Gtk.Orientation.VERTICAL}
      spacing={theme.spacing}
      visible={streams((l) => l.length > 0)}
    >
      <label label={"Applications"} halign={Gtk.Align.START} />
      <For each={streams}>
        {(stream) => {
          const name = createBinding(stream, "name");
          const app = getAppInfo(stream.description);
          const volume = createBinding(stream, "volume");

          return (
            <box
              spacing={theme.spacing}
              cssClasses={["slider-box", "volume-box"]}
            >
              <image
                iconName={
                  app?.icon_name ||
                  stream.icon ||
                  "audio-volume-high-symbolic"
                }
                pixel_size={24}
              />
              <box
                orientation={Gtk.Orientation.VERTICAL}
                spacing={theme.spacing / 2}
              >
                <label
                  label={name(
                    (name) =>
                      `${app?.name || stream.description}: ${name}`,
                  )}
                  halign={Gtk.Align.START}
                  ellipsize={Pango.EllipsizeMode.END}
                />
                <slider
                  onChangeValue={({ value }) => {
                    stream.volume = value;
                  }}
                  hexpand
                  value={volume}
                />
              </box>
            </box>
          );
        }}
      </For>
    </box>
  );
}

function DefaultOutput() {
  const audio = wp.audio!;
  const defaultOutput = audio.defaultSpeaker;
  const volume = createBinding(defaultOutput, "volume");
  const speakers = createBinding(audio, "speakers");
  const description = createBinding(defaultOutput, "description")(d => d || '');

  let popover: Gtk.Popover;

  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={theme.spacing}>
      <label label={"Output"} halign={Gtk.Align.START} />
      <button
        onClicked={(self) => {
          popover.set_parent(self);
          popover.popup();
        }}
        class={"dropdown"}
        focusOnClick={false}
      >
        <box hexpand>
          <label
            label={description}
            hexpand
            halign={Gtk.Align.START}
            ellipsize={Pango.EllipsizeMode.END}
          />
          <image
            iconName={icons.arrow.down}
            pixelSize={theme["icon-size"].normal}
          />
        </box>
      </button>
      <popover hasArrow={false} $={(self) => (popover = self)}>
        <box
          orientation={Gtk.Orientation.VERTICAL}
          spacing={theme.spacing / 2}
        >
          <For each={speakers}>
            {(speaker) => (
              <button
                class={createBinding(speaker, 'is_default')(d => d ? 'default-audio-device' : '')}
                onClicked={() => {
                  speaker.set_is_default(true);
                  popover.hide();
                }}
              >
                <label
                  label={speaker.description}
                  halign={Gtk.Align.START}
                />
              </button>
            )}
          </For>
        </box>
      </popover>
      <box
        cssClasses={["slider-box", "volume-box"]}
        spacing={theme.spacing}
        valign={Gtk.Align.CENTER}
      >
        <image
          iconName={defaultOutput.icon}
          pixelSize={theme["icon-size"].normal}
          valign={Gtk.Align.CENTER}
          halign={Gtk.Align.START}
        />
        <slider
          onChangeValue={({ value }) => defaultOutput.set_volume(value)}
          hexpand
          value={volume}
        />
      </box>
    </box>
  );
}

function DefaultMicrophone() {
  const audio = wp.audio!;
  const defaultMicrophone = audio.defaultMicrophone;
  const volume = createBinding(defaultMicrophone, "volume");
  const microphones = createBinding(audio, "microphones");
  const description = createBinding(defaultMicrophone, "description")(d => d || '');

  let popover: Gtk.Popover;

  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={theme.spacing}>
      <label label={"Microphone"} halign={Gtk.Align.START} />
      <button
        onClicked={(self) => {
          popover.set_parent(self);
          popover.popup();
        }}
        class={"dropdown"}
        focusOnClick={false}
      >
        <box hexpand>
          <label
            label={description}
            hexpand
            halign={Gtk.Align.START}
            ellipsize={Pango.EllipsizeMode.END}
            maxWidthChars={25}
          />
          <image
            iconName={icons.arrow.down}
            pixelSize={theme["icon-size"].normal}
          />
        </box>
      </button>
      <popover hasArrow={false} $={(self) => (popover = self)}>
        <box
          orientation={Gtk.Orientation.VERTICAL}
          spacing={theme.spacing / 2}
        >
          <For each={microphones}>
            {(microphone) => (
              <button
                class={createBinding(microphone, 'is_default')(d => d ? 'default-audio-device' : '')}
                onClicked={() => {
                  microphone.set_is_default(true);
                  popover.hide();
                }}
              >
                <label
                  label={microphone.description}
                  halign={Gtk.Align.START}
                />
              </button>
            )}
          </For>
        </box>
      </popover>
      <box
        cssClasses={["slider-box", "volume-box"]}
        spacing={theme.spacing}
        valign={Gtk.Align.CENTER}
      >
        <image
          iconName={defaultMicrophone.icon}
          pixelSize={theme["icon-size"].normal}
          valign={Gtk.Align.CENTER}
          halign={Gtk.Align.START}
        />
        <slider
          onChangeValue={({ value }) =>
            defaultMicrophone.set_volume(value)
          }
          hexpand
          value={volume}
        />
      </box>
    </box>
  );
}

function List() {
  return (
    <Gtk.ScrolledWindow
      vscrollbar_policy={Gtk.PolicyType.AUTOMATIC}
      propagate_natural_height
      max_content_height={500}
    >
      <box
        orientation={Gtk.Orientation.VERTICAL}
        spacing={theme.spacing * 2}
        vexpand
      >
        <DefaultOutput />
        <DefaultMicrophone />
        <StreamsList />
      </box>
    </Gtk.ScrolledWindow>
  );
}

export function VolumeModule({ showArrow = false }: { showArrow?: boolean }) {
  console.log("Volume: initializing module");

  return (
    <box
      class={"volume"}
      widthRequest={410 - theme.window.padding * 2}
      orientation={Gtk.Orientation.VERTICAL}
      spacing={theme.spacing}
    >
      <Header showArrow={showArrow} />
      <List />
    </box>
  );
}
