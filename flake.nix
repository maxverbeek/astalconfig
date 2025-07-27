{
  description = "My Awesome Desktop Shell";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";

    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      ags,
    }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
      pname = "my-shell";
      entry = "app.tsx";

      astalPackages = with ags.packages.${system}; [
        apps
        io
        astal4 # or astal3 for gtk3
        battery
        bluetooth
        io
        mpris
        network
        notifd
        powerprofiles
        tray
        wireplumber
      ];

      extraPackages = astalPackages ++ [
        pkgs.libadwaita
        pkgs.libsoup_3
      ];
    in
    {
      packages.${system} = {
        default = pkgs.stdenv.mkDerivation {
          name = pname;
          src = ./.;

          nativeBuildInputs = with pkgs; [
            wrapGAppsHook
            gobject-introspection
            ags.packages.${system}.default
          ];

          buildInputs = extraPackages ++ [ pkgs.gjs ];

          installPhase = ''
            runHook preInstall

            mkdir -p $out/bin
            mkdir -p $out/share
            cp -r * $out/share
            ags bundle ${entry} $out/bin/${pname} -d "SRC='$out/share'"

            runHook postInstall
          '';
        };
      };

      devShells.${system} = {
        default = pkgs.mkShell {
          # buildInputs = [
          #   (ags.packages.${system}.default.override {
          #     inherit extraPackages;
          #   })
          # ] ++ extraPackages;
          buildInputs = [
            ags.packages.${system}.agsFull
            ags.packages.${system}.astal4
            ags.packages.${system}.bluetooth
            ags.packages.${system}.wireplumber
            ags.packages.${system}.notifd
            pkgs.gjs
            pkgs.libadwaita
            pkgs.libsoup_3
          ];
        };
      };
    };
}
