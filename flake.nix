{
  # Nix dev-shell for this repository.
  #
  # `nix/managed.nix` is GENERATED: it is the union of the native tools this
  # repository's enabled validators declare, expressed as a function of
  # `pkgs`. Guard owns that file and rewrites it; everything else here is
  # yours, including whatever you append to the packages list below.
  description = "Dev shell for this repository";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      nixpkgs,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          # Language runtime, package manager and git. Do NOT add
          # pkgs.corepack here: it pins an older node than
          # nodejs_24, and pnpm is declared outright below.
          packages = (import ./nix/managed.nix pkgs) ++ [
            pkgs.nodejs_24
            pkgs.pnpm_10
            pkgs.git
          ];
        };
      }
    );
}
