package com.algoboard.services;

import com.algoboard.DTO.Codeforces.CF_ContestDTO;
import com.algoboard.DTO.Codeforces.CF_SubmissionsDTO;
import com.algoboard.DTO.Codeforces.CF_UserDTO;
import com.algoboard.DTO.Codeforces.CF_ContestListDTO;
import com.algoboard.DTO.Codechef.CC_ContestListDTO;
import com.algoboard.DTO.Leetcode.LC_ContestDTO;
import com.algoboard.DTO.Leetcode.LC_ContestListDTO;
import com.algoboard.DTO.Leetcode.LC_UserDTO;
import com.algoboard.DTO.Codechef.CC_ContestDTO;
import com.algoboard.DTO.ContestDTO;
import com.algoboard.entities.Atcoder;
import com.algoboard.entities.Codeforces;
import com.algoboard.entities.Codechef;
import com.algoboard.entities.Leetcode;
import com.algoboard.entities.UserContestHistory;
import com.algoboard.entities.User;
import com.algoboard.DTO.Atcoder.AC_ContestDTO;
import com.algoboard.DTO.Atcoder.AC_ContestListDTO;
import com.algoboard.repository.UserRepository;
import com.algoboard.DTO.RequestDTO.Profile;
import com.algoboard.DTO.Leetcode.LC_ContestDTO.ContestHistory;
import com.algoboard.DTO.Leetcode.LC_UserDTO.SubmissionStat;
import com.algoboard.entities.Leetcode.Level;
import com.algoboard.DTO.Leetcode.LC_UserDTO.RecentSubmission;
import com.algoboard.entities.Leetcode.Problem;

import java.util.Set;
import java.util.HashSet;
import java.util.AbstractMap;
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

@Service
public class UserService implements IUserService {
    // Timezone constants for consistent handling across all datetime operations
    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");
    private static final ZoneOffset IST_OFFSET = ZoneOffset.of("+05:30");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final CacheManager cacheManager;
    private RestTemplate restTemplate = new RestTemplate();
    private ObjectMapper objectMapper = new ObjectMapper();

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService,
            CacheManager cacheManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.cacheManager = cacheManager;
        System.out.println("");
        System.out.println("MongoDB connected.");
        System.out.println("");
    }

    @Override
    public Profile registerUser(User user) {
        if (userRepository.existsById(user.getUsername())) {
            throw new IllegalArgumentException("User with the same username already exists.");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("User with the same email already exists.");
        }

        // Hash the password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return createProfile(user);
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
    public String deleteUser(String username) {
        User user = userRepository.findByUsername(username);
        if (user != null) {
            userRepository.delete(user);
            return "User deleted successfully.";
        }
        throw new IllegalArgumentException("User not found with username: " + username);
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
        if (userRepository.findByUsername(username) == null) {
            throw new IllegalArgumentException("User not found with username: " + username);
        }
        String cfid = userRepository.findByUsername(username).getCodeforcesUsername();
        if (cfid == null) {
            throw new IllegalArgumentException("Codeforces ID not found for user: " + username);
        }
        String profileUrl = "https://codeforces.com/api/user.info?handles=" + cfid;
        String contestUrl = "https://codeforces.com/api/user.rating?handle=" + cfid;
        try {
            // Execute API calls in parallel
            CompletableFuture<CF_UserDTO> profileFuture = CompletableFuture
                    .supplyAsync(() -> restTemplate.getForObject(profileUrl, CF_UserDTO.class));
            CompletableFuture<CF_ContestDTO> contestFuture = CompletableFuture
                    .supplyAsync(() -> restTemplate.getForObject(contestUrl, CF_ContestDTO.class));

            // Wait for both API calls to complete with timeout
            CF_UserDTO profileResponse = profileFuture.get(10, TimeUnit.SECONDS);
            CF_ContestDTO contestResponse = contestFuture.get(10, TimeUnit.SECONDS);

            if (profileResponse == null || profileResponse.getStatus().equals("FAILED")) {
                throw new RuntimeException("Failed to fetch Codeforces profile for user: " + cfid);
            }
            if (contestResponse == null || contestResponse.getStatus().equals("FAILED")) {
                throw new RuntimeException("Failed to fetch Codeforces contests for user: " + cfid);
            }
            long from = 1;
            long count = 1000;
            long totalSubmissions = 0;
            long acceptedSubmissions = 0;
            Set<AbstractMap.SimpleEntry<Long, String>> problemSet = new HashSet<>();
            List<Codeforces.Problem> recentSubmissions = new ArrayList<>();

            while (true) {
                String submissionsUrl = "https://codeforces.com/api/user.status?handle=" + cfid + "&from=" + from
                        + "&count=" + count;
                CF_SubmissionsDTO submissionsResponse = restTemplate.getForObject(submissionsUrl,
                        CF_SubmissionsDTO.class);
                if (submissionsResponse == null || !Objects.equals(submissionsResponse.getStatus(), "OK")) {
                    break;
                }
                totalSubmissions += submissionsResponse.getResult().size();
                for (CF_SubmissionsDTO.Result submission : submissionsResponse.getResult()) {
                    if (submission.getVerdict().equals("OK")) {
                        acceptedSubmissions++;
                    }
                    problemSet.add(new AbstractMap.SimpleEntry<>(
                            submission.getProblem().getContestId(),
                            submission.getProblem().getIndex()));
                    if (recentSubmissions.size() < 10) {
                        //last 10 submissions
                        recentSubmissions.add(new Codeforces.Problem(
                                submission.getProblem().getContestId(),
                                submission.getProblem().getIndex(),
                                submission.getProblem().getName(),
                                submission.getVerdict()));
                    }
                }
                if (submissionsResponse.getResult().size() < count) {
                    break;
                }
                from += count;
            }
            CF_UserDTO.Result result = profileResponse.getResult().get(0);
            java.util.List<CF_ContestDTO.Result> contestResults = contestResponse.getResult();
            List<UserContestHistory> contestHistory = new ArrayList<>();
            if (contestResults != null) {
                for (CF_ContestDTO.Result contestResult : contestResults) {
                    contestHistory.add(new UserContestHistory(
                            Long.toString(contestResult.getContestId()),
                            contestResult.getContestName(),
                            contestResult.getRank(),
                            contestResult.getOldRating(),
                            contestResult.getNewRating()));
                }

                // Reverse the contest history array
                java.util.Collections.reverse(contestHistory);
            }
            return new Codeforces(
                    result.getHandle(),
                    result.getRank(),
                    result.getRating(),
                    result.getMaxRating(),
                    result.getMaxRank(),
                    problemSet.size(),
                    totalSubmissions,
                    acceptedSubmissions,
                    contestHistory.size(),
                    contestHistory,
                    recentSubmissions);
        } catch (Exception e) {
            System.out.println("");
            System.out.println("Error fetching Codeforces profile: " + e.getMessage());
            System.out.println("");
            throw new RuntimeException("Failed to fetch Codeforces profile for user: " + username);
        }
    }

    @Override
    @Cacheable(value = "atcoderProfile", key = "#username")
    public Atcoder getAtcoderProfile(String username) {
        if (userRepository.findByUsername(username) == null) {
            throw new IllegalArgumentException("User not found with username: " + username);
        }
        String acid = userRepository.findByUsername(username).getAtcoderUsername();
        if (acid == null) {
            throw new IllegalArgumentException("AtCoder ID not found for user: " + username);
        }
        String url = "https://atcoder.jp/users/" + acid + "/history/json";

        try {
            AC_ContestDTO[] contestHistory = restTemplate.getForObject(url, AC_ContestDTO[].class);
            long contestParticipations = 0;
            long currRating = -1;
            long maxRating = -1;
            List<UserContestHistory> history = new ArrayList<>();

            if (contestHistory != null) {
                for (AC_ContestDTO contest : contestHistory) {
                    if (contest.isRated()) {
                        contestParticipations++;
                    }
                    maxRating = Math.max(maxRating, contest.getNewRating());
                    currRating = contest.getNewRating();
                    String contestName = contestNameExtractor(contest.getContestName());
                    String contestId = contestIdExtractor(contestName);
                    history.add(new UserContestHistory(
                            contestId,
                            contestName,
                            contest.getPlace(),
                            contest.getOldRating(),
                            contest.getNewRating()));
                }
            }
            if (currRating == -1)
                currRating = 0;
            if (maxRating == -1)
                maxRating = 0;
            String currRank = getRankByRating(currRating);
            String maxRank = getRankByRating(maxRating);

            java.util.Collections.reverse(history);

            return new Atcoder(
                    acid,
                    currRank,
                    currRating,
                    maxRating,
                    maxRank,
                    contestParticipations,
                    history);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch AtCoder profile for user: " + username);
        }
    }

    private String contestNameExtractor(String originalName) {
        Pattern pattern = Pattern.compile("(atcoder\\s+.*?\\s+contest\\s+\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(originalName);
        if (matcher.find()) {
            return matcher.group(1).replaceAll("\\s+", " ").trim();
        }
        return originalName; // Return original if no pattern found
    }

    private String contestIdExtractor(String contestName) {
        StringBuilder contestId = new StringBuilder();
        String[] words = contestName.split(" ");

        for (String word : words) {
            if (!word.isEmpty() && ((word.charAt(0) >= 'A' && word.charAt(0) <= 'Z')
                    || (word.charAt(0) >= 'a' && word.charAt(0) <= 'z'))) {
                contestId.append(Character.toLowerCase(word.charAt(0)));
            }
        }
        for (char c : contestName.toCharArray()) {
            if (Character.isDigit(c)) {
                contestId.append(c);
            }
        }
        return contestId.toString();
    }

    private String getRankByRating(long rating) {
        String rankTitle;
        if (rating >= 2800) {
            rankTitle = "Legend";
        } else if (rating >= 2400) {
            rankTitle = "Red";
        } else if (rating >= 2000) {
            rankTitle = "Orange";
        } else if (rating >= 1600) {
            rankTitle = "Yellow";
        } else if (rating >= 1200) {
            rankTitle = "Green";
        } else if (rating >= 800) {
            rankTitle = "Cyan";
        } else if (rating >= 400) {
            rankTitle = "Blue";
        } else if (rating >= 0) {
            rankTitle = "Gray";
        } else {
            rankTitle = "Unrated / Newbie";
        }
        return rankTitle;
    }

    @Override
    @Cacheable(value = "codechefProfile", key = "#username")
    public Codechef getCodechefProfile(String username) {
        if (userRepository.findByUsername(username) == null) {
            throw new IllegalArgumentException("User not found with username: " + username);
        }
        String ccid = userRepository.findByUsername(username).getCodechefUsername();
        if (ccid == null || ccid.isEmpty()) {
            throw new IllegalArgumentException("Codechef username not found of user: " + username);
        }
        System.out.println("");
        System.out.println("Cache miss - fetching Codechef profile data for: " + ccid);
        String ccurl = "https://clist.by/account/" + ccid + "/resource/codechef.com/ratings/?resource=codechef.com";
        Codechef codechefProfile = new Codechef();
        try {
            CC_ContestDTO codechefResponse = restTemplate.getForObject(ccurl, CC_ContestDTO.class);
            if (codechefResponse != null && codechefResponse.getStatus().equals("ok")) {
                codechefProfile.setUsername(ccid);

                long maxRating = -1, currentRating = -1;
                List<UserContestHistory> history = new ArrayList<>();
                if (codechefResponse.getData() != null && codechefResponse.getData().getResources() != null
                        && codechefResponse.getData().getResources().getCodechefCom() != null
                        && codechefResponse.getData().getResources().getCodechefCom().getData() != null
                        && codechefResponse.getData().getResources().getCodechefCom().getData().size() > 0) {
                    List<CC_ContestDTO.Contest> contests = codechefResponse.getData().getResources().getCodechefCom()
                            .getData().get(0);
                    for (CC_ContestDTO.Contest contest : contests) {
                        history.add(new UserContestHistory(
                                contest.getKey(),
                                contest.getName(),
                                Long.parseLong(contest.getPlace()),
                                contest.getOldRating() != null ? contest.getOldRating() : 0,
                                contest.getNewRating() != null ? contest.getNewRating() : 0));
                        maxRating = Math.max(maxRating, contest.getNewRating() != null ? contest.getNewRating() : 0);
                        currentRating = contest.getNewRating() != null ? contest.getNewRating() : currentRating;
                    }
                }
                java.util.Collections.reverse(history);
                codechefProfile.setMaxRating(maxRating < 0 ? 0 : maxRating);
                codechefProfile.setRating(currentRating < 0 ? 0 : currentRating);
                codechefProfile.setContestHistory(history);
                codechefProfile.setContestParticipations(history.size());
                codechefProfile.setRank(getCodechefRankByRating(currentRating));
                codechefProfile.setMaxRank(getCodechefRankByRating(maxRating));
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch Codechef profile for user: " + username);
        }
        return codechefProfile;
    }

    final private String getCodechefRankByRating(long rating) {
        if (rating >= 2500)
            return "7 star";
        if (rating >= 2200)
            return "6 star";
        if (rating >= 2000)
            return "5 star";
        if (rating >= 1800)
            return "4 star";
        if (rating >= 1600)
            return "3 star";
        if (rating >= 1400)
            return "2 star";
        if (rating >= 0)
            return "1 star";
        return "Unrated";
    }

    @Override
    @Cacheable(value = "leetcodeProfile", key = "#username")
    public Leetcode getLeetcodeProfile(String username) {
        if (userRepository.findByUsername(username) == null) {
            throw new IllegalArgumentException("User not found with username: " + username);
        }
        String lcid = userRepository.findByUsername(username).getLeetcodeUsername();
        if (lcid == null || lcid.isEmpty()) {
            throw new IllegalArgumentException("Leetcode username not found of user: " + username);
        }
        System.out.println("");
        System.out.println("Cache miss - fetching LeetCode profile data for: " + lcid);
        System.out.println("");

        String lcuserurl = "https://leetcode-stats.tashif.codes/" + lcid + "/profile";
        String lccontesturl = "https://leetcode-stats.tashif.codes/" + lcid + "/contests";

        try {
            // Start both API calls simultaneously
            CompletableFuture<LC_UserDTO> userProfileFuture = CompletableFuture
                    .supplyAsync(() -> {
                        try {
                            LC_UserDTO response = restTemplate.getForObject(lcuserurl, LC_UserDTO.class);
                            System.out.println("LeetCode profile API response status: "
                                    + (response != null ? response.getStatus() : "null response"));
                            return response;
                        } catch (Exception e) {
                            System.out.println("LeetCode profile API error for " + lcid + ": " + e.getMessage());
                            return null;
                        }
                    });

            CompletableFuture<LC_ContestDTO> contestFuture = CompletableFuture
                    .supplyAsync(() -> {
                        try {
                            LC_ContestDTO response = restTemplate.getForObject(lccontesturl, LC_ContestDTO.class);
                            System.out.println("LeetCode contest API response status: "
                                    + (response != null ? response.getStatus() : "null response"));
                            return response;
                        } catch (Exception e) {
                            System.out.println("LeetCode contest API error for " + lcid + ": " + e.getMessage());
                            return null;
                        }
                    });

            // Wait for both API calls to complete with timeout protection
            LC_UserDTO userProfileResponse = null;
            LC_ContestDTO contestResponse = null;

            try {
                userProfileResponse = userProfileFuture.get(10, TimeUnit.SECONDS);
                System.out.println("LeetCode profile API completed for: " + lcid);
            } catch (Exception e) {
                System.out.println("LeetCode profile API timeout or error for " + lcid + ": " + e.getMessage());
            }

            try {
                contestResponse = contestFuture.get(10, TimeUnit.SECONDS);
                System.out.println("LeetCode contest API completed for: " + lcid);
            } catch (Exception e) {
                System.out.println("LeetCode contest API timeout or error for " + lcid + ": " + e.getMessage());
            }

            // Check if we got valid responses
            if (userProfileResponse == null && contestResponse == null) {
                throw new RuntimeException("Both LeetCode APIs failed for user: " + lcid
                        + ". Please check if the username is correct and publicly accessible.");
            }

            if (userProfileResponse != null && !"success".equals(userProfileResponse.getStatus())) {
                System.out.println("LeetCode profile API returned non-success status: "
                        + userProfileResponse.getStatus() + " for user: " + lcid);
            }

            if (contestResponse != null && !"success".equals(contestResponse.getStatus())) {
                System.out.println("LeetCode contest API returned non-success status: " + contestResponse.getStatus()
                        + " for user: " + lcid);
            }

            Leetcode leetcodeProfile = new Leetcode();

            if (userProfileResponse != null && userProfileResponse.getStatus().equals("success")) {
                // problems solved and accepted submissions
                Level problemsSolved = new Level(0, 0, 0, 0);
                Level acceptedSubmissions = new Level(0, 0, 0, 0);
                if (userProfileResponse.getSubmitStats() != null
                        && userProfileResponse.getSubmitStats().getAcSubmissionNum() != null) {
                    for (SubmissionStat submissionStat : userProfileResponse.getSubmitStats().getAcSubmissionNum()) {
                        if (submissionStat.getDifficulty().equals("All")) {
                            problemsSolved.setAll(submissionStat.getCount());
                            acceptedSubmissions.setAll(submissionStat.getSubmissions());
                        } else if (submissionStat.getDifficulty().equals("Easy")) {
                            problemsSolved.setEasy(submissionStat.getCount());
                            acceptedSubmissions.setEasy(submissionStat.getSubmissions());
                        } else if (submissionStat.getDifficulty().equals("Medium")) {
                            problemsSolved.setMedium(submissionStat.getCount());
                            acceptedSubmissions.setMedium(submissionStat.getSubmissions());
                        } else if (submissionStat.getDifficulty().equals("Hard")) {
                            problemsSolved.setHard(submissionStat.getCount());
                            acceptedSubmissions.setHard(submissionStat.getSubmissions());
                        }
                    }
                }
                // total submissions
                Level totalSubmissions = new Level(0, 0, 0, 0);
                if (userProfileResponse.getSubmitStats() != null
                        || userProfileResponse.getSubmitStats().getTotalSubmissionNum() != null) {
                    for (SubmissionStat submissionStat : userProfileResponse.getSubmitStats().getTotalSubmissionNum()) {
                        if (submissionStat.getDifficulty().equals("All")) {
                            totalSubmissions.setAll(submissionStat.getSubmissions());
                        } else if (submissionStat.getDifficulty().equals("Easy")) {
                            totalSubmissions.setEasy(submissionStat.getSubmissions());
                        } else if (submissionStat.getDifficulty().equals("Medium")) {
                            totalSubmissions.setMedium(submissionStat.getSubmissions());
                        } else if (submissionStat.getDifficulty().equals("Hard")) {
                            totalSubmissions.setHard(submissionStat.getSubmissions());
                        }
                    }
                }

                List<Problem> recentSubmissions = new ArrayList<>();
                if (userProfileResponse.getRecentSubmissions() != null) {
                    for (RecentSubmission submission : userProfileResponse.getRecentSubmissions()) {
                        recentSubmissions.add(new Problem(
                                submission.getStatusDisplay(),
                                submission.getTitle(),
                                "https://leetcode.com/problems/" + submission.getTitleSlug() + "/description"));
                    }
                }
                leetcodeProfile.setUsername(lcid);
                leetcodeProfile.setProblemsSolved(problemsSolved);
                leetcodeProfile.setTotalSubmissions(totalSubmissions);
                leetcodeProfile.setAcceptedSubmissions(acceptedSubmissions);
                leetcodeProfile.setRecentSubmissions(recentSubmissions);
            }

            if (contestResponse != null && contestResponse.getStatus().equals("success")) {
                long rating = 0, maxRating = 0;
                List<UserContestHistory> contestHistory = new ArrayList<>();
                if (contestResponse.getContestHistory() != null) {
                    for (ContestHistory history : contestResponse.getContestHistory()) {
                        if (history.isAttended()) {
                            contestHistory.add(new UserContestHistory(
                                    history.getContest().getTitle().toLowerCase().replace(" ", "-"),
                                    history.getContest().getTitle(),
                                    history.getRanking(),
                                    rating,
                                    (long) (history.getRating() + 0.5)));
                            rating = (long) (history.getRating() + 0.5);
                            maxRating = Math.max(maxRating, rating);
                        }
                    }
                }
                java.util.Collections.reverse(contestHistory);

                leetcodeProfile.setContestHistory(contestHistory);
                leetcodeProfile.setMaxRating(maxRating);
                leetcodeProfile.setRating((long) (contestResponse.getRating() + 0.5));
                leetcodeProfile.setContestParticipations(contestResponse.getAttendedContestsCount());
                if (contestResponse.getBadge() != null && contestResponse.getBadge().getName() != null) {
                    leetcodeProfile.setRank(contestResponse.getBadge().getName());
                } else {
                    leetcodeProfile.setRank("Newbie");
                }
            }

            System.out.println("LeetCode profile data cached successfully for: " + lcid);
            return leetcodeProfile;
        } catch (Exception e) {
            System.out.println("");
            System.out.println("DETAILED ERROR fetching LeetCode profile for user: " + username + " (LeetCode ID: "
                    + lcid + ")");
            System.out.println("Error type: " + e.getClass().getSimpleName());
            System.out.println("Error message: " + e.getMessage());
            System.out.println("Profile URL: " + lcuserurl);
            System.out.println("Contest URL: " + lccontesturl);
            System.out.println("");
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch LeetCode profile for user: " + username + " (LeetCode ID: "
                    + lcid + "). Error: " + e.getMessage());
        }
    }
}
