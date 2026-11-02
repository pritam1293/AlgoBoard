package com.algoboard.services;

import com.algoboard.DTO.ContestDTO;
import com.algoboard.DTO.RequestDTO.PublicUserProfile;
import com.algoboard.DTO.RequestDTO.UserProfile;
import com.algoboard.entities.Atcoder;
import com.algoboard.entities.Codechef;
import com.algoboard.entities.Codeforces;
import com.algoboard.entities.Leetcode;
import com.algoboard.entities.User;
import com.algoboard.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@Service
public class UserService implements IUserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private static final String REGISTRATION_FAILED = "Registration could not be completed.";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CacheService cacheService;
    private final Validation validation;
    private final ProfileFetchingService profileFetchingService;
    private final ContestFetchingService contestFetchingService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
            CacheService cacheService, Validation validation, ProfileFetchingService profileFetchingService,
            ContestFetchingService contestFetchingService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.cacheService = cacheService;
        this.validation = validation;
        this.profileFetchingService = profileFetchingService;
        this.contestFetchingService = contestFetchingService;
    }

    @Override
    public UserProfile registerUser(User user) {
        try {
            String email = normalizeEmail(user.getEmail());
            user.setEmail(email);

            if (user.getFirstName() != null) {
                user.setFirstName(user.getFirstName().trim());
            }
            if (user.getLastName() != null) {
                user.setLastName(user.getLastName().trim());
            }
            user.setCodeforcesUsername(normalizePlatformUsername(user.getCodeforcesUsername(), "Codeforces"));
            user.setAtcoderUsername(normalizePlatformUsername(user.getAtcoderUsername(), "AtCoder"));
            user.setCodechefUsername(normalizePlatformUsername(user.getCodechefUsername(), "CodeChef"));
            user.setLeetcodeUsername(normalizePlatformUsername(user.getLeetcodeUsername(), "LeetCode"));

            if (email == null || email.isEmpty()) {
                throw new IllegalArgumentException("Email cannot be null or empty.");
            }
            if (userRepository.existsByEmailIgnoreCase(email)) {
                throw new IllegalArgumentException(REGISTRATION_FAILED);
            }
            if (!validation.isValidEmail(email)) {
                throw new IllegalArgumentException("Invalid email format.");
            }
            if (!validation.isValidPassword(user.getPassword())) {
                throw new IllegalArgumentException("Invalid password format.");
            }
            if (user.getFirstName() == null || user.getFirstName().isEmpty()) {
                throw new IllegalArgumentException("First name is required.");
            }
            if (!validation.isValidName(user.getFirstName())) {
                throw new IllegalArgumentException("Invalid first name format.");
            }
            if (user.getLastName() == null || user.getLastName().isEmpty()) {
                throw new IllegalArgumentException("Last name is required.");
            }
            if (!validation.isValidName(user.getLastName())) {
                throw new IllegalArgumentException("Invalid last name format.");
            }

            user.setId(null);
            user.setTokenVersion(0L);
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            userRepository.save(user);
            return createProfile(user);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException(REGISTRATION_FAILED);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Registration failed", e);
            throw new IllegalArgumentException(REGISTRATION_FAILED);
        }
    }

    @Override
    public UserProfile authenticateUser(String email, String password) {
        email = normalizeEmail(email);
        if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        User user = userRepository.findByEmailIgnoreCase(email);
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            return createProfile(user);
        }
        throw new IllegalArgumentException("Invalid email or password.");
    }

    @Override
    public UserProfile getUserProfile(String email) {
        try {
            User user = findUserByEmail(email);
            return createProfile(user);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Failed to retrieve user profile", e);
            throw new IllegalArgumentException("Unable to retrieve user profile.");
        }
    }

    @Override
    public PublicUserProfile getPublicProfile(String email) {
        try {
            User user = findUserByEmail(email);
            return createPublicProfile(user);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Failed to retrieve public profile", e);
            throw new IllegalArgumentException("Unable to retrieve user profile.");
        }
    }

    @Override
    public UserProfile updateUserDetails(UserProfile profile) {
        try {
            String email = normalizeEmail(profile.getEmail());
            if (email == null || email.isEmpty()) {
                throw new IllegalArgumentException("Email cannot be null or empty.");
            }
            User existingUser = userRepository.findByEmailIgnoreCase(email);
            if (existingUser == null) {
                throw new IllegalArgumentException("User not found.");
            }

            String firstName = profile.getFirstName() == null ? null : profile.getFirstName().trim();
            String lastName = profile.getLastName() == null ? null : profile.getLastName().trim();
            if (firstName == null || firstName.isEmpty()) {
                throw new IllegalArgumentException("First name is required.");
            }
            if (!validation.isValidName(firstName)) {
                throw new IllegalArgumentException("Invalid first name format.");
            }
            if (lastName == null || lastName.isEmpty()) {
                throw new IllegalArgumentException("Last name is required.");
            }
            if (!validation.isValidName(lastName)) {
                throw new IllegalArgumentException("Invalid last name format.");
            }

            existingUser.setFirstName(firstName);
            existingUser.setLastName(lastName);
            userRepository.save(existingUser);
            return createProfile(existingUser);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Failed to update user details", e);
            throw new IllegalArgumentException("Unable to update user details.");
        }
    }

    @Override
    public Map<String, String> updatePassword(String email, String oldPassword, String newPassword) {
        try {
            email = normalizeEmail(email);
            if (email == null || email.isEmpty()) {
                throw new IllegalArgumentException("Email cannot be null or empty.");
            }
            if (oldPassword == null || oldPassword.isEmpty()) {
                throw new IllegalArgumentException("Old password cannot be null or empty.");
            }
            if (newPassword == null || newPassword.isEmpty()) {
                throw new IllegalArgumentException("New password cannot be null or empty.");
            }
            if (!validation.isValidPassword(newPassword)) {
                throw new IllegalArgumentException("New password does not meet the required format.");
            }

            User user = userRepository.findByEmailIgnoreCase(email);
            if (user != null && passwordEncoder.matches(oldPassword, user.getPassword())) {
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setTokenVersion(user.getTokenVersion() + 1);
                userRepository.save(user);
                return Map.of(
                        "email", user.getEmail(),
                        "firstName", user.getFirstName());
            }
            throw new IllegalArgumentException("Invalid email or old password.");
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Failed to update password", e);
            throw new IllegalArgumentException("Unable to update password.");
        }
    }

    @Override
    public String deleteUser(String email, String password) {
        try {
            email = normalizeEmail(email);
            if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
                throw new IllegalArgumentException("Invalid email or password.");
            }
            User user = userRepository.findByEmailIgnoreCase(email);
            if (user != null && passwordEncoder.matches(password, user.getPassword())) {
                userRepository.delete(user);
                cacheService.evictAllProfileCaches(email);
                return "User deleted successfully.";
            }
            throw new IllegalArgumentException("Invalid email or password.");
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Failed to delete user", e);
            throw new IllegalArgumentException("Unable to delete account.");
        }
    }

    @Override
    public void revokeUserTokens(String email) {
        try {
            User user = findUserByEmail(email);
            user.setTokenVersion(user.getTokenVersion() + 1);
            userRepository.save(user);
        } catch (Exception e) {
            logger.warn("Unable to revoke tokens: {}", e.getClass().getSimpleName());
            throw new IllegalArgumentException("Unable to log out.");
        }
    }

    @Override
    public boolean addCPProfiles(String email, String codeforcesId, String atcoderId, String codechefId,
            String leetcodeId) {
        try {
            email = normalizeEmail(email);
            if (email == null || email.isEmpty()) {
                throw new IllegalArgumentException("Email cannot be null or empty.");
            }

            codeforcesId = normalizePlatformUsername(codeforcesId, "Codeforces");
            atcoderId = normalizePlatformUsername(atcoderId, "AtCoder");
            codechefId = normalizePlatformUsername(codechefId, "CodeChef");
            leetcodeId = normalizePlatformUsername(leetcodeId, "LeetCode");

            User user = userRepository.findByEmailIgnoreCase(email);
            if (user == null) {
                throw new IllegalArgumentException("User not found.");
            }

            String oldCodeforces = user.getCodeforcesUsername();
            String oldAtcoder = user.getAtcoderUsername();
            String oldCodechef = user.getCodechefUsername();
            String oldLeetcode = user.getLeetcodeUsername();

            boolean codeforcesChanged = codeforcesId != null
                    && !Objects.equals(codeforcesId, oldCodeforces);
            boolean atcoderChanged = atcoderId != null
                    && !Objects.equals(atcoderId, oldAtcoder);
            boolean codechefChanged = codechefId != null
                    && !Objects.equals(codechefId, oldCodechef);
            boolean leetcodeChanged = leetcodeId != null
                    && !Objects.equals(leetcodeId, oldLeetcode);

            if (codeforcesChanged) {
                user.setCodeforcesUsername(codeforcesId);
            }
            if (atcoderChanged) {
                user.setAtcoderUsername(atcoderId);
            }
            if (codechefChanged) {
                user.setCodechefUsername(codechefId);
            }
            if (leetcodeChanged) {
                user.setLeetcodeUsername(leetcodeId);
            }

            userRepository.save(user);

            if (codeforcesChanged) {
                cacheService.evictCodeforcesCache(email);
                evictCodeforcesUsername(oldCodeforces);
            }
            if (atcoderChanged) {
                cacheService.evictAtcoderCache(email);
                evictAtcoderUsername(oldAtcoder);
            }
            if (codechefChanged) {
                cacheService.evictCodechefCache(email);
                evictCodechefUsername(oldCodechef);
            }
            if (leetcodeChanged) {
                cacheService.evictLeetcodeCache(email);
                evictLeetcodeUsername(oldLeetcode);
            }
            return true;
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Failed to update CP profiles", e);
            throw new IllegalArgumentException("Unable to update platform profiles.");
        }
    }

    private void evictCodeforcesUsername(String username) {
        if (username != null && !username.isEmpty()) {
            cacheService.evictCodeforcesUsernameCache(username);
        }
    }

    private void evictAtcoderUsername(String username) {
        if (username != null && !username.isEmpty()) {
            cacheService.evictAtcoderUsernameCache(username);
        }
    }

    private void evictCodechefUsername(String username) {
        if (username != null && !username.isEmpty()) {
            cacheService.evictCodechefUsernameCache(username);
        }
    }

    private void evictLeetcodeUsername(String username) {
        if (username != null && !username.isEmpty()) {
            cacheService.evictLeetcodeUsernameCache(username);
        }
    }

    @Override
    @Cacheable(value = "contestList", key = "'all_contests'", unless = "#result == null || #result.isEmpty()")
    public List<ContestDTO> getContestList() {
        List<ContestDTO> allContests = new ArrayList<>();

        CompletableFuture<Void> cfFuture = CompletableFuture
                .runAsync(() -> contestFetchingService.getCodeforcesContestList(allContests));
        CompletableFuture<Void> ccFuture = CompletableFuture
                .runAsync(() -> contestFetchingService.getCodechefContestList(allContests));
        CompletableFuture<Void> acFuture = CompletableFuture
                .runAsync(() -> contestFetchingService.getAtcoderContestList(allContests));
        CompletableFuture<Void> lcFuture = CompletableFuture
                .runAsync(() -> contestFetchingService.getLeetcodeContestList(allContests));

        await(cfFuture, "Codeforces");
        await(ccFuture, "CodeChef");
        await(acFuture, "AtCoder");
        await(lcFuture, "LeetCode");

        allContests.sort(contestFetchingService::compareContestsByPriority);
        return allContests;
    }

    private void await(CompletableFuture<Void> future, String source) {
        try {
            future.get(8, TimeUnit.SECONDS);
        } catch (Exception e) {
            logger.warn("{} contest fetch timed out or failed", source);
        }
    }

    @Override
    @Cacheable(value = "codeforcesProfile", key = "'email:' + #email", unless = "#result == null || #result.username == null")
    public Codeforces getCodeforcesProfile(String email) {
        try {
            User user = findUserByEmail(email);
            String username = user.getCodeforcesUsername();
            if (username == null || username.isEmpty()) {
                return new Codeforces();
            }
            requireValidUsername(username);
            return profileFetchingService.fetchCodeforcesProfile(username);
        } catch (Exception e) {
            logger.warn("Codeforces profile lookup failed: {}", e.getClass().getSimpleName());
            throw new IllegalArgumentException("Unable to retrieve Codeforces profile.");
        }
    }

    @Override
    @Cacheable(value = "atcoderProfile", key = "'email:' + #email", unless = "#result == null || #result.username == null")
    public Atcoder getAtcoderProfile(String email) {
        try {
            User user = findUserByEmail(email);
            String username = user.getAtcoderUsername();
            if (username == null || username.isEmpty()) {
                return new Atcoder();
            }
            requireValidUsername(username);
            return profileFetchingService.fetchAtcoderProfile(username);
        } catch (Exception e) {
            logger.warn("AtCoder profile lookup failed: {}", e.getClass().getSimpleName());
            throw new IllegalArgumentException("Unable to retrieve AtCoder profile.");
        }
    }

    @Override
    @Cacheable(value = "codechefProfile", key = "'email:' + #email", unless = "#result == null || #result.username == null")
    public Codechef getCodechefProfile(String email) {
        try {
            User user = findUserByEmail(email);
            String username = user.getCodechefUsername();
            if (username == null || username.isEmpty()) {
                return new Codechef();
            }
            requireValidUsername(username);
            return profileFetchingService.fetchCodechefProfile(username);
        } catch (Exception e) {
            logger.warn("CodeChef profile lookup failed: {}", e.getClass().getSimpleName());
            throw new IllegalArgumentException("Unable to retrieve CodeChef profile.");
        }
    }

    @Override
    @Cacheable(value = "leetcodeProfile", key = "'email:' + #email", unless = "#result == null || #result.username == null")
    public Leetcode getLeetcodeProfile(String email) {
        try {
            User user = findUserByEmail(email);
            String username = user.getLeetcodeUsername();
            if (username == null || username.isEmpty()) {
                return new Leetcode();
            }
            requireValidUsername(username);
            return profileFetchingService.fetchLeetcodeProfile(username);
        } catch (Exception e) {
            logger.warn("LeetCode profile lookup failed: {}", e.getClass().getSimpleName());
            throw new IllegalArgumentException("Unable to retrieve LeetCode profile.");
        }
    }

    @Override
    @Cacheable(value = "codeforcesProfile", key = "'user:' + #cfusername", unless = "#result == null || #result.username == null")
    public Codeforces fetchCodeforcesProfile(String cfusername) {
        try {
            cfusername = normalizePlatformUsername(cfusername, "Codeforces");
            if (cfusername == null || cfusername.isEmpty()) {
                throw new IllegalArgumentException("Codeforces username cannot be null or empty.");
            }
            return profileFetchingService.fetchCodeforcesProfile(cfusername);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            logger.warn("Codeforces profile fetch failed: {}", e.getClass().getSimpleName());
            throw new IllegalArgumentException("Unable to fetch Codeforces profile.");
        }
    }

    @Override
    @Cacheable(value = "atcoderProfile", key = "'user:' + #atcusername", unless = "#result == null || #result.username == null")
    public Atcoder fetchAtcoderProfile(String atcusername) {
        try {
            atcusername = normalizePlatformUsername(atcusername, "AtCoder");
            if (atcusername == null || atcusername.isEmpty()) {
                throw new IllegalArgumentException("AtCoder username cannot be null or empty.");
            }
            return profileFetchingService.fetchAtcoderProfile(atcusername);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            logger.warn("AtCoder profile fetch failed: {}", e.getClass().getSimpleName());
            throw new IllegalArgumentException("Unable to fetch AtCoder profile.");
        }
    }

    @Override
    @Cacheable(value = "codechefProfile", key = "'user:' + #ccusername", unless = "#result == null || #result.username == null")
    public Codechef fetchCodechefProfile(String ccusername) {
        try {
            ccusername = normalizePlatformUsername(ccusername, "CodeChef");
            if (ccusername == null || ccusername.isEmpty()) {
                throw new IllegalArgumentException("CodeChef username cannot be null or empty.");
            }
            return profileFetchingService.fetchCodechefProfile(ccusername);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            logger.warn("CodeChef profile fetch failed: {}", e.getClass().getSimpleName());
            throw new IllegalArgumentException("Unable to fetch CodeChef profile.");
        }
    }

    @Override
    @Cacheable(value = "leetcodeProfile", key = "'user:' + #lcusername", unless = "#result == null || #result.username == null")
    public Leetcode fetchLeetcodeProfile(String lcusername) {
        try {
            lcusername = normalizePlatformUsername(lcusername, "LeetCode");
            if (lcusername == null || lcusername.isEmpty()) {
                throw new IllegalArgumentException("LeetCode username cannot be null or empty.");
            }
            return profileFetchingService.fetchLeetcodeProfile(lcusername);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            logger.warn("LeetCode profile fetch failed: {}", e.getClass().getSimpleName());
            throw new IllegalArgumentException("Unable to fetch LeetCode profile.");
        }
    }

    private User findUserByEmail(String email) {
        email = normalizeEmail(email);
        if (email == null || email.isEmpty()) {
            throw new IllegalArgumentException("Email cannot be null or empty.");
        }
        User user = userRepository.findByEmailIgnoreCase(email);
        if (user == null) {
            throw new IllegalArgumentException("User not found.");
        }
        return user;
    }

    private String normalizePlatformUsername(String username, String platform) {
        if (username == null) {
            return null;
        }
        String normalized = username.trim();
        if (!validation.isValidPlatformUsername(normalized)) {
            throw new IllegalArgumentException("Invalid " + platform + " username format.");
        }
        return normalized;
    }

    private void requireValidUsername(String username) {
        if (!validation.isValidPlatformUsername(username)) {
            throw new IllegalArgumentException("Invalid platform username format.");
        }
    }

    private UserProfile createProfile(User user) {
        return new UserProfile(
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getCodeforcesUsername(),
                user.getAtcoderUsername(),
                user.getCodechefUsername(),
                user.getLeetcodeUsername());
    }

    private PublicUserProfile createPublicProfile(User user) {
        return new PublicUserProfile(
                user.getFirstName(),
                user.getLastName(),
                user.getCodeforcesUsername(),
                user.getAtcoderUsername(),
                user.getCodechefUsername(),
                user.getLeetcodeUsername());
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
