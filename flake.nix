{
  inputs = {
    nixpkgs.url = "nixpkgs";
    utils.url = "github:numtide/flake-utils";
    ags.url = "github:Aylur/ags?ref=v2";
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
      in
      {
        devShell = pkgs.mkShell {
          name = "devshell";
          packages = [
            (ags.packages.${system}.ags.override { extraPackages = [ ags.packages.${system}.hyprland ]; })
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
