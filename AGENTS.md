# AI Agent Instructions — Codemages Exercism fork

> `CLAUDE.md` is a symlink to this file (upstream `Unify agents #8187`), so both names
> resolve here. Edit `AGENTS.md`; do not replace the symlink.

This is a **self-hosted fork of `exercism/website`**, run by the Codemages org. It
diverges from upstream in important ways; read this before making changes.

## What this fork is

- **Self-hosted, single instance** at `https://exercism.apps.aintools.ru`. Not exercism.org.
- **Auth: GitHub OAuth only.** Discord OAuth removed; local email/password login and
  sign-up are disabled (the Devise controllers redirect to GitHub). Accounts are created
  via the GitHub omniauth callback.
- **Custom tracks only.** `db/seeds.rb` creates zero upstream tracks (see "Adding a track").
- **Russian-only UI.** `switch_locale!` forces `:ru`, `config.i18n.default_locale = :ru`,
  and frontend `app/javascript/i18n/i18n.ts` sets `lng: 'ru'` (browser detection removed).
  `en` is kept only as a silent i18next fallback for untranslated keys.
- **Everyone is an insider.** `User::Data#insider? = true` (reached from `User` via
  `method_missing` delegation).
- **No donation prompts.** Footer `.nfp` plaque and the header `announcement_bar` removed.
- **No server-side test-runner / tooling pipeline.** Learners solve locally with the CLI:
  `exercism configure -a https://exercism.apps.aintools.ru/api/v2 -t <token>`
  (token from `/settings/api_cli`). NOTE: base URL is **`/api/v2`**, not `/api/v1`.
  The full CLI-facing API (`solutions/:uuid/submissions`, `iterations`, ...) is under the
  `scope :v2` block in `config/routes/api.rb`; `/api/v1` only exposes a stripped-down
  `solutions#show/update`, so `/api/v1` lets `download` work but makes `submit` 404 (HTML).
- **Submission storage = LocalStack S3 via a bridge.** `Submission::File`
  (`app/models/submission/file.rb`) uploads file content to `Exercism.s3_client`, whose
  endpoint the `exercism-config` gem **hardcodes** to `http://localhost:3040` for
  `EXERCISM_ENV=development` (ignoring `AWS_ENDPOINT_URL`). The cluster runs LocalStack
  (`exercism-localstack:4566`, S3+SQS+DynamoDB, accepts the gem's `FAKE` creds). A `socat`
  **`s3-bridge` sidecar** on `web` + `sidekiq` forwards `127.0.0.1:3040` → LocalStack, so
  `exercism submit` uploads without an image rebuild. Buckets (`exercism-submissions`,
  `exercism-attachments`) are created by the `exercism-aws-setup` Job. Without the bridge,
  submit 500s with `Seahorse::Client::NetworkingError`.

## Repos & deployment

- `origin` = `github.com/code-mages/exercism` (private). `upstream` = `exercism/website`.
- **GitOps**: `github.com/code-mages/codemages-cluster` (ArgoCD app-of-apps). Our manifests:
  `infrastructure/exercism/` + `apps/exercism.yaml` there.
- Runs on **k3s on `aiserver1`** (SSH alias; single node; `kubectl` works as user `rence`).
  Namespace `exercism`. Ingress: a Traefik **IngressRoute** on entryPoint `web`
  (host ports 8080/8443; the edge sets `X-Forwarded-Proto`, so `force_ssl` is fine).
- **Images**: `ghcr.io/code-mages/exercism-{rails,nginx}`, built by
  `.github/workflows/build-images.yml` on push to `main`. Private packages; the cluster
  pulls via the `ghcr-pull` dockerconfigjson secret (attached to the ns default SA).
- **CD is pull-based (ArgoCD)** — the LAN cluster is unreachable from GitHub runners. The
  `exercism` ArgoCD app is **manual sync**. To ship app code: push `main` → wait for the
  image build to go green → `kubectl -n exercism rollout restart deploy/exercism-{web,sidekiq,anycable-rpc}`
  (they run `:latest` + `imagePullPolicy: Always`). Re-`sync` the ArgoCD app only when the
  manifests changed. After UI/locale/track changes, clear caches:
  `kubectl -n exercism exec deploy/exercism-web -- bundle exec rails runner "Rails.cache.clear"`.
- **Out-of-band secrets** (NOT in git): `exercism-settings` (app config/secrets) and
  `ghcr-pull` — `kubectl apply`-ed directly.
- SSH / kubectl / curl-to-cluster commands run through the sandbox and need it disabled.

## AWS-free configuration (critical)

Upstream loads `Exercism.config`/`Exercism.secrets` from AWS Secrets Manager in production;
this fork has no AWS:

- The image sets **`EXERCISM_ENV=development`** (while `RAILS_ENV=production`), so the
  `exercism-config` gem reads local files instead of AWS.
- **`config/settings.defaults.yml`** provides dummy values for *every* config/secret key,
  so boot never hits an undefined key.
- **`config/load_exercism_settings.rb`** is required from `config/application.rb` **right
  after `Bundler.require`** (before environment config / initializers read values). It
  loads the defaults, then overrides from `EXERCISM_SETTINGS_FILE` (a mounted k8s Secret in
  prod; `config/settings.local.yml` in dev).
- Asset hosts default to `""` → relative `/assets/…` URLs (esbuild bakes
  `WEBSITE_ASSETS_HOST` at build time).

## Fresh database

Do **not** migrate from zero — Exercism's historical *data* migrations assume seed data and
abort on an empty custom-tracks-only DB. The web pod boots via **`lib/prepare_database.rb`**:
`db:schema:load` (FK checks off) on an empty DB, migrations otherwise. Never seeds.

## Dev environment (NixOS)

`nix develop` (flake) for the Ruby 3.4.x / Node 20 toolchain, then `docker compose up -d`
for MySQL 5.7 / Redis / OpenSearch / LocalStack, `bin/setup`, `./bin/dev`. See
`docs/context/dev-nix.md`. The Gemfile Ruby pin is relaxed to `~> 3.4.0`; prod still builds
on `ruby:3.4.4`. (This supersedes the upstream "install host MySQL/Redis" instructions.)

## Adding a track

Tracks are separate git repos synced by `Git::SyncTrack`. Bootcamp-format courses under
`~/code/lessons/tracks/` are converted with `~/code/lessons/convert_track.py`. A track repo
MUST have:

- root `config.json` with `active: true` and `status.concept_exercises: true`;
- each concept dir with `concepts/<slug>/.meta/config.json` carrying a `blurb` (NOT NULL);
- a `hello-world` practice exercise (`TrackWelcomeModal` hardcodes
  `Exercise.for(track, 'hello-world')`, so joining 500s without it);
- **stable UUIDs** (uuid5 from slug) so re-syncs are idempotent (random uuids duplicate);
- **prerequisites that only point backward** (to earlier exercises' concepts) — forward
  refs make the concept map cyclic → `TrackHasCyclicPrerequisiteError` (500).

Deploy: push the (public) track repo, then in a pod run
`Git::SyncTrack.(Track.find_by(slug: '<slug>'), force_sync: true)`. `Track::Create` also
works but its `CreateForumCategory` step errors (no Discourse) — non-fatal.

## Key changed files (fork)

- Auth: `app/models/user.rb`, `config/initializers/devise.rb`, `config/routes.rb`,
  `app/controllers/auth/*`, `app/views/devise/{sessions,registrations}/new.html.haml`.
- Tracks: `db/seeds.rb`.
- Locale: `app/controllers/application_controller.rb`, `config/application.rb`,
  `app/javascript/i18n/i18n.ts` (+ `config/locales/**/ru.yml`, `app/javascript/i18n/ru/`).
- Insiders: `app/models/user/data.rb`.
- Donations: `app/views/components/footer/shared.html.haml`,
  `app/helpers/view_components/site_header.rb`.
- Build/config: `docker/rails.Dockerfile` (EXERCISM_ENV, optional GeoIP, no NPM_TOKEN),
  `config/settings.defaults.yml`, `config/load_exercism_settings.rb`, `lib/prepare_database.rb`.

---

# Upstream reference (still applies)

Comprehensive docs live in `docs/context/` (`overview.md`, `commands.md`, `API.md`,
`testing/`, etc.). Reference the relevant one when working on a feature.

## Validation commands

- Tests: `bin/rails test` (Minitest + FactoryBot). JS: `yarn test`. Lint: `bin/rubocop -a`.
  Security: `bin/brakeman`. Linting/security run via the git pre-commit hook.
- Full Ruby suite ~10-15 min, system tests ~15-20 min, JS ~2-3 min. Never cancel.

## Code patterns

- **Command pattern (Mandate)**: business logic in `app/commands/`, invoked as
  `User::Update.(user, params)`; keep controllers thin with `.on_success`/`.on_failure`.
- **Testing**: FactoryBot (`create :user` / `build :user`), Minitest, Capybara for system.
- **API**: `/api` for authenticated public endpoints (CLI, frontend), `/spi` for internal
  services; Bearer-token auth; delegate to commands.

## Git

- Don't use `git -C <path>`; `cd` into the directory first (worktrees + hooks).
