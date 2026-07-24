package com.meridian.keystone;

import com.meridian.keystone.domain.User;
import com.meridian.keystone.repository.UserRepository;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Disabled("Remote DB test")
@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:postgresql://db.aqrgpxvadfroyvqactrn.supabase.co:5432/postgres?sslmode=require",
    "spring.datasource.username=postgres",
    "spring.datasource.password=Rakshithareddyboss",
    "spring.flyway.enabled=true",
    "spring.flyway.baseline-on-migrate=true",
    "spring.flyway.baseline-version=0"
})
public class SupabaseConnectionTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void fixAndVerifyAllPasswords() {
        String validHash = passwordEncoder.encode("password123");
        System.out.println("GENERATED VALID BCRYPT HASH FOR password123: " + validHash);

        List<User> users = userRepository.findAll();
        for (User u : users) {
            u.setPasswordHash(validHash);
            userRepository.save(u);
        }

        User admin = userRepository.findByEmail("admin@meridian.com").orElse(null);
        assertNotNull(admin);
        boolean matches = passwordEncoder.matches("password123", admin.getPasswordHash());
        System.out.println("=================================================");
        System.out.println(">>> UPDATED ADMIN BCRYPT MATCH RESULT: " + matches);
        System.out.println("=================================================");
        assertTrue(matches);
    }
}
