# Idempotent database bring-up for both fresh and existing databases.
#
# Fresh DB (no applied migrations): load db/schema.rb directly, with foreign-key
# checks disabled (the schema defines tables with inline foreign keys that fail
# ordered creation on MySQL). This deliberately avoids running Exercism's
# historical DATA migrations, some of which assume seed data (e.g. a Cohort
# requires a Track) and abort on an empty, custom-tracks-only instance.
#
# Existing DB: run any pending migrations, guarding against concurrent runners
# (mirrors lib/run_migrations_with_concurrent_guard.rb).
#
# This never seeds: it is production bring-up, not dev fixtures.

def fresh_database?
  conn = ActiveRecord::Base.connection
  return true unless conn.data_source_exists?("schema_migrations")

  conn.select_value("SELECT COUNT(*) FROM schema_migrations").to_i.zero?
rescue StandardError
  true
end

if fresh_database?
  puts "Fresh database detected: loading db/schema.rb (foreign-key checks off)"
  conn = ActiveRecord::Base.connection
  conn.execute("SET FOREIGN_KEY_CHECKS = 0")
  begin
    load Rails.root.join("db", "schema.rb")
  ensure
    conn.execute("SET FOREIGN_KEY_CHECKS = 1")
  end
  puts "Schema loaded."
else
  begin
    # Offset concurrent runners against each other over 30s.
    sleep(rand * 30)

    migrations = ActiveRecord::Migration.new.migration_context.migrations
    ActiveRecord::Migrator.new(
      :up,
      migrations,
      ActiveRecord::Base.connection.schema_migration,
      ActiveRecord::Base.connection.internal_metadata
    ).migrate

    Rails.logger.info "Migrations ran cleanly"
  rescue ActiveRecord::ConcurrentMigrationError
    Rails.logger.info "Concurrent migration detected. Waiting to try again."
    retry
  end
end
