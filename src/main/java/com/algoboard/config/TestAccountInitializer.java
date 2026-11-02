package com.algoboard.config;

import com.algoboard.entities.User;
import com.algoboard.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.test-account.enabled", havingValue = "true")
public class TestAccountInitializer implements ApplicationRunner {

    public static final String TEST_EMAIL = "abcd";
    public static final String TEST_PASSWORD = "abcd";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public TestAccountInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        User user = userRepository.findByEmailIgnoreCase(TEST_EMAIL);
        if (user == null) {
            user = new User();
            user.setEmail(TEST_EMAIL);
            user.setFirstName("Dummy");
            user.setLastName("User");
            user.setCodeforcesUsername("");
            user.setAtcoderUsername("");
            user.setCodechefUsername("");
            user.setLeetcodeUsername("");
        }

        if (user.getPassword() == null || !passwordEncoder.matches(TEST_PASSWORD, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(TEST_PASSWORD));
        }

        userRepository.save(user);
    }
}
