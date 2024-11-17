{
  inputs = {
    nixpkgs.url = "nixpkgs";
    utils.url = "github:numtide/flake-utils";
    ags.url = "github:Aylur/ags";
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
