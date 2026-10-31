package com.algoboard.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class DatabaseUrlConfigTest {

    @Test
    void convertsNeonUrlAndExtractsCredentials() {
        MockEnvironment environment = new MockEnvironment();
        environment.setProperty("DATABASE_URL",
                "postgresql://neondb_owner:secret%40password@example.neon.tech/neondb?sslmode=require&channel_binding=require");

        new DatabaseUrlConfig().postProcessEnvironment(environment, null);

        assertEquals(
                "jdbc:postgresql://example.neon.tech/neondb?sslmode=require&channel_binding=require",
                environment.getProperty("spring.datasource.url"));
        assertEquals("neondb_owner", environment.getProperty("spring.datasource.username"));
        assertEquals("secret@password", environment.getProperty("spring.datasource.password"));
    }

    @Test
    void leavesJdbcUrlUnchanged() {
        MockEnvironment environment = new MockEnvironment();
        environment.setProperty("DATABASE_URL",
                "jdbc:postgresql://example.neon.tech/neondb?sslmode=require");

        new DatabaseUrlConfig().postProcessEnvironment(environment, null);

        assertNull(environment.getProperty("spring.datasource.url"));
    }
}
