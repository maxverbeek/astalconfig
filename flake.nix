{
  inputs = {
    nixpkgs.url = "nixpkgs";
    utils.url = "github:numtide/flake-utils";
    ags.url = "github:Aylur/ags/v2.3.0";
    ags.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs =
    {
      self,
      nixpkgs,
      utils,
      ags,
    }:
    utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        dev = pkgs.writeScriptBin "dev" ''
          #!/usr/bin/env zsh

          while ${pkgs.inotify-tools}/bin/inotifywait -e CREATE -r .; do
            ags quit
            ags run &
          done
        '';
      in
      {
        packages.ags = ags.packages.${system}.agsFull;
        packages.ags-max =
          (import nixpkgs {
            inherit system;
            overlays = [ self.overlays.${system}.default ];
          }).ags-max;

        overlays.default = prev: final: {
          ags-max = prev.stdenv.mkDerivation rec {
            name = "ags-max";
            src = ./.;

            nativeBuildInputs = with prev; [
              wrapGAppsHook
              gobject-introspection
              self.packages.${prev.system}.ags
            ];

            buildInputs =
              let
                agspkgs = ags.packages.${prev.system};
              in
              [
                final.gjs
                agspkgs.apps
                agspkgs.astal3
                agspkgs.battery
                agspkgs.bluetooth
                agspkgs.gjs
                agspkgs.io
                agspkgs.mpris
                agspkgs.network
                agspkgs.notifd
                agspkgs.tray
                agspkgs.wireplumber
              ];

            installPhase = ''
              runHook preInstall

              mkdir -p $out/bin

              ags bundle app.ts $out/bin/${name} -d "APPNAME='${name}'"

              chmod +x $out/bin/${name}

              # if the first line is not a shebang, make it so
              if ! head -n 1 "$out/bin/${name}" | grep -q "^#!"; then
                sed -i '1i #!/${pkgs.gjs}/bin/gjs -m' "$out/bin/${name}"
              fi

              runHook postInstall
            '';
          };
        };

        devShell = pkgs.mkShell {
          name = "devshell";
          packages = [
            ags.packages.${system}.agsFull
            ags.packages.${system}.io
            ags.packages.${system}.battery
            ags.packages.${system}.notifd
            pkgs.inotify-tools
            dev
          ];
          #
          # propagatedBuildInputs = [
          #   ags.packages.${system}.ags
          #   ags.packages.${system}.hyprland
          # ];
        };
      }
    );
}
