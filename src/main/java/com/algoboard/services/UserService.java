package com.algoboard.services;

import com.algoboard.DTO.Codeforces.CF_ContestDTO;
import com.algoboard.DTO.Codeforces.CF_SubmissionsDTO;
import com.algoboard.DTO.Codeforces.CF_UserDTO;
import com.algoboard.DTO.Codeforces.CF_ContestListDTO;
import com.algoboard.DTO.Codechef.CC_ContestListDTO;
import com.algoboard.DTO.Leetcode.LC_ContestListDTO;
import com.algoboard.DTO.Contest;
import com.algoboard.entities.Atcoder;
import com.algoboard.entities.Codeforces;
import com.algoboard.entities.ContestHistory;
import com.algoboard.entities.User;
import com.algoboard.DTO.Atcoder.ACcontestDTO;
import com.algoboard.repository.UserRepository;
import com.algoboard.DTO.RequestDTO.Profile;

import java.util.Set;
import java.util.HashSet;
import java.util.HashMap;
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

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService implements IUserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private RestTemplate restTemplate = new RestTemplate();

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        getContestList();
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
    public Profile authenticateUser(String username, String email, String password) {
        if (username != null && !username.isEmpty()) {
            User user = userRepository.findByUsername(username);
            if (user != null && passwordEncoder.matches(password, user.getPassword())) {
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
        }
        if (email != null && !email.isEmpty()) {
            User user = userRepository.findByEmail(email);
            if (user != null && passwordEncoder.matches(password, user.getPassword())) {
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
        }
        throw new IllegalArgumentException("Invalid username or password.");
    }

    @Override
    public Profile getUserProfile(String username) {
        User user = userRepository.findByUsername(username);
        if (user != null) {
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
            return new Profile(
                    existingUser.getUsername(),
                    existingUser.getFirstName(),
                    existingUser.getLastName(),
                    existingUser.getEmail(),
                    existingUser.isStudent(),
                    existingUser.getCodeforcesUsername(),
                    existingUser.getAtcoderUsername(),
                    existingUser.getCodechefUsername(),
                    existingUser.getLeetcodeUsername());
        }
        throw new IllegalArgumentException("User does not exist with username: " + profile.getUsername());
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
    public Map<String, List<Contest>> getContestList() {
        Map<String, List<Contest>> contestMap = new HashMap<>();
        contestMap.put("codeforces", getCodeforcesContestList());
        contestMap.put("codechef", getCodechefContestList());
        contestMap.put("atcoder", getAtcoderContestList());
        contestMap.put("leetcode", getLeetcodeContestList());
        return contestMap;
    }

    private List<Contest> getCodeforcesContestList() {
        String cfurl = "https://codeforces.com/api/contest.list";
        CF_ContestListDTO response = restTemplate.getForObject(cfurl, CF_ContestListDTO.class);
        List<Contest> contests = new ArrayList<>();
        int cnt = 0;
        if (response != null && response.getStatus().equals("OK")) {
            for (CF_ContestListDTO.CodeforcesContest contest : response.getResult()) {
                contests.add(new Contest(
                        String.valueOf(contest.getId()),
                        contest.getName(),
                        LocalDateTime.ofEpochSecond(contest.getStartTimeSeconds(), 0,
                                java.time.ZoneOffset.of("+05:30")),
                        (long) contest.getDurationSeconds() / 60));
                if (++cnt > 10) {
                    break;// Limit to 10 contests
                }
            }
        }
        return contests;
    }

    private List<Contest> getCodechefContestList() {
        String ccurl = "https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all";
        CC_ContestListDTO response = restTemplate.getForObject(ccurl, CC_ContestListDTO.class);
        List<Contest> contests = new ArrayList<>();

        // Create a DateTimeFormatter for the CodeChef date format: "20 Aug 2025
        // 20:00:00"
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy  HH:mm:ss");

        if (response != null && response.getStatus().equals("success")) {
            for (CC_ContestListDTO.CodechefContest contest : response.getPresentContests()) {
                contests.add(new Contest(
                        contest.getContestCode(),
                        contest.getContestName(),
                        LocalDateTime.parse(contest.getContestStartDate(), formatter),
                        Long.parseLong(contest.getContestDuration())));
            }
            for (CC_ContestListDTO.CodechefContest contest : response.getFutureContests()) {
                contests.add(new Contest(
                        contest.getContestCode(),
                        contest.getContestName(),
                        LocalDateTime.parse(contest.getContestStartDate(), formatter),
                        Long.parseLong(contest.getContestDuration())));
            }
            int cnt = 0;
            for (CC_ContestListDTO.CodechefContest contest : response.getPastContests()) {
                contests.add(new Contest(
                        contest.getContestCode(),
                        contest.getContestName(),
                        LocalDateTime.parse(contest.getContestStartDate(), formatter),
                        Long.parseLong(contest.getContestDuration().replace("s", ""))));
                if (++cnt > 10) {
                    break; // Limit to 10 past contests
                }
            }
        }
        return contests;
    }

    private List<Contest> getAtcoderContestList() {
        return new ArrayList<>(); // Return empty list for now
    }

    private List<Contest> getLeetcodeContestList() {
        String lcurl = "https://contest-hive.vercel.app/api/leetcode";
        LC_ContestListDTO response = restTemplate.getForObject(lcurl, LC_ContestListDTO.class);
        List<Contest> contests = new ArrayList<>();
        if (response != null && response.isOk()) {
            for (LC_ContestListDTO.LeetcodeContest contest : response.getData()) {
                contests.add(new Contest(
                        LeetcodeContestIdExtractor(contest.getUrl()),
                        contest.getTitle(),
                        LocalDateTime.ofInstant(Instant.parse(contest.getStartTime()), ZoneId.of("Asia/Kolkata")),
                        contest.getDuration() / 60));
            }
        }
        return contests;
    }

    private String LeetcodeContestIdExtractor(String url) {
        String regex = "(?<=/contest/)[^/]+";
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(url);
        if (matcher.find()) {
            return matcher.group();
        }
        return "";// could not extract contest id
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
            List<ContestHistory> contestHistory = new ArrayList<>();
            for (CF_ContestDTO.Result contestResult : contestResults) {
                contestHistory.add(new ContestHistory(
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
        System.out.println("");
        System.out.println("url: " + url);
        System.out.println("");
        try {
            ACcontestDTO[] contestHistory = restTemplate.getForObject(url, ACcontestDTO[].class);
            long contestParticipations = 0;
            long currRating = -1;
            long maxRating = -1;
            List<ContestHistory> history = new ArrayList<>();
            for (ACcontestDTO contest : contestHistory) {
                if (contest.isRated()) {
                    contestParticipations++;
                }
                maxRating = Math.max(maxRating, contest.getNewRating());
                currRating = contest.getNewRating();
                String contestName = contestNameExtractor(contest.getContestName());
                String contestId = contestIdExtractor(contestName);
                history.add(new ContestHistory(
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

    // public Codechef getCodechefProfile(String username) {
    // String url = "https://www.codechef.com/users/" + username;
    // try {
    // Document doc = Jsoup.connect(url).timeout(1000)
    // .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)
    // AppleWebKit/537.36").get();
    // // String displayName
    // } catch (Exception e) {
    // throw new RuntimeException("Failed to fetch Codechef profile for user: " +
    // username);
    // }
    // return null;
    // }

    // private String extractDisplayName(Document doc) {
    // try {
    // Element nameElement = doc.select(".user-details-container h1").first();
    // return nameElement != null ? nameElement.text().trim() : "";
    // } catch(Exception e) {
    // System.out.println("");
    // System.out.println("Error extracting display name: " + e.getMessage());
    // System.out.println("");
    // return "";
    // }
    // }

    // private long extractCurrentRating(Document doc) {
    // try {
    // Element ratingElement = doc.select(".rating-number").first();
    // if (ratingElement != null) {
    // String ratingText = ratingElement.text().replaceAll("[^0-9]", "");
    // if (!ratingText.isEmpty()) {
    // return Long.parseLong(ratingText);
    // }
    // }
    // return 0;
    // } catch (Exception e) {
    // return 0;
    // }
    // }

    // private long extractMaxRating(Document doc) {
    // try {
    // Element maxRatingElement = doc.select(".rating-header .small").first();
    // if (maxRatingElement != null) {
    // String text = maxRatingElement.text();
    // Pattern pattern = Pattern.compile("\\(max\\s*(\\d+)\\)");
    // Matcher matcher = pattern.matcher(text);
    // if (matcher.find()) {
    // return Long.parseLong(matcher.group(1));
    // }
    // }
    // return extractCurrentRating(doc);
    // } catch (Exception e) {
    // return 0;
    // }
    // }

    // private String extractStars(Document doc) {
    // try {
    // Elements starElements = doc.select(".rating .star");
    // return starElements.size() + " Star";
    // } catch (Exception e) {
    // return "Unrated";
    // }
    // }

    // private long extractTotalProblemsSolved(Document doc) {
    // try {
    // Elements problemStats = doc.select(".problems-solved .number");
    // if (!problemStats.isEmpty()) {
    // String text = problemStats.first().text().replaceAll("[^0-9]", "");
    // if (!text.isEmpty()) {
    // return Long.parseLong(text);
    // }
    // }
    // return 0;
    // } catch (Exception e) {
    // return 0;
    // }
    // }

}
