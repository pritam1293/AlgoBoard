package com.algoboard.services;

import com.algoboard.DTO.Codeforces.CF_ContestListDTO;
import com.algoboard.DTO.Codechef.CC_ContestListDTO;
import com.algoboard.DTO.Leetcode.LC_ContestDTO;
import com.algoboard.DTO.Leetcode.LC_ContestListDTO;
import com.algoboard.DTO.ContestDTO;
import com.algoboard.entities.Atcoder;
import com.algoboard.entities.Codeforces;
import com.algoboard.entities.Codechef;
import com.algoboard.entities.Leetcode;
import com.algoboard.entities.User;
import com.algoboard.DTO.Atcoder.AC_ContestListDTO;
import com.algoboard.repository.UserRepository;
import com.algoboard.DTO.RequestDTO.Profile;
import com.algoboard.DTO.Leetcode.LC_ContestDTO.ContestHistory;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.Objects;
import org.springframework.web.client.RestTemplate;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;
import org.jsoup.nodes.Element;
import java.io.IOException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.DuplicateKeyException;

@Service
public class UserService implements IUserService {
    // Timezone constants for consistent handling across all datetime operations
    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");
    private static final ZoneOffset IST_OFFSET = ZoneOffset.of("+05:30");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final CacheManager cacheManager;
    private final ProfileFetchingService profileFetchingService;
    private RestTemplate restTemplate = new RestTemplate();
    private ObjectMapper objectMapper = new ObjectMapper();

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService,
            CacheManager cacheManager, ProfileFetchingService profileFetchingService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.cacheManager = cacheManager;
        this.profileFetchingService = profileFetchingService;
        System.out.println("");
        System.out.println("MongoDB connected.");
        System.out.println("");
    }

    @Override
    public Profile registerUser(User user) {
        try {
            if(userRepository.existsByUsername(user.getUsername())) {
                throw new IllegalArgumentException("User with the same username already exists.");
            }
            if(userRepository.existsByEmail(user.getEmail())) {
                throw new IllegalArgumentException("User with the same email already exists.");
            }
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            userRepository.save(user);
            return createProfile(user);
        } catch(DuplicateKeyException e) {
            String message = e.getMessage().toLowerCase();
            if(message.contains("username")) {
                throw new IllegalArgumentException("User with the same username already exists.");
            } else if(message.contains("email")) {
                throw new IllegalArgumentException("User with the same email already exists.");
            } else {
                throw new IllegalArgumentException("User with the same username or email already exists.");
            }
        }
    }

    @Override
    public Profile authenticateUser(String username, String email, String password) {
        if (username != null && !username.isEmpty()) {
            User user = userRepository.findByUsername(username);
            if (user != null && passwordEncoder.matches(password, user.getPassword())) {
                return createProfile(user);
            }
        }
        if (email != null && !email.isEmpty()) {
            User user = userRepository.findByEmail(email);
            if (user != null && passwordEncoder.matches(password, user.getPassword())) {
                return createProfile(user);
            }
        }
        throw new IllegalArgumentException("Invalid username or password.");
    }

    @Override
    public Profile getUserProfile(String username) {
        User user = userRepository.findByUsername(username);
        if (user != null) {
            return createProfile(user);
        }
        throw new IllegalArgumentException("User not found with username: " + username);
    }

    @Override
    public Profile updateUserDetails(Profile profile) {
        User existingUser = userRepository.findByUsername(profile.getUsername());
        if (existingUser != null) {
            if (profile.getFirstName() != null) {
                existingUser.setFirstName(profile.getFirstName());
            }
            if (profile.getLastName() != null) {
                existingUser.setLastName(profile.getLastName());
            }
            if (profile.getEmail() != null) {
                existingUser.setEmail(profile.getEmail());
            }
            if (profile.isStudent() != existingUser.isStudent()) {
                existingUser.setStudent(profile.isStudent());
            }
            userRepository.save(existingUser);
            return createProfile(existingUser);
        }
        throw new IllegalArgumentException("User does not exist with username: " + profile.getUsername());
    }

    private Profile createProfile(User user) {
        return new Profile(
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.isStudent(),
                user.getCodeforcesUsername(),
                user.getAtcoderUsername(),
                user.getCodechefUsername(),
                user.getLeetcodeUsername());
    }

    @Override
    public Map<String, String> updatePassword(String username, String oldPassword, String newPassword) {
        User user = userRepository.findByUsername(username);
        if (user != null && passwordEncoder.matches(oldPassword, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return Map.of(
                    "email", user.getEmail(),
                    "firstName", user.getFirstName());
        }
        throw new IllegalArgumentException("Invalid username or password.");
    }

    @Override
    public boolean generateAndSendOtp(String email) {
        if (userRepository.existsByEmail(email)) {
            String otp = String.valueOf((int) (Math.random() * 900000) + 100000); // Generate a 6-digit OTP
            User user = userRepository.findByEmail(email);
            user.setResetOtp(otp);
            user.setResetOtpExpiry(LocalDateTime.now().plusMinutes(15)); // Set OTP
            userRepository.save(user);
            emailService.sendOtpForPasswordReset(email, otp);
            System.out.println("");
            System.out.println("OTP generated and email sent successfully");
            return true;
        }
        return false;
    }

    @Override
    public boolean verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email);
        if (user != null && user.getResetOtp().equals(otp) && user.getResetOtpExpiry().isAfter(LocalDateTime.now())) {
            user.setResetOtp(null);
            user.setResetOtpExpiry(null);
            userRepository.save(user);
            System.out.println("OTP verified successfully for email: " + email);
            return true;
        }
        return false;
    }

    @Override
    public boolean resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email);
        if (user != null) {
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            System.out.println("");
            System.out.println("Password reset successfully for email: " + email);
            return true;
        }
        return false;
    }

    @Override
    public String deleteUser(String username, String password) {
        User user = userRepository.findByUsername(username);
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            userRepository.delete(user);
            return "User deleted successfully.";
        }
        throw new IllegalArgumentException("Invalid username or password.");
    }

    @Override
    public boolean addCPProfiles(String username, String codeforcesId, String atcoderId, String codechefId,
            String leetcodeId) {
        User user = userRepository.findByUsername(username);
        if (user != null) {
            boolean codeforcesChanged = false;
            boolean atcoderChanged = false;
            boolean codechefChanged = false;
            boolean leetcodeChanged = false;

            // Check Codeforces username change
            if (codeforcesId != null && !Objects.equals(codeforcesId, user.getCodeforcesUsername())) {
                System.out.println("Codeforces username changing from '" + user.getCodeforcesUsername() + "' to '"
                        + codeforcesId + "'");
                user.setCodeforcesUsername(codeforcesId);
                codeforcesChanged = true;
            }

            // Check AtCoder username change
            if (atcoderId != null && !Objects.equals(atcoderId, user.getAtcoderUsername())) {
                System.out.println(
                        "AtCoder username changing from '" + user.getAtcoderUsername() + "' to '" + atcoderId + "'");
                user.setAtcoderUsername(atcoderId);
                atcoderChanged = true;
            }

            // Check CodeChef username change
            if (codechefId != null && !Objects.equals(codechefId, user.getCodechefUsername())) {
                System.out.println(
                        "CodeChef username changing from '" + user.getCodechefUsername() + "' to '" + codechefId + "'");
                user.setCodechefUsername(codechefId);
                codechefChanged = true;
            }

            // Check LeetCode username change
            if (leetcodeId != null && !Objects.equals(leetcodeId, user.getLeetcodeUsername())) {
                System.out.println(
                        "LeetCode username changing from '" + user.getLeetcodeUsername() + "' to '" + leetcodeId + "'");
                user.setLeetcodeUsername(leetcodeId);
                leetcodeChanged = true;
            }

            userRepository.save(user);

            // Clear cache only for platforms that were actually changed
            if (codeforcesChanged) {
                evictCodeforcesCache(username);
                System.out.println("✓ Codeforces cache cleared for user: " + username);
            }
            if (atcoderChanged) {
                evictAtcoderCache(username);
                System.out.println("✓ AtCoder cache cleared for user: " + username);
            }
            if (codechefChanged) {
                evictCodechefCache(username);
                System.out.println("✓ CodeChef cache cleared for user: " + username);
            }
            if (leetcodeChanged) {
                evictLeetcodeCache(username);
                System.out.println("✓ LeetCode cache cleared for user: " + username);
            }

            return true;
        }
        return false;
    }

    @Override
    @Cacheable(value = "contestList", key = "'all_contests'")
    public List<ContestDTO> getContestList() {
        System.out.println("Cache miss - fetching contest data from APIs...");
        List<ContestDTO> allContests = new ArrayList<>();

        // Start all API calls simultaneously - directly populate allContests
        CompletableFuture<Void> cfFuture = CompletableFuture.runAsync(() -> getCodeforcesContestList(allContests));
        CompletableFuture<Void> ccFuture = CompletableFuture.runAsync(() -> getCodechefContestList(allContests));
        CompletableFuture<Void> acFuture = CompletableFuture.runAsync(() -> getAtcoderContestList(allContests));
        CompletableFuture<Void> lcFuture = CompletableFuture.runAsync(() -> getLeetcodeContestList(allContests));

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
        allContests.sort(this::compareContestsByPriority);
        return allContests;
    }

    // Automatically refresh cache every 30 minutes
    @CacheEvict(value = "contestList", allEntries = true)
    @Scheduled(fixedRate = 1800000) // 30 minutes in milliseconds
    protected void refreshContestCache() {
        System.out.println("Contest cache cleared - will refresh on next request");
    }

    // Automatically refresh LeetCode profile cache every 1 hours
    @CacheEvict(value = "leetcodeProfile", allEntries = true)
    @Scheduled(fixedRate = 3600000) // 1 hours in milliseconds
    protected void refreshLeetcodeProfileCache() {
        System.out.println("LeetCode profile cache cleared - will refresh on next request");
    }

    // Automatically refresh Codeforces profile cache every 1 hours
    @CacheEvict(value = "codeforcesProfile", allEntries = true)
    @Scheduled(fixedRate = 3600000) // 1 hours in milliseconds
    protected void refreshCodeforcesProfileCache() {
        System.out.println("Codeforces profile cache cleared - will refresh on next request");
    }

    // Automatically refresh AtCoder profile cache every 1 hours
    @CacheEvict(value = "atcoderProfile", allEntries = true)
    @Scheduled(fixedRate = 3600000) // 1 hours in milliseconds
    protected void refreshAtcoderProfileCache() {
        System.out.println("AtCoder profile cache cleared - will refresh on next request");
    }

    // Automatically refresh CodeChef profile cache every 1 hours
    @CacheEvict(value = "codechefProfile", allEntries = true)
    @Scheduled(fixedRate = 3600000) // 1 hours in milliseconds
    protected void refreshCodechefProfileCache() {
        System.out.println("CodeChef profile cache cleared - will refresh on next request");
    }

    // Selective cache eviction methods for individual users
    private void evictCodeforcesCache(String username) {
        System.out.println("🗑️ Evicting Codeforces cache for user: " + username);
        if (cacheManager.getCache("codeforcesProfile") != null) {
            cacheManager.getCache("codeforcesProfile").evict(username);
            System.out.println("✅ Codeforces cache actually evicted for: " + username);
        }
    }

    private void evictAtcoderCache(String username) {
        System.out.println("🗑️ Evicting AtCoder cache for user: " + username);
        if (cacheManager.getCache("atcoderProfile") != null) {
            cacheManager.getCache("atcoderProfile").evict(username);
            System.out.println("✅ AtCoder cache actually evicted for: " + username);
        }
    }

    private void evictLeetcodeCache(String username) {
        System.out.println("🗑️ Evicting LeetCode cache for user: " + username);
        if (cacheManager.getCache("leetcodeProfile") != null) {
            cacheManager.getCache("leetcodeProfile").evict(username);
            System.out.println("✅ LeetCode cache actually evicted for: " + username);
        }
    }

    private void evictCodechefCache(String username) {
        System.out.println("🗑️ Evicting CodeChef cache for user: " + username);
        if (cacheManager.getCache("codechefProfile") != null) {
            cacheManager.getCache("codechefProfile").evict(username);
            System.out.println("✅ CodeChef cache actually evicted for: " + username);
        }
    }

    /**
     * Custom comparator for sorting contests by priority and time
     * Priority: Live contests → Upcoming contests → Finished contests
     * Within each category: Sort by start time (earliest first)
     */
    private int compareContestsByPriority(ContestDTO contest1, ContestDTO contest2) {
        LocalDateTime now = LocalDateTime.now();

        int priority1 = getContestPriority(contest1, now);
        int priority2 = getContestPriority(contest2, now);

        // Primary sort: by priority (lower number = higher priority)
        if (priority1 != priority2) {
            return Integer.compare(priority1, priority2);
        }

        // Secondary sort: by start time within same priority
        if (priority1 == 1) { // Live contests - sort by earliest start time
            return contest1.getStartTime().compareTo(contest2.getStartTime());
        } else if (priority1 == 2) { // Upcoming contests - sort by earliest start time
            return contest1.getStartTime().compareTo(contest2.getStartTime());
        } else { // Finished contests - sort by latest start time (most recent first)
            return contest2.getStartTime().compareTo(contest1.getStartTime());
        }
    }

    private int getContestPriority(ContestDTO contest, LocalDateTime now) {
        if (now.isAfter(contest.getStartTime()) && now.isBefore(contest.getEndTime())) {
            return 1; // Live contest
        } else if (now.isBefore(contest.getStartTime())) {
            return 2; // Upcoming contest
        } else {
            return 3; // Finished contest
        }
    }

    private void getCodeforcesContestList(List<ContestDTO> allContests) {
        String cfurl = "https://codeforces.com/api/contest.list";
        try {
            CF_ContestListDTO response = restTemplate.getForObject(cfurl, CF_ContestListDTO.class);
            int cnt = 0;
            if (response != null && response.getStatus().equals("OK")) {
                for (CF_ContestListDTO.CodeforcesContest contest : response.getResult()) {
                    synchronized (allContests) {
                        allContests.add(new ContestDTO(
                                String.valueOf(contest.getId()),
                                contest.getName(),
                                "https://codeforces.com/contest/" + contest.getId(),
                                "codeforces",
                                LocalDateTime.ofEpochSecond(contest.getStartTimeSeconds(), 0,
                                        IST_OFFSET),
                                LocalDateTime.ofEpochSecond(
                                        contest.getStartTimeSeconds() + contest.getDurationSeconds(), 0,
                                        IST_OFFSET),
                                (long) contest.getDurationSeconds() / 60)

                        );
                    }
                    if (++cnt == 6) {
                        break;// Limit to 6 contests
                    }
                }
            } else {
                System.out.println("Codeforces API response was null or status not OK");
            }
        } catch (Exception e) {
            System.out.println("");
            System.out.println("Error fetching Codeforces contests: " + e.getMessage());
            System.out.println("Returning empty Codeforces contest list.");
            System.out.println("");
        }
    }

    private void getCodechefContestList(List<ContestDTO> allContests) {
        String ccurl = "https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all";
        try {
            CC_ContestListDTO response = restTemplate.getForObject(ccurl, CC_ContestListDTO.class);

            // Create a DateTimeFormatter for the CodeChef date format: "20 Aug 2025
            // 20:00:00"
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy  HH:mm:ss");

            if (response != null && response.getStatus().equals("success")) {
                addCodechefContests(allContests, response.getPresentContests(), formatter, -1);
                addCodechefContests(allContests, response.getFutureContests(), formatter, -1);
                addCodechefContests(allContests, response.getPastContests(), formatter, 4);
            } else {
                System.out.println("CodeChef API response was null or status not success");
            }
        } catch (Exception e) {
            System.out.println("");
            System.out.println("Error fetching CodeChef contests: " + e.getMessage());
            System.out.println("Returning empty CodeChef contest list.");
            System.out.println("");
        }
    }

    private void addCodechefContests(List<ContestDTO> allContests, List<CC_ContestListDTO.CodechefContest> contestList,
            DateTimeFormatter formatter, int limit) {
        int count = 0;
        for (CC_ContestListDTO.CodechefContest contest : contestList) {
            synchronized (allContests) {
                allContests.add(new ContestDTO(
                        contest.getContestCode(),
                        contest.getContestName(),
                        "https://www.codechef.com/" + contest.getContestCode(),
                        "codechef",
                        LocalDateTime.parse(contest.getContestStartDate(), formatter),
                        LocalDateTime.parse(contest.getContestEndDate(), formatter),
                        Long.parseLong(contest.getContestDuration())));
            }

            if (limit > 0 && ++count >= limit) {
                break; // Limit reached
            }
        }
    }

    private void getAtcoderContestList(List<ContestDTO> allContests) {
        String acurl = "https://contest-hive.vercel.app/api/atcoder";

        try {
            String rawResponse = restTemplate.getForObject(acurl, String.class);
            AC_ContestListDTO response = objectMapper.readValue(rawResponse, AC_ContestListDTO.class);
            if (response != null && response.isOk()) {
                for (AC_ContestListDTO.AtcoderContest contest : response.getData()) {
                    final String contestId = contestIdExtractorFromUrl(contest.getUrl());
                    synchronized (allContests) {
                        allContests.add(new ContestDTO(
                                contestId,
                                contest.getTitle(),
                                "https://atcoder.jp/contests/" + contestId,
                                "atcoder",
                                LocalDateTime.ofInstant(Instant.parse(contest.getStartTime()),
                                        IST_ZONE),
                                LocalDateTime.ofInstant(Instant.parse(contest.getEndTime()), IST_ZONE),
                                contest.getDuration() / 60));
                    }
                }
            } else {
                System.out.println("Atcoder API response was null or status not OK");
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("");
            System.out.println("Error fetching Atcoder contests: " + e.getMessage());
            System.out.println("");
            System.out.println("Returning empty Atcoder contest list.");
            System.out.println("");
        }
        // past contests
        acurl = "https://atcoder.jp/contests/archive";

        try {
            Document doc = Jsoup.connect(acurl).get();
            Elements rows = doc.select("table tbody tr");

            int count = 0;
            for (Element row : rows) {
                Elements cols = row.select("td");
                if (cols.size() >= 3) {
                    String dateStr = cols.get(0).text();
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ssZ");
                    ZonedDateTime zonedDateTime = ZonedDateTime.parse(dateStr, formatter);
                    final LocalDateTime startTime = zonedDateTime.withZoneSameInstant(IST_ZONE)
                            .toLocalDateTime();

                    Element linkElement = cols.get(1).selectFirst("a");
                    final String contestName = linkElement.text();
                    final String contestUrl = linkElement.absUrl("href");
                    final String contestId = contestIdExtractorFromUrl(contestUrl);
                    String durationStr = cols.get(2).text();
                    String[] parts = durationStr.split(":");
                    final int hours = Integer.parseInt(parts[0]);
                    final int minutes = Integer.parseInt(parts[1]);
                    final long totalTimeMinutes = hours * 60 + minutes;
                    final LocalDateTime endTime = startTime.plusMinutes(totalTimeMinutes);

                    synchronized (allContests) {
                        allContests.add(new ContestDTO(
                                contestId,
                                contestName,
                                contestUrl,
                                "atcoder",
                                startTime,
                                endTime,
                                totalTimeMinutes));
                    }
                    if (++count == 5)
                        break; // stop after 5 contests
                }
            }

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void getLeetcodeContestList(List<ContestDTO> allContests) {
        // future contests
        String lcurl = "https://contest-hive.vercel.app/api/leetcode";

        try {
            // Get raw response as String to bypass content-type issue
            String rawResponse = restTemplate.getForObject(lcurl, String.class);
            // Parse using ObjectMapper to handle content-type issue
            LC_ContestListDTO response = objectMapper.readValue(rawResponse, LC_ContestListDTO.class);

            if (response != null && response.isOk()) {
                for (LC_ContestListDTO.LeetcodeContest contest : response.getData()) {
                    synchronized (allContests) {
                        allContests.add(new ContestDTO(
                                contestIdExtractorFromUrl(contest.getUrl()),
                                contest.getTitle(),
                                contest.getUrl(),
                                "leetcode",
                                LocalDateTime.ofInstant(Instant.parse(contest.getStartTime()),
                                        IST_ZONE),
                                LocalDateTime.ofInstant(Instant.parse(contest.getEndTime()), IST_ZONE),
                                contest.getDuration() / 60));
                    }
                }
            } else {
                System.out.println("Leetcode API response was null or status not OK");
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("");
            System.out.println("Error fetching Leetcode contests: " + e.getMessage());
            System.out.println("");
            System.out.println("Returning empty Leetcode contest list.");
            System.out.println("");
        }

        // past contests
        lcurl = "https://leetcode-stats.tashif.codes/Pritam1293/contests";
        try {
            LC_ContestDTO response = restTemplate.getForObject(lcurl, LC_ContestDTO.class);
            if (response != null && response.getStatus().equals("success")) {
                // last 4 contests
                List<ContestHistory> history = response.getContestHistory();
                if (history != null && !history.isEmpty()) {
                    Collections.reverse(history);
                    for (int index = 0; index < Math.min(4, history.size()); index++) {
                        LocalDateTime startTime = LocalDateTime.ofEpochSecond(
                                history.get(index).getContest().getStartTime(), 0, IST_OFFSET);
                        LocalDateTime endTime = startTime.plusMinutes(90);
                        final String contestId = history.get(index).getContest().getTitle().toLowerCase().replace(" ",
                                "-");
                        synchronized (allContests) {
                            allContests.add(new ContestDTO(
                                    contestId,
                                    history.get(index).getContest().getTitle(),
                                    "https://leetcode.com/contest/" + contestId,
                                    "leetcode",
                                    startTime,
                                    endTime,
                                    90));
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("");
            System.out.println("Error fetching Leetcode past contests: " + e.getMessage());
            System.out.println("");
        }
    }

    private String contestIdExtractorFromUrl(String url) {
        String regex = "(?<=/contests?/)[^/]+";
        Matcher matcher = Pattern.compile(regex).matcher(url);
        return matcher.find() ? matcher.group() : "";
    }

    @Override
    @Cacheable(value = "codeforcesProfile", key = "#username")
    public Codeforces getCodeforcesProfile(String username) {
        return profileFetchingService.fetchCodeforcesProfile(username);
    }

    @Override
    @Cacheable(value = "atcoderProfile", key = "#username")
    public Atcoder getAtcoderProfile(String username) {
        return profileFetchingService.fetchAtcoderProfile(username);
    }

    @Override
    @Cacheable(value = "codechefProfile", key = "#username")
    public Codechef getCodechefProfile(String username) {
        return profileFetchingService.fetchCodechefProfile(username);
    }

    @Override
    @Cacheable(value = "leetcodeProfile", key = "#username")
    public Leetcode getLeetcodeProfile(String username) {
        return profileFetchingService.fetchLeetcodeProfile(username);
    }
}
