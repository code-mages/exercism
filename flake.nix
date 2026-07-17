{
  description = "Exercism website (fork) - development shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };

        # The Gemfile requires Ruby ~> 3.4.0; nixpkgs ruby_3_4 tracks the 3.4.x
        # series. If your app needs an exact patch, pin nixpkgs accordingly.
        ruby = pkgs.ruby_3_4;

        # Shared libraries that native gems link/dlopen at build and run time:
        #   mysql2 -> libmysqlclient   rugged -> libgit2/openssl/libssh2
        #   nokogiri -> libxml2/libxslt  ruby-vips -> vips  (+ icu, zlib, yaml)
        nativeLibs = with pkgs; [
          libmysqlclient
          openssl
          libssh2
          libgit2
          zlib
          libyaml
          libxml2
          libxslt
          icu
          vips
        ];
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            ruby
            nodejs_20
            yarn

            # native-gem build toolchain
            cmake
            pkg-config
            gnumake
            gcc

            # runtime binaries the app shells out to
            graphicsmagick
            vips

            # process orchestration (Procfile.dev) + websocket server
            hivemind
            anycable-go

            # dev conveniences / service clients
            jq
            redis
            mariadb.client
            docker-compose
          ] ++ nativeLibs;

          shellHook = ''
            # Keep gems inside the project (nix store ruby is read-only).
            export GEM_HOME="$PWD/.nix-gems"
            export GEM_PATH="$GEM_HOME"
            export PATH="$GEM_HOME/bin:$PWD/bin:$PATH"
            export BUNDLE_PATH="vendor/bundle"

            # Help native gem builds find headers/libs from the nix store.
            export PKG_CONFIG_PATH="${pkgs.lib.makeSearchPathOutput "dev" "lib/pkgconfig" nativeLibs}:$PKG_CONFIG_PATH"
            export LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath nativeLibs}:''${LD_LIBRARY_PATH:-}"

            export EXERCISM_ENV="development"

            if [ ! -x "$GEM_HOME/bin/bundle" ]; then
              echo "==> Installing bundler 2.6.9 into $GEM_HOME"
              gem install bundler -v 2.6.9 --no-document
            fi

            echo ""
            echo "Exercism dev shell ready.  ruby $(ruby -e 'print RUBY_VERSION'), node $(node -v)"
            echo "First-time setup:"
            echo "  1) docker compose up -d --wait      # start MySQL/Redis/OpenSearch/LocalStack"
            echo "  2) bin/setup                         # bundle + yarn + provision LocalStack + db:prepare"
            echo "  3) ./bin/dev                         # run all app processes"
            echo ""
          '';
        };
      });
}
