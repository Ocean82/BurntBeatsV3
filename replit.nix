{ pkgs }: {
  deps = [
    pkgs.nodejs-20_x
    pkgs.python311
    pkgs.python311Packages.pip
    pkgs.python311Packages.numpy
    pkgs.python311Packages.scipy
    pkgs.python311Packages.torch
    pkgs.python311Packages.transformers
    pkgs.python311Packages.soundfile
    pkgs.python311Packages.librosa
    pkgs.postgresql_16
    pkgs.nodePackages.typescript
    pkgs.nodePackages.npm
  ];
}