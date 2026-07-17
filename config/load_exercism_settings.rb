# Populate Exercism.config / Exercism.secrets as early as possible: the
# environment config (config/environments/*.rb) reads values like website_url
# and websockets_url while the framework boots, which is before
# config/initializers/*.rb run. This file is required from config/application.rb
# right after Bundler.require, so the values exist before anything reads them.
#
# In development the overrides come from config/settings.local.yml (unchanged
# behaviour). Elsewhere we load config/settings.defaults.yml (dummy values for
# every key, so boot never hits an undefined key) and then the real overrides
# from EXERCISM_SETTINGS_FILE (e.g. a mounted k8s Secret). The exercism-config
# gem only reads from AWS when EXERCISM_ENV is 'production'; we run it as
# 'development' so it uses its bundled settings and these overrides instead.
require "yaml"

rails_env = ENV["RAILS_ENV"] || ENV["RACK_ENV"] || "development"
config_dir = __dir__

settings_files =
  if rails_env == "development"
    [File.join(config_dir, "settings.local.yml")]
  else
    [File.join(config_dir, "settings.defaults.yml"), ENV["EXERCISM_SETTINGS_FILE"]]
  end

settings_files.compact.each do |file|
  next unless File.exist?(file)

  YAML.load_file(file).tap do |settings|
    (settings["config"] || {}).each do |key, value|
      Exercism.config.send("#{key}=", value.freeze)
    end
    (settings["secrets"] || {}).each do |key, value|
      Exercism.secrets.send("#{key}=", value.freeze)
    end
  end
end

Exercism.config.api_host = "http://local.exercism.io:3020/api".freeze if rails_env == "development"
