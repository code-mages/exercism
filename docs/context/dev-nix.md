# Local Development (Nix shell + Docker services)

This fork runs local dev as: **app processes on the host inside a Nix dev shell,
backing services in Docker.** This mirrors the upstream `bin/dev` design and
keeps the fragile bits (native gem builds, the exercism-config LocalStack
wiring) working without extra glue. The container images used for k3s are a
separate concern (see [k3s deployment](#k3s-deployment) below).

## Prerequisites

- Nix with flakes enabled (`experimental-features = nix-command flakes`).
- Docker with the Compose plugin (`docker compose ...`).

All frontend dependencies are on the public npm registry, so no token or
`.npmrc` is needed. (The private `@juliangarnierorg/anime-beta` beta was
swapped for the public `animejs` v4 package.)

## First-time setup

```bash
# 1. Enter the toolchain (Ruby 3.4.x, Node 20, native libs, hivemind, anycable-go)
nix develop            # or `direnv allow` once, then it auto-loads via .envrc

# 2. Start the backing services (MySQL 5.7, Redis, OpenSearch, LocalStack)
docker compose up -d --wait

# 3. Install deps, provision LocalStack (S3/SQS/DynamoDB), prepare the DB
bin/setup
```

`bin/setup` runs `setup_exercism_config` + `setup_exercism_local_aws` (which
provision the AWS resources inside LocalStack) and `rails db:prepare`.

## Day-to-day

```bash
nix develop
./bin/dev      # docker compose up --wait, yarn install, then hivemind Procfile.dev
```

`./bin/dev` brings the services up and runs every app process (Rails server on
:3020, Sidekiq, AnyCable RPC, anycable-go WS on :3334, CSS/JS watchers).

Stop services with `docker compose down` (keep data) or `docker compose down -v`
(wipe the MySQL/OpenSearch/LocalStack volumes for a clean slate).

## Service wiring

| Service    | Image                                 | Host port(s)        | Notes |
|------------|---------------------------------------|---------------------|-------|
| MySQL      | `mysql:5.7`                           | 3306                | user/pw `exercism`; dev+test DBs created by `docker/dev/mysql-init.sql` |
| Redis      | `redis:7-alpine`                      | 6379                | sidekiq/cache/anycable/tooling all share it |
| OpenSearch | `opensearchproject/opensearch:2.11.0` | 9200                | single-node, security plugin disabled |
| LocalStack | `localstack/localstack:2.3.2`         | 3040, 3041, 3042    | 4566 gateway mapped to 3040/3041, web UI on 3042 (matches upstream `bin/dev`) |

The app reads its endpoints from `Exercism.config.*`. The development defaults
already target `localhost`, so no override file is needed. To point at
different hosts/ports, create `config/settings.local.yml`:

```yaml
config:
  mysql_master_endpoint: 127.0.0.1
  mysql_port: 3306
  sidekiq_redis_url: redis://127.0.0.1:6379/0
  cache_redis_url: redis://127.0.0.1:6379/1
  anycable_redis_url: redis://127.0.0.1:6379/2
  tooling_redis_url: redis://127.0.0.1:6379/3
  anycable_rpc_host: 127.0.0.1:50051
```

## Ruby version note

The Gemfile is relaxed to `ruby '~> 3.4.0'` so the Nix shell's 3.4.x is
accepted (the lockfile was pinned to `3.4.4p34`). Production still builds on
`ruby:3.4.4-bullseye`. If your `nix develop` Ruby drifts off the 3.4 series,
pin `nixpkgs` in `flake.nix` to a revision that ships the version you want.

## k3s deployment

Local dev does **not** feed the k3s deploy; the container images do. The repo
already ships production Dockerfiles:

- `docker/rails.Dockerfile` - the Rails app (web + Sidekiq + AnyCable RPC all
  run from this image via different entrypoints). Requires build args
  `GEOIP_ACCOUNT_ID`, `GEOIP_LICENSE_KEY`, `BUNDLER_VERSION`.
- `docker/anycable-go.Dockerfile` - the WebSocket server.
- `docker/nginx.Dockerfile` + `docker/nginx.conf` - static/asset proxy.

A minimal k3s topology maps directly onto the dev processes/services:

- **Deployments** (from `rails.Dockerfile`, different commands): `web`
  (`bin/start_webserver`), `sidekiq` (`bundle exec sidekiq`), `anycable-rpc`
  (`bundle exec anycable`). Plus `anycable-go` and `nginx` Deployments.
- **Data services**: MySQL, Redis, OpenSearch as StatefulSets (or point at
  managed/external instances). In production the AWS pieces (S3/SQS/DynamoDB)
  are real AWS, not LocalStack.
- **Config**: everything under `Exercism.config.*` and `Exercism.secrets.*` is
  supplied via a ConfigMap + Secret and consumed by the exercism-config gem
  (anyway_config reads matching env vars). Set the MySQL/Redis/OpenSearch
  service DNS names and AWS credentials there.
- **Ingress**: routes `/` to nginx/web and the WebSocket path to `anycable-go`.
- **Job**: run `rails db:prepare` (and track sync) as a one-shot Job/initContainer.

The k3s manifests themselves are not in this repo yet; the images and the
process/service boundaries above are what they wrap.
