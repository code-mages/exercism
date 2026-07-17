# Load config/secret overrides from a YAML file (keys under "config:" and
# "secrets:"). In development this is config/settings.local.yml; in other
# environments point EXERCISM_SETTINGS_FILE at a mounted file (e.g. a k8s
# Secret). This lets the self-hosted deploy run RAILS_ENV=production while
# sourcing config from a file instead of AWS (the exercism-config gem only hits
# AWS Secrets Manager when EXERCISM_ENV is 'production').
settings_files =
  if Rails.env.development?
    [Rails.root / "config/settings.local.yml"]
  else
    # Baked defaults (dummy values for every key) first, so boot never hits an
    # undefined config/secret key, then the real overrides from the mounted file.
    [Rails.root / "config/settings.defaults.yml", ENV["EXERCISM_SETTINGS_FILE"]]
  end

settings_files.compact.each do |settings_file|
  next unless File.exist?(settings_file)

  YAML.load_file(settings_file).tap do |settings|
    (settings["config"] || {}).each do |key, value|
      Exercism.config.send("#{key}=", value.freeze)
    end
    (settings["secrets"] || {}).each do |key, value|
      Exercism.secrets.send("#{key}=", value.freeze)
    end
  end
end

# In development the API host is always local; elsewhere it comes from the
# settings file above (api_host key).
Exercism.config.api_host = "http://local.exercism.io:3020/api".freeze if Rails.env.development?

module Exercism
  # We'll store the request context for easy access from commands
  # without having to pass it all the way down from the controller
  cattr_accessor :request_context

  # TODO: Move this upstream
  class ToolingJob
    def execution_exception
      data.fetch(:execution_exception, nil)
    end
  end
end

# Becuase Rails tests are run in transactions, :read_committed breaks
# in tests, so we set a constant here to use instead.
Exercism::READ_COMMITTED = Rails.env.test? ? nil : :read_committed
Exercism::READ_UNCOMMITTED = Rails.env.test? ? nil : :read_uncommitted

module ScrollAxis
  X = "X".freeze
  Y = "X".freeze
end
