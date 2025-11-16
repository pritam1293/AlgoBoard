package com.algoboard.services;

import com.algoboard.DTO.ContestDTO;
import com.algoboard.entities.Atcoder;
import com.algoboard.entities.Codeforces;
import com.algoboard.entities.Codechef;
import com.algoboard.entities.Leetcode;
import com.algoboard.entities.User;
import com.algoboard.repository.UserRepository;
import com.algoboard.DTO.RequestDTO.UserProfile;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.Objects;
import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import com.mongodb.DuplicateKeyException;

@Service
public class UserService implements IUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final CacheService cacheService;
    private final Validation validation;
    private final ProfileFetchingService profileFetchingService;
    private final ContestFetchingService contestFetchingService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService,
            CacheService cacheService, Validation validation, ProfileFetchingService profileFetchingService,
            ContestFetchingService contestFetchingService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.cacheService = cacheService;
        this.validation = validation;
        this.profileFetchingService = profileFetchingService;
        this.contestFetchingService = contestFetchingService;
        System.out.println("");
        System.out.println("MongoDB is connected.");
        System.out.println("");
    }

    @Override
    public UserProfile registerUser(User user) {
        try {
            // Trim all the leading and trailing spaces from the user fields
            if(user.getUsername() != null) {
                user.setUsername(user.getUsername().trim());
            }
            if(user.getEmail() != null) {
                user.setEmail(user.getEmail().trim());
            }
            if(user.getPassword() != null) {
                user.setPassword(user.getPassword().trim());
            }
            if(user.getFirstName() != null) {
                user.setFirstName(user.getFirstName().trim());
            }
            if(user.getLastName() != null) {
                user.setLastName(user.getLastName().trim());
            }
            if(user.getInstitutionName() != null) {
                user.setInstitutionName(user.getInstitutionName().trim());
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
            if (userRepository.existsByUsername(user.getUsername())) {
                throw new IllegalArgumentException("User with the same username already exists.");
            }
            if (userRepository.existsByEmail(user.getEmail())) {
                throw new IllegalArgumentException("User with the same email already exists.");
            }
            if (!validation.isValidUsername(user.getUsername())) {
                throw new IllegalArgumentException("Invalid username format.");
            }
            if (!validation.isValidEmail(user.getEmail())) {
                throw new IllegalArgumentException("Invalid email format.");
            }
            if (!validation.isValidPassword(user.getPassword())) {
                throw new IllegalArgumentException("Invalid password format.");
            }
            if (user.getFirstName() != null && !validation.isValidName(user.getFirstName())) {
                throw new IllegalArgumentException("Invalid first name format.");
            }
            if (user.getLastName() != null && !validation.isValidName(user.getLastName())) {
                throw new IllegalArgumentException("Invalid last name format.");
            }
            if (user.getInstitutionName() != null && !validation.isValidInstitutionName(user.getInstitutionName())) {
                throw new IllegalArgumentException("Invalid institution name format.");
            }
            if (user.getFirstName() == null || user.getFirstName().isEmpty()) {
                // If first name is not provided, set it to email's local part
                user.setFirstName(user.getEmail().split("@")[0]);
            }
            if (user.getLastName() == null) {
                user.setLastName("");
            }
            if (user.getInstitutionName() == null) {
                user.setInstitutionName("");
            }
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user.setFriends(new java.util.HashSet<>());// at the time of registration, friends list is empty
            userRepository.save(user);
            return createProfile(user);
        } catch (DuplicateKeyException e) {
            String message = e.getMessage().toLowerCase();
            if (message.contains("username")) {
                throw new IllegalArgumentException("User with the same username already exists.");
            } else if (message.contains("email")) {
                throw new IllegalArgumentException("User with the same email already exists.");
            } else {
                throw new IllegalArgumentException("User with the same username or email already exists.");
            }
        }
    }

    @Override
    public UserProfile authenticateUser(String username, String email, String password) {
        try {
            if (username != null) {
                username = username.trim();
            }
            if (email != null) {
                email = email.trim();
            }
            if (password != null) {
                password = password.trim();
            }
            if (username != null && !username.isEmpty()) {
                User user = userRepository.findByUsername(username);
                if (user != null && passwordEncoder.matches(password, user.getPassword())) {
                    return createProfile(user);
                }
            }
            else if (email != null && !email.isEmpty()) {
                User user = userRepository.findByEmail(email);
                if (user != null && passwordEncoder.matches(password, user.getPassword())) {
                    return createProfile(user);
                }
            } else {
                throw new IllegalArgumentException("Invalid username or password.");
            }
            throw new IllegalArgumentException("Invalid username or password.");
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid username or password.");
        }
    }

    @Override
    public UserProfile getUserProfile(String username) {
        try {
            if(username != null) {
                username = username.trim();
            }
            if (username == null || username.isEmpty()) {
                throw new IllegalArgumentException("Username cannot be null or empty.");
            }
            User user = userRepository.findByUsername(username);
            if (user != null) {
                return createProfile(user);
            }
            throw new IllegalArgumentException("User not found with username: " + username);
        } catch (Exception e) {
            throw new IllegalArgumentException("User not found with username: " + username);
        }
    }

    @Override
    public UserProfile updateUserDetails(UserProfile profile) {
        try {
            if(profile.getUsername() != null) {
                profile.setUsername(profile.getUsername().trim());
            }
            if (profile.getUsername() == null || profile.getUsername().isEmpty()) {
                throw new IllegalArgumentException("Username cannot be null or empty.");
            }
            User existingUser = userRepository.findByUsername(profile.getUsername());
            if (existingUser != null) {
                if (profile.getFirstName() != null && !profile.getFirstName().isEmpty()
                        && !profile.getFirstName().equals(existingUser.getFirstName())
                        && validation.isValidName(profile.getFirstName())) {
                    existingUser.setFirstName(profile.getFirstName());
                }
                if (profile.getLastName() != null && !profile.getLastName().isEmpty()
                        && !profile.getLastName().equals(existingUser.getLastName())
                        && validation.isValidName(profile.getLastName())) {
                    existingUser.setLastName(profile.getLastName());
                }
                if (profile.getEmail() != null && !profile.getEmail().isEmpty()
                        && !profile.getEmail().equals(existingUser.getEmail())
                        && validation.isValidEmail(profile.getEmail())) {
                    existingUser.setEmail(profile.getEmail());
                }
                if (profile.isStudent() != existingUser.isStudent()) {
                    existingUser.setStudent(profile.isStudent());
                }
                if (profile.getInstitutionName() != null && !profile.getInstitutionName().isEmpty()
                        && !profile.getInstitutionName().equals(existingUser.getInstitutionName())
                        && validation.isValidInstitutionName(profile.getInstitutionName())) {
                    existingUser.setInstitutionName(profile.getInstitutionName());
                }
                userRepository.save(existingUser);
                return createProfile(existingUser);
            }
            throw new IllegalArgumentException("User does not exist with username: " + profile.getUsername());
        } catch (Exception e) {
            throw new IllegalArgumentException("Error updating user details." + e.getMessage());
        }
    }

    @Override
    public boolean updateFriendsList(Map<String, String> payload, String username) {
        try {
            if(username != null) {
                username = username.trim();
            }
            if (username == null || username.isEmpty()) {
                throw new IllegalArgumentException("Username cannot be null or empty.");
            }
            User user = userRepository.findByUsername(username);
            if(user != null) {
                payload.forEach((key, value) -> {
                    if(key.equals("add") && value != null && !value.isEmpty()) {
                        user.getFriends().add(value);
                    }
                    else if(key.equals("remove") && value != null && !value.isEmpty()) {
                        user.getFriends().remove(value);
                    }
                });
                userRepository.save(user);
                return true;
            }
            return false;
        } catch (Exception e) {
            throw new IllegalArgumentException("Error updating friends list." + e.getMessage());
        }
    }

    @Override
    public boolean checkFriendship(String username, String friendUsername) {
        try {
            if(username != null) {
                username = username.trim();
            }
            if (username == null || username.isEmpty()) {
                throw new IllegalArgumentException("Username cannot be null or empty.");
            }
            if (friendUsername != null) {
                friendUsername = friendUsername.trim();
            }
            if (friendUsername == null || friendUsername.isEmpty()) {
                throw new IllegalArgumentException("Friend username cannot be null or empty.");
            }
            User user = userRepository.findByUsername(username);
            if (user != null) {
                return user.getFriends().contains(friendUsername);
            }
            throw new IllegalArgumentException("User not found with username: " + username);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error checking friendship." + e.getMessage());
        }
    }

    private UserProfile createProfile(User user) {
        return new UserProfile(
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.isStudent(),
                user.getInstitutionName(),
                user.getCodeforcesUsername(),
                user.getAtcoderUsername(),
                user.getCodechefUsername(),
                user.getLeetcodeUsername(),
                user.getFriends());
    }

    @Override
    public Map<String, String> updatePassword(String username, String oldPassword, String newPassword) {
        try {
            if(username != null) {
                username = username.trim();
            }
            if(oldPassword != null) {
                oldPassword = oldPassword.trim();
            }
            if(newPassword != null) {
                newPassword = newPassword.trim();
            }
            if (username == null || username.isEmpty()) {
                throw new IllegalArgumentException("Username cannot be null or empty.");
            }
            if (oldPassword == null || oldPassword.isEmpty()) {
                throw new IllegalArgumentException("Old password cannot be null or empty.");
            }
            if (newPassword == null || newPassword.isEmpty()) {
                throw new IllegalArgumentException("New password cannot be null or empty.");
            }
            if(validation.isValidPassword(newPassword) == false) {
                throw new IllegalArgumentException("New password does not meet the required format.");
            }
            User user = userRepository.findByUsername(username);
            if (user != null && passwordEncoder.matches(oldPassword, user.getPassword())) {
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                return Map.of(
                    "email", user.getEmail(),
                    "firstName", user.getFirstName());
            }
            throw new IllegalArgumentException("Invalid username or old password.");
        } catch (Exception e) {
            throw new IllegalArgumentException("Error updating password." + e.getMessage());
        }
    }

    @Override
    public boolean generateAndSendOtp(String email) {
        try {
            if(email != null) {
                email = email.trim();
            }
            if(email == null || email.isEmpty()) {
                throw new IllegalArgumentException("Email cannot be null or empty.");
            }
            if (userRepository.existsByEmail(email)) {
                String otp = String.valueOf((int) (Math.random() * 900000) + 100000); // Generate a 6-digit OTP
                User user = userRepository.findByEmail(email);
                user.setResetOtp(otp);
                user.setResetOtpExpiry(LocalDateTime.now().plusMinutes(15)); // Set OTP
                userRepository.save(user);
                emailService.sendOtpForPasswordReset(email, otp);
                return true;
            }
            return false;
        } catch (Exception e) {
            throw new IllegalArgumentException("Error generating OTP." + e.getMessage());
        }
    }

    @Override
    public boolean verifyOtp(String email, String otp) {
        try {
            if(email != null) {
                email = email.trim();
            }
            if(otp != null) {
                otp = otp.trim();
            }
            if(email == null || email.isEmpty()) {
                throw new IllegalArgumentException("Email cannot be null or empty.");
            }
            if(otp == null || otp.isEmpty()) {
                throw new IllegalArgumentException("OTP cannot be null or empty.");
            }
            User user = userRepository.findByEmail(email);
            if (user != null && user.getResetOtp().equals(otp) && user.getResetOtpExpiry().isAfter(LocalDateTime.now())) {
                user.setResetOtp(null);
                user.setResetOtpExpiry(null);
                userRepository.save(user);
                return true;
            }
            return false;
        } catch (Exception e) {
            throw new IllegalArgumentException("Error verifying OTP." + e.getMessage());
        }
    }

    @Override
    public boolean resetPassword(String email, String newPassword) {
        try {
            if(email != null) {
                email = email.trim();
            }
            if(newPassword != null) {
                newPassword = newPassword.trim();
            }
            if(email == null || email.isEmpty()) {
                throw new IllegalArgumentException("Email cannot be null or empty.");
            }
            if(newPassword == null || newPassword.isEmpty()) {
                throw new IllegalArgumentException("New password cannot be null or empty.");
            }
            if(validation.isValidPassword(newPassword) == false) {
                throw new IllegalArgumentException("New password does not meet the required format.");
            }
            User user = userRepository.findByEmail(email);
            if (user != null) {
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                return true;
            }
            return false;
        } catch (Exception e) {
            throw new IllegalArgumentException("Error resetting password." + e.getMessage());
        }
    }

    @Override
    public String deleteUser(String username, String password) {
        try {
            User user = userRepository.findByUsername(username);
            if (user != null && passwordEncoder.matches(password, user.getPassword())) {
                userRepository.delete(user);
                return "User deleted successfully.";
            }
            return "Invalid username or password.";
        } catch (Exception e) {
            throw new IllegalArgumentException("Error deleting user." + e.getMessage());
        }
    }

    @Override
    public boolean addCPProfiles(String username, String codeforcesId, String atcoderId, String codechefId, String leetcodeId) {
        try {
            if(username != null) {
                username = username.trim();
            }
            if(username == null || username.isEmpty()) {
                throw new IllegalArgumentException("Username cannot be null or empty.");
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
            User user = userRepository.findByUsername(username);
            if (user != null) {
                boolean codeforcesChanged = false;
                boolean atcoderChanged = false;
                boolean codechefChanged = false;
                boolean leetcodeChanged = false;

                // Check Codeforces username change
                if (codeforcesId != null && !Objects.equals(codeforcesId, user.getCodeforcesUsername())) {
                    user.setCodeforcesUsername(codeforcesId);
                    codeforcesChanged = true;
                }

                // Check AtCoder username change
                if (atcoderId != null && !Objects.equals(atcoderId, user.getAtcoderUsername())) {
                    user.setAtcoderUsername(atcoderId);
                    atcoderChanged = true;
                }

                // Check CodeChef username change
                if (codechefId != null && !Objects.equals(codechefId, user.getCodechefUsername())) {
                    user.setCodechefUsername(codechefId);
                    codechefChanged = true;
                }

                // Check LeetCode username change
                if (leetcodeId != null && !Objects.equals(leetcodeId, user.getLeetcodeUsername())) {
                    user.setLeetcodeUsername(leetcodeId);
                    leetcodeChanged = true;
                }

                userRepository.save(user);

                // Clear cache only for platforms that were actually changed
                if (codeforcesChanged) {
                    cacheService.evictCodeforcesCache(username);
                }
                if (atcoderChanged) {
                    cacheService.evictAtcoderCache(username);
                }
                if (codechefChanged) {
                    cacheService.evictCodechefCache(username);
                }
                if (leetcodeChanged) {
                    cacheService.evictLeetcodeCache(username);
                }
                return true;
            }
            return false;
        } catch (Exception e) {
            throw new IllegalArgumentException("Error adding CP profiles." + e.getMessage());
        }
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
    @Cacheable(value = "codeforcesProfile", key = "#username")
    public Codeforces getCodeforcesProfile(String username) {
        try {
            if(username != null) {
                username = username.trim();
            }
            if(username == null || username.isEmpty()) {
                throw new IllegalArgumentException("Username cannot be null or empty.");
            }
            if (userRepository.findByUsername(username) == null) {
                throw new IllegalArgumentException("User not found with username: " + username);
            }
            String cfid = userRepository.findByUsername(username).getCodeforcesUsername();
            if (cfid == null || cfid.isEmpty()) {
                return new Codeforces();
            }
            return profileFetchingService.fetchCodeforcesProfile(cfid);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error fetching Codeforces profile." + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "atcoderProfile", key = "#username")
    public Atcoder getAtcoderProfile(String username) {
        try {
            if(username != null) {
                username = username.trim();
            }
            if(username == null || username.isEmpty()) {
                throw new IllegalArgumentException("Username cannot be null or empty.");
            }
            if (userRepository.findByUsername(username) == null) {
                throw new IllegalArgumentException("User not found with username: " + username);
            }
            String acid = userRepository.findByUsername(username).getAtcoderUsername();
            if (acid == null || acid.isEmpty()) {
                return new Atcoder();
            }
            return profileFetchingService.fetchAtcoderProfile(acid);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error fetching Atcoder profile." + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "codechefProfile", key = "#username")
    public Codechef getCodechefProfile(String username) {
        try {
            if(username != null) {
                username = username.trim();
            }
            if(username == null || username.isEmpty()) {
                throw new IllegalArgumentException("Username cannot be null or empty.");
            }
            if (userRepository.findByUsername(username) == null) {
                throw new IllegalArgumentException("User not found with username: " + username);
            }
            String ccid = userRepository.findByUsername(username).getCodechefUsername();
            if (ccid == null || ccid.isEmpty()) {
                return new Codechef();
            }
            return profileFetchingService.fetchCodechefProfile(ccid);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error fetching Codechef profile." + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "leetcodeProfile", key = "#username")
    public Leetcode getLeetcodeProfile(String username) {
        try {
            if(username != null) {
                username = username.trim();
            }
            if(username == null || username.isEmpty()) {
                throw new IllegalArgumentException("Username cannot be null or empty.");
            }
            if (userRepository.findByUsername(username) == null) {
                throw new IllegalArgumentException("User not found with username: " + username);
            }
            String lcid = userRepository.findByUsername(username).getLeetcodeUsername();
            if (lcid == null || lcid.isEmpty()) {
                return new Leetcode();
            }
            return profileFetchingService.fetchLeetcodeProfile(lcid);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error fetching Leetcode profile." + e.getMessage());
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
