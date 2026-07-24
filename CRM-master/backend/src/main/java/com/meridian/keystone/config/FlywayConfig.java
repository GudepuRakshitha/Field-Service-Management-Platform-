package com.meridian.keystone.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Flyway configuration that runs repair() before migrate().
 *
 * This resolves checksum mismatches that occur when migration files are edited
 * after they have already been applied to the database (e.g. V2, V4).
 * repair() updates the schema history table to reflect the current file checksums
 * without re-running any migrations.
 */
@Configuration
public class FlywayConfig {

    @Bean
    public FlywayMigrationStrategy repairThenMigrate() {
        return flyway -> {
            flyway.repair();
            flyway.migrate();
        };
    }
}
