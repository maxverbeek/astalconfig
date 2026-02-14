# Astal configuration

Eternally work in progress.. Currently contains:

- a Niri workspaces implementation (auto detects monitors via Niri as well).
- Laptop stuff (Wifi, brightness, battery)
- Bluetooth & Audio stuff (needs some renaming, currently the menu component is called bluetooth menu)
- Tray
- CPU & Memory usage

## Disclaimer

I rewrote this entirely in Gtk4 taking heavy inspiration from [delta-shell](https://github.com/sinomor/delta-shell).
Some parts of this bar are copied verbatim from that project. Most of that has been slightly modified to match my own
preferences. This project, unlike delta-shell, is not intended for people to use for themselves. Of course while you are
free to do so, I cannot help you if stuff doesn't work. That said, the out of the box experience with Nix should be
pretty good, and there are no external dependencies (shell scripts etc that are being called) beyond the Astal libraries
that are bundled via Nix. If something doesn't work you are free to make an issue or a pull request, but no guarantees
that I have time to look at it.

## Workspaces (left side of the bar)

![image](https://github.com/user-attachments/assets/622fbbf1-b048-4ba0-af14-baaafdb6bdb8)

Currently there is no Niri implementation yet in Astal, so the way this communicates with Niri is through the IPC in a custom typescript client.
The client is by no means well implemented, and I fully intend to replace it when something better comes out. This has some interesting features
however:

- Displays workspaces as pill/island groups
- Inside of each workspace group, display the index (matches the keybinds that I set up in my niri config, Super+123456789)
- For each application running in a workspace, also display the icon of that application so that I can get an overview of what
  is running where.
- The applications on each workspace are ordered by position
- The currently active application icon is highlighted so you know where you are in the workspace.

## Bar components (right side of the bar)

![image](https://github.com/user-attachments/assets/27f5021e-6fa2-4d30-b12b-2c7a81bfeba6)

- `ResourceUsage.tsx`
  Shows CPU and memory usage. When CPU or memory are not excessively used this component folds to just the icons. It
  reveals the percentages on hover, or if the usage becomes large.

- `KubernetesContext.tsx`
  I put the kubernetes cluster that my `kubectl` points to on the bar so that I can easily see whether I'm going to break a
  staging cluster or a production cluster ;). This is updated by a file monitor on `~/.kube/config` so it doesn't invoke
  kubectl many times.

- `modules/quicksettings/barbutton.tsx`
  Opens the quicksettings menu. I should probably organise the directory structure a bit better.. This just shows
  battery, wifi and bluetooth status. Click on it to open the menu..

- `Tray.tsx`
  Tray stuff.. may get rid of this if my quicksettings menu becomes good enough (still cannot select a VPN using
  AstalNetwork).

- `Clock.tsx`
  Format is configurable in constants.tsx


## NixOS

This repo comes with a flake.nix which provides an overlay you can easily use in your NixOS configuration. To use it: apply the overlay to your nixpkgs in your flake.nix:


```nix
{
  description = "your flake.nix";
  inputs = {
    nixpkgs.url = "nixpkgs";
    ags.url = "github:maxverbeek/astalconfig";
  };

  outputs = { ... }:

  # somewhere in your flake, where you create your nixpkgs:
  let nixpkgs = import nixpkgs { inherit system; overlays = [ ags.overlays.default ]; } in {}
}
```

I personally run this stuff through a systemd service using the following systemd module:

```nix
{ pkgs, ... }:
{
  systemd.user.services.ags = {
    Unit = {
      Description = "Astal (ags) bar";
      Wants = [ "niri.service" ];
      After = [ "niri.service" ];
    };
    Install = {
      WantedBy = [ "graphical-session.target" ];
    };
    Service = {
      ExecStart = "${pkgs.ags-max}/bin/ags-max";
      Restart = "always";
      RestartSec = "1s";
    };
  };
}
```

I also install the ags cli tool (re-exported from the same overlay) so that I can use it to make requests to my ags
instance:

```nix
{
  # home-manager example
  home.packages = [ pkgs.ags ];

  # or
  environment.systemPackages = [ pkgs.ags ];
}
```

> [!IMPORTANT]
> I set the instance name of my Ags instance to something custom so that I can open another instance when developing.
> This means that any commands made with the ags cli will not work unless you specify this instance name. By default
> this is set to the package name, which is set to `ags-max` (you can override it from the overlay). If you want to open
> the launcher you need to use the `-i` flag:
>
> ```sh
> ags -i ags-max toggle launcher
> ```

## Future module ideas

- Google calendar thing (would have to write a google oauth client in Vala probably) to display upcoming meetings
- Something to keep track of tickets maybe
- Gitlab merge request list (stuff where I am asked for a review)
