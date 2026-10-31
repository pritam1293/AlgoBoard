package com.algoboard.services;

import com.algoboard.DTO.ContestDTO;
import com.algoboard.entities.Atcoder;
import com.algoboard.entities.Codeforces;
import com.algoboard.entities.Codechef;
import com.algoboard.entities.Leetcode;
import com.algoboard.entities.User;
import com.algoboard.repository.UserRepository;
import com.algoboard.DTO.RequestDTO.UserProfile;

import java.util.HashSet;
import java.util.List;
import java.util.ArrayList;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DataIntegrityViolationException;

@Service
public class UserService implements IUserService {

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

            if(user.getPassword() != null) {
                user.setPassword(user.getPassword().trim());
            }
            if(user.getFirstName() != null) {
                user.setFirstName(user.getFirstName().trim());
            }
            if(user.getLastName() != null) {
                user.setLastName(user.getLastName().trim());
            }
            if(user.getCodeforcesUsername() != null) {
                user.setCodeforcesUsername(user.getCodeforcesUsername().trim());
            }
            if(user.getAtcoderUsername() != null) {
                user.setAtcoderUsername(user.getAtcoderUsername().trim());
            }
            if(user.getCodechefUsername() != null) {
                user.setCodechefUsername(user.getCodechefUsername().trim());
            }
            if(user.getLeetcodeUsername() != null) {
                user.setLeetcodeUsername(user.getLeetcodeUsername().trim());
            }
            if (email == null || email.isEmpty()) {
                throw new IllegalArgumentException("Email cannot be null or empty.");
            }
            if (userRepository.existsByEmailIgnoreCase(email)) {
                throw new IllegalArgumentException("User with the same email already exists.");
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
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user.setFriends(new HashSet<>());
            userRepository.save(user);
            return createProfile(user);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("User with the same email already exists.");
        }
    }

    @Override
    public UserProfile authenticateUser(String email, String password) {
        try {
            email = normalizeEmail(email);
            if (password != null) {
                password = password.trim();
            }
            if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
                throw new IllegalArgumentException("Invalid email or password.");
            }

            // Dummy for testing purposes
            if (email.equals("abcd") && password.equals("abcd")) {
                User dummyUser = new User();
                dummyUser.setFirstName("Dummy");
                dummyUser.setLastName("User");
                dummyUser.setEmail("abcd");
                dummyUser.setCodeforcesUsername("");
                dummyUser.setAtcoderUsername("");
                dummyUser.setCodechefUsername("");
                dummyUser.setLeetcodeUsername("");
                dummyUser.setFriends(new HashSet<>());
                return createProfile(dummyUser);
            }

            User user = userRepository.findByEmailIgnoreCase(email);
            if (user != null && passwordEncoder.matches(password, user.getPassword())) {
                return createProfile(user);
            }
            throw new IllegalArgumentException("Invalid email or password.");
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid email or password.");
        }
    }

    @Override
    public UserProfile getUserProfile(String email) {
        try {
            email = normalizeEmail(email);
            if (email == null || email.isEmpty()) {
                throw new IllegalArgumentException("Email cannot be null or empty.");
            }
            User user = userRepository.findByEmailIgnoreCase(email);
            if (user != null) {
                return createProfile(user);
            }
            throw new IllegalArgumentException("User not found with email: " + email);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("User not found with email: " + email);
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
                throw new IllegalArgumentException("User does not exist with email: " + email);
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
            throw new IllegalArgumentException("Error updating user details: " + e.getMessage());
        }
    }

    @Override
    public boolean updateFriendsList(Map<String, String> payload, String email) {
        try {
            email = normalizeEmail(email);
            if (email == null || email.isEmpty()) {
                throw new IllegalArgumentException("Email cannot be null or empty.");
            }
            final String userEmail = email;
            User user = userRepository.findByEmailIgnoreCase(userEmail);
            if (user == null) {
                return false;
            }
            if (user.getFriends() == null) {
                user.setFriends(new HashSet<>());
            }
            payload.forEach((key, value) -> {
                String friendEmail = normalizeEmail(value);
                if (friendEmail == null || friendEmail.isEmpty() || friendEmail.equals(userEmail)) {
                    return;
                }
                if (key.equals("add")) {
                    if (userRepository.existsByEmailIgnoreCase(friendEmail)) {
                        user.getFriends().add(friendEmail);
                    }
                } else if (key.equals("remove")) {
                    user.getFriends().removeIf(existing -> existing != null
                            && existing.equalsIgnoreCase(friendEmail));
                }
            });
            userRepository.save(user);
            return true;
        } catch (Exception e) {
            throw new IllegalArgumentException("Error updating friends list: " + e.getMessage());
        }
    }

    @Override
    public boolean checkFriendship(String email, String friendEmail) {
        try {
            email = normalizeEmail(email);
            final String normalizedFriendEmail = normalizeEmail(friendEmail);
            if (email == null || email.isEmpty()) {
                throw new IllegalArgumentException("Email cannot be null or empty.");
            }
            if (normalizedFriendEmail == null || normalizedFriendEmail.isEmpty()) {
                throw new IllegalArgumentException("Friend email cannot be null or empty.");
            }
            User user = userRepository.findByEmailIgnoreCase(email);
            if (user != null) {
                return user.getFriends() != null && user.getFriends().stream()
                        .anyMatch(existing -> existing != null
                                && existing.equalsIgnoreCase(normalizedFriendEmail));
            }
            throw new IllegalArgumentException("User not found with email: " + email);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error checking friendship: " + e.getMessage());
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
                user.getLeetcodeUsername(),
                user.getFriends() == null ? new HashSet<>() : user.getFriends());
    }

    @Override
    public Map<String, String> updatePassword(String email, String oldPassword, String newPassword) {
        try {
            email = normalizeEmail(email);
            if(oldPassword != null) {
                oldPassword = oldPassword.trim();
            }
            if(newPassword != null) {
                newPassword = newPassword.trim();
            }
            if (email == null || email.isEmpty()) {
                throw new IllegalArgumentException("Email cannot be null or empty.");
            }
            if (oldPassword == null || oldPassword.isEmpty()) {
                throw new IllegalArgumentException("Old password cannot be null or empty.");
            }
            if (newPassword == null || newPassword.isEmpty()) {
                throw new IllegalArgumentException("New password cannot be null or empty.");
            }
            if(!validation.isValidPassword(newPassword)) {
                throw new IllegalArgumentException("New password does not meet the required format.");
            }
            User user = userRepository.findByEmailIgnoreCase(email);
            if (user != null && passwordEncoder.matches(oldPassword, user.getPassword())) {
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                return Map.of(
                    "email", user.getEmail(),
                    "firstName", user.getFirstName());
            }
            throw new IllegalArgumentException("Invalid email or old password.");
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Error updating password: " + e.getMessage());
        }
    }

    @Override
    public String deleteUser(String email, String password) {
        try {
            email = normalizeEmail(email);
            User user = userRepository.findByEmailIgnoreCase(email);
            if (user != null && passwordEncoder.matches(password, user.getPassword())) {
                userRepository.delete(user);
                return "User deleted successfully.";
            }
            return "Invalid email or password.";
        } catch (Exception e) {
            throw new IllegalArgumentException("Error deleting user: " + e.getMessage());
        }
    }

    @Override
    public boolean addCPProfiles(String email, String codeforcesId, String atcoderId, String codechefId, String leetcodeId) {
        try {
            email = normalizeEmail(email);
            if(email == null || email.isEmpty()) {
                throw new IllegalArgumentException("Email cannot be null or empty.");
            }
            if(codeforcesId != null) {
                codeforcesId = codeforcesId.trim();
            }
            if(atcoderId != null) {
                atcoderId = atcoderId.trim();
            }
            if(codechefId != null) {
                codechefId = codechefId.trim();
            }
            if(leetcodeId != null) {
                leetcodeId = leetcodeId.trim();
            }
            User user = userRepository.findByEmailIgnoreCase(email);
            if (user != null) {
                boolean codeforcesChanged = false;
                boolean atcoderChanged = false;
                boolean codechefChanged = false;
                boolean leetcodeChanged = false;

                if (codeforcesId != null && !Objects.equals(codeforcesId, user.getCodeforcesUsername())) {
                    user.setCodeforcesUsername(codeforcesId);
                    codeforcesChanged = true;
                }
                if (atcoderId != null && !Objects.equals(atcoderId, user.getAtcoderUsername())) {
                    user.setAtcoderUsername(atcoderId);
                    atcoderChanged = true;
                }
                if (codechefId != null && !Objects.equals(codechefId, user.getCodechefUsername())) {
                    user.setCodechefUsername(codechefId);
                    codechefChanged = true;
                }
                if (leetcodeId != null && !Objects.equals(leetcodeId, user.getLeetcodeUsername())) {
                    user.setLeetcodeUsername(leetcodeId);
                    leetcodeChanged = true;
                }

                userRepository.save(user);

                if (codeforcesChanged) {
                    cacheService.evictCodeforcesCache(email);
                }
                if (atcoderChanged) {
                    cacheService.evictAtcoderCache(email);
                }
                if (codechefChanged) {
                    cacheService.evictCodechefCache(email);
                }
                if (leetcodeChanged) {
                    cacheService.evictLeetcodeCache(email);
                }
                return true;
            }
            return false;
        } catch (Exception e) {
            throw new IllegalArgumentException("Error adding CP profiles: " + e.getMessage());
        }
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    @Override
    @Cacheable(value = "contestList", key = "'all_contests'")
    public List<ContestDTO> getContestList() {
        List<ContestDTO> allContests = new ArrayList<>();

        // Start all API calls simultaneously - directly populate allContests
        CompletableFuture<Void> cfFuture = CompletableFuture
                .runAsync(() -> contestFetchingService.getCodeforcesContestList(allContests));
        CompletableFuture<Void> ccFuture = CompletableFuture
                .runAsync(() -> contestFetchingService.getCodechefContestList(allContests));
        CompletableFuture<Void> acFuture = CompletableFuture
                .runAsync(() -> contestFetchingService.getAtcoderContestList(allContests));
        CompletableFuture<Void> lcFuture = CompletableFuture
                .runAsync(() -> contestFetchingService.getLeetcodeContestList(allContests));

        // Wait for all API calls to complete with timeout protection
        try {
            cfFuture.get(8, TimeUnit.SECONDS);
        } catch (Exception e) {
            System.out.println("Codeforces API timeout or error: " + e.getMessage());
        }

        try {
            ccFuture.get(8, TimeUnit.SECONDS);
        } catch (Exception e) {
            System.out.println("CodeChef API timeout or error: " + e.getMessage());
        }

        try {
            acFuture.get(8, TimeUnit.SECONDS);
        } catch (Exception e) {
            System.out.println("AtCoder API timeout or error: " + e.getMessage());
        }

        try {
            lcFuture.get(8, TimeUnit.SECONDS);
        } catch (Exception e) {
            System.out.println("LeetCode API timeout or error: " + e.getMessage());
        }

        // Sort contests by priority: Live → Upcoming → Finished
        allContests.sort(contestFetchingService::compareContestsByPriority);
        return allContests;
    }

    @Override
    @Cacheable(value = "codeforcesProfile", key = "#email")
    public Codeforces getCodeforcesProfile(String email) {
        try {
            email = normalizeEmail(email);
            if(email == null || email.isEmpty()) {
                throw new IllegalArgumentException("Email cannot be null or empty.");
            }
            User user = userRepository.findByEmailIgnoreCase(email);
            if (user == null) {
                throw new IllegalArgumentException("User not found with email: " + email);
            }
            String cfid = user.getCodeforcesUsername();
            if (cfid == null || cfid.isEmpty()) {
                return new Codeforces();
            }
            return profileFetchingService.fetchCodeforcesProfile(cfid);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error fetching Codeforces profile: " + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "atcoderProfile", key = "#email")
    public Atcoder getAtcoderProfile(String email) {
        try {
            email = normalizeEmail(email);
            if(email == null || email.isEmpty()) {
                throw new IllegalArgumentException("Email cannot be null or empty.");
            }
            User user = userRepository.findByEmailIgnoreCase(email);
            if (user == null) {
                throw new IllegalArgumentException("User not found with email: " + email);
            }
            String acid = user.getAtcoderUsername();
            if (acid == null || acid.isEmpty()) {
                return new Atcoder();
            }
            return profileFetchingService.fetchAtcoderProfile(acid);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error fetching Atcoder profile: " + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "codechefProfile", key = "#email")
    public Codechef getCodechefProfile(String email) {
        try {
            email = normalizeEmail(email);
            if(email == null || email.isEmpty()) {
                throw new IllegalArgumentException("Email cannot be null or empty.");
            }
            User user = userRepository.findByEmailIgnoreCase(email);
            if (user == null) {
                throw new IllegalArgumentException("User not found with email: " + email);
            }
            String ccid = user.getCodechefUsername();
            if (ccid == null || ccid.isEmpty()) {
                return new Codechef();
            }
            return profileFetchingService.fetchCodechefProfile(ccid);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error fetching Codechef profile: " + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "leetcodeProfile", key = "#email")
    public Leetcode getLeetcodeProfile(String email) {
        try {
            email = normalizeEmail(email);
            if(email == null || email.isEmpty()) {
                throw new IllegalArgumentException("Email cannot be null or empty.");
            }
            User user = userRepository.findByEmailIgnoreCase(email);
            if (user == null) {
                throw new IllegalArgumentException("User not found with email: " + email);
            }
            String lcid = user.getLeetcodeUsername();
            if (lcid == null || lcid.isEmpty()) {
                return new Leetcode();
            }
            return profileFetchingService.fetchLeetcodeProfile(lcid);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error fetching Leetcode profile: " + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "codeforcesProfile", key = "#cfusername")
    public Codeforces fetchCodeforcesProfile(String cfusername) {
        try {
            if(cfusername != null) {
                cfusername = cfusername.trim();
            }
            if(cfusername == null || cfusername.isEmpty()) {
                throw new IllegalArgumentException("Codeforces username cannot be null or empty.");
            }
            return profileFetchingService.fetchCodeforcesProfile(cfusername);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error fetching Codeforces profile." + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "atcoderProfile", key = "#atcusername")
    public Atcoder fetchAtcoderProfile(String atcusername) {
        try {
            if(atcusername != null) {
                atcusername = atcusername.trim();
            }
            if(atcusername == null || atcusername.isEmpty()) {
                throw new IllegalArgumentException("Atcoder username cannot be null or empty.");
            }
            return profileFetchingService.fetchAtcoderProfile(atcusername);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error fetching Atcoder profile." + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "codechefProfile", key = "#ccusername")
    public Codechef fetchCodechefProfile(String ccusername) {
        try {
            if(ccusername != null) {
                ccusername = ccusername.trim();
            }
            if(ccusername == null || ccusername.isEmpty()) {
                throw new IllegalArgumentException("Codechef username cannot be null or empty.");
            }
            return profileFetchingService.fetchCodechefProfile(ccusername);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error fetching Codechef profile." + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "leetcodeProfile", key = "#lcusername")
    public Leetcode fetchLeetcodeProfile(String lcusername) {
        try {
            if(lcusername != null) {
                lcusername = lcusername.trim();
            }
            if(lcusername == null || lcusername.isEmpty()) {
                throw new IllegalArgumentException("Leetcode username cannot be null or empty.");
            }
            return profileFetchingService.fetchLeetcodeProfile(lcusername);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error fetching Leetcode profile." + e.getMessage());
        }
    }
}
