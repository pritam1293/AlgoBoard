package com.algoboard.services;

import com.algoboard.DTO.Codeforces.CF_ContestDTO;
import com.algoboard.DTO.Codeforces.CF_SubmissionsDTO;
import com.algoboard.DTO.Codeforces.CF_UserDTO;
import com.algoboard.DTO.Codeforces.CF_ContestListDTO;
import com.algoboard.DTO.Codechef.CC_ContestListDTO;
import com.algoboard.DTO.Leetcode.LC_ContestDTO;
import com.algoboard.DTO.Leetcode.LC_ContestListDTO;
import com.algoboard.DTO.ContestDTO;
import com.algoboard.entities.Atcoder;
import com.algoboard.entities.Codeforces;
import com.algoboard.entities.UserContestHistory;
import com.algoboard.entities.User;
import com.algoboard.DTO.Atcoder.AC_ContestDTO;
import com.algoboard.DTO.Atcoder.AC_ContestListDTO;
import com.algoboard.repository.UserRepository;
import com.algoboard.DTO.RequestDTO.Profile;
import com.algoboard.DTO.Leetcode.LC_ContestDTO.ContestHistory;

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
import java.util.Collections;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class UserService implements IUserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private RestTemplate restTemplate = new RestTemplate();
    private ObjectMapper objectMapper = new ObjectMapper();

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
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
            if (codeforcesId != null)
                user.setCodeforcesUsername(codeforcesId);
            if (atcoderId != null)
                user.setAtcoderUsername(atcoderId);
            if (codechefId != null)
                user.setCodechefUsername(codechefId);
            if (leetcodeId != null)
                user.setLeetcodeUsername(leetcodeId);
            userRepository.save(user);
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
            cfFuture.get(5, TimeUnit.SECONDS);
            System.out.println("Codeforces contests added successfully");
        } catch (Exception e) {
            System.out.println("Codeforces API timeout or error: " + e.getMessage());
        }

        try {
            ccFuture.get(5, TimeUnit.SECONDS);
            System.out.println("CodeChef contests added successfully");
        } catch (Exception e) {
            System.out.println("CodeChef API timeout or error: " + e.getMessage());
        }

        try {
            acFuture.get(5, TimeUnit.SECONDS);
            System.out.println("AtCoder contests added successfully");
        } catch (Exception e) {
            System.out.println("AtCoder API timeout or error: " + e.getMessage());
        }

        try {
            lcFuture.get(5, TimeUnit.SECONDS);
            System.out.println("LeetCode contests added successfully");
        } catch (Exception e) {
            System.out.println("LeetCode API timeout or error: " + e.getMessage());
        }

        System.out.println("Total merged contests: " + allContests.size());

        // Sort contests by priority: Live → Upcoming → Finished
        allContests.sort(this::compareContestsByPriority);

        System.out.println("Contest data cached and sorted successfully!");
        return allContests;
    }

    // Automatically refresh cache every 30 minutes
    @CacheEvict(value = "contestList", allEntries = true)
    @Scheduled(fixedRate = 1800000) // 30 minutes in milliseconds
    public void refreshContestCache() {
        System.out.println("Contest cache cleared - will refresh on next request");
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
        int addedCount = 0;
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
                                        java.time.ZoneOffset.of("+05:30")),
                                LocalDateTime.ofEpochSecond(
                                        contest.getStartTimeSeconds() + contest.getDurationSeconds(), 0,
                                        java.time.ZoneOffset.of("+05:30")),
                                (long) contest.getDurationSeconds() / 60)

                        );
                        addedCount++;
                    }
                    if (++cnt == 6) {
                        break;// Limit to 6 contests
                    }
                }
                System.out.println("Added " + addedCount + " Codeforces contests");
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
                System.out.println("Added CodeChef contests successfully");
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
        int addedCount = 0;

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
                                        ZoneId.of("Asia/Kolkata")),
                                LocalDateTime.ofInstant(Instant.parse(contest.getEndTime()), ZoneId.of("Asia/Kolkata")),
                                contest.getDuration() / 60));
                        addedCount++;
                    }
                }
                System.out.println("Added " + addedCount + " AtCoder contests");
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
    }

    private void getLeetcodeContestList(List<ContestDTO> allContests) {
        // future contests
        String lcurl = "https://contest-hive.vercel.app/api/leetcode";
        int addedCount = 0;

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
                                        ZoneId.of("Asia/Kolkata")),
                                LocalDateTime.ofInstant(Instant.parse(contest.getEndTime()), ZoneId.of("Asia/Kolkata")),
                                contest.getDuration() / 60));
                        addedCount++;
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
            if (response.getStatus().equals("success")) {
                // last 4 contests
                List<ContestHistory> history = response.getContestHistory();
                if (history != null && !history.isEmpty()) {
                    Collections.reverse(history);
                    for (int index = 0; index < Math.min(4, history.size()); index++) {
                        LocalDateTime startTime = LocalDateTime.ofEpochSecond(
                                history.get(index).getContest().getStartTime(), 0, java.time.ZoneOffset.of("+05:30"));
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
                            addedCount++;
                        }
                    }
                }
            }
            System.out.println("Added " + addedCount + " LeetCode contests");
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("");
            System.out.println("Error fetching Leetcode past contests: " + e.getMessage());
            System.out.println("");
            System.out.println("Added " + addedCount + " LeetCode contests (future only).");
            System.out.println("");
        }
    }

    private String contestIdExtractorFromUrl(String url) {
        String regex = "(?<=/contests?/)[^/]+";
        Matcher matcher = Pattern.compile(regex).matcher(url);
        return matcher.find() ? matcher.group() : "";
    }

    @Override
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
            CF_UserDTO profileResponse = restTemplate.getForObject(profileUrl, CF_UserDTO.class);
            if (profileResponse == null || profileResponse.getStatus().equals("FAILED")) {
                throw new RuntimeException("Failed to fetch Codeforces profile for user: " + cfid);
            }
            CF_ContestDTO contestResponse = restTemplate.getForObject(contestUrl, CF_ContestDTO.class);
            if (contestResponse == null || contestResponse.getStatus().equals("FAILED")) {
                throw new RuntimeException("Failed to fetch Codeforces contests for user: " + cfid);
            }
            long from = 1;
            long count = 1000;
            long totalSubmissions = 0;
            long acceptedSubmissions = 0;
            Set<AbstractMap.SimpleEntry<Long, String>> problemSet = new HashSet<>();

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
                }
                if (submissionsResponse.getResult().size() < count) {
                    break;
                }
                from += count;
            }
            CF_UserDTO.Result result = profileResponse.getResult().get(0);
            java.util.List<CF_ContestDTO.Result> contestResults = contestResponse.getResult();
            List<UserContestHistory> contestHistory = new ArrayList<>();
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
                    problemSet);
        } catch (Exception e) {
            System.out.println("");
            System.out.println("Error fetching Codeforces profile: " + e.getMessage());
            System.out.println("");
            throw new RuntimeException("Failed to fetch Codeforces profile for user: " + username);
        }
    }

    @Override
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
            String currRank = getRankByRating(currRating);
            String maxRank = getRankByRating(maxRating);

            return new Atcoder(
                    acid,
                    currRank,
                    currRating,
                    maxRating,
                    maxRank,
                    0, // AtCoder does not provide problems solved
                    contestParticipations,
                    0, // AtCoder does not provide total submissions
                    0, // AtCoder does not provide accepted submissions
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
}
