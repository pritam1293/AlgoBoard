package com.algoboard.services;

import com.algoboard.DTO.Codeforces.CFContestDTO;
import com.algoboard.DTO.Codeforces.CFSubmissionsDTO;
import com.algoboard.DTO.Codeforces.CFUserDTO;
import com.algoboard.DTO.RequestDTO.User;
import com.algoboard.entities.Atcoder;
import com.algoboard.entities.Codechef;
import com.algoboard.entities.Codeforces;
import com.algoboard.entities.ContestHistory;
import com.algoboard.DTO.Atcoder.ACcontestDTO;
import com.algoboard.repository.UserRepository;

import java.util.Map;
import java.util.Set;
import java.util.HashSet;
import java.util.AbstractMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Objects;
import org.springframework.web.client.RestTemplate;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import org.springframework.security.crypto.password.PasswordEncoder;

//json import
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.springframework.stereotype.Service;

@Service
public class UserService implements IUserService {
    private Map<String, User> userDatabase;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private RestTemplate restTemplate = new RestTemplate();

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userDatabase = new java.util.HashMap<>();
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        System.out.println("");
        System.out.println("MongoDB connected.");
        System.out.println("");
    }

    @Override
    public User registerUser(User user) {
        if (userRepository.existsById(user.getUsername())) {
            throw new IllegalArgumentException("User with the same username already exists.");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("User with the same email already exists.");
        }

        // Hash the password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        userRepository.save(user);
        return user;
    }

    @Override
    public User authenticateUser(String username, String password) {
        User user = userRepository.findByUsername(username);
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            return user;
        }
        throw new IllegalArgumentException("Invalid username or password.");
    }

    @Override
    public User updateUserDetails(String username, User user) {
        User existingUser = userRepository.findByUsername(username);
        if (existingUser != null) {
            if (user.getFirstName() != null) {
                existingUser.setFirstName(user.getFirstName());
            }
            if (user.getLastName() != null) {
                existingUser.setLastName(user.getLastName());
            }
            if (user.getEmail() != null) {
                existingUser.setEmail(user.getEmail());
            }
            if (user.getPassword() != null) {
                existingUser.setPassword(user.getPassword());
            }
            if (user.isStudent() != existingUser.isStudent()) {
                existingUser.setStudent(user.isStudent());
            }
            if (user.getCodeforcesUsername() != null) {
                existingUser.setCodeforcesUsername(user.getCodeforcesUsername());
            }
            if (user.getAtcoderUsername() != null) {
                existingUser.setAtcoderUsername(user.getAtcoderUsername());
            }
            if (user.getCodechefUsername() != null) {
                existingUser.setCodechefUsername(user.getCodechefUsername());
            }
            if (user.getLeetcodeUsername() != null) {
                existingUser.setLeetcodeUsername(user.getLeetcodeUsername());
            }
            userRepository.save(existingUser);
            return existingUser;
        }
        throw new IllegalArgumentException("User does not exist with username: " + username);
    }

    @Override
    public Codeforces getCodeforcesProfile(String username) {
        String profileUrl = "https://codeforces.com/api/user.info?handles=" + username;
        String contestUrl = "https://codeforces.com/api/user.rating?handle=" + username;
        try {
            CFUserDTO profileResponse = restTemplate.getForObject(profileUrl, CFUserDTO.class);
            if (profileResponse == null || profileResponse.getStatus().equals("FAILED")) {
                throw new RuntimeException("Failed to fetch Codeforces profile for user: " + username);
            }
            CFContestDTO contestResponse = restTemplate.getForObject(contestUrl, CFContestDTO.class);
            if (contestResponse == null || contestResponse.getStatus().equals("FAILED")) {
                throw new RuntimeException("Failed to fetch Codeforces contests for user: " + username);
            }
            long from = 1;
            long count = 1000;
            long totalSubmissions = 0;
            long acceptedSubmissions = 0;
            Set<AbstractMap.SimpleEntry<Long, String>> problemSet = new HashSet<>();

            while (true) {
                String submissionsUrl = "https://codeforces.com/api/user.status?handle=" + username + "&from=" + from
                        + "&count=" + count;
                CFSubmissionsDTO submissionsResponse = restTemplate.getForObject(submissionsUrl,
                        CFSubmissionsDTO.class);
                if (submissionsResponse == null || !Objects.equals(submissionsResponse.getStatus(), "OK")) {
                    break;
                }
                totalSubmissions += submissionsResponse.getResult().size();
                for (CFSubmissionsDTO.Result submission : submissionsResponse.getResult()) {
                    if (submission.getVerdict().equals("OK")) {
                        acceptedSubmissions++;
                    }
                    problemSet.add(new AbstractMap.SimpleEntry<>(submission.getProblem().getContestId(),
                            submission.getProblem().getIndex()));
                }
                if (submissionsResponse.getResult().size() < count) {
                    break;
                }
                from += count;
            }
            CFUserDTO.Result result = profileResponse.getResult().get(0);
            java.util.List<CFContestDTO.Result> contestResults = contestResponse.getResult();
            List<ContestHistory> contestHistory = new ArrayList<>();
            for (CFContestDTO.Result contestResult : contestResults) {
                contestHistory.add(new ContestHistory(
                        Long.toString(contestResult.getContestId()),
                        contestResult.getContestName(),
                        contestResult.getRank(),
                        contestResult.getOldRating(),
                        contestResult.getNewRating()));
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
        String url = "https://atcoder.jp/users/" + username + "/history/json";
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
                    username,
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

    public Codechef getCodechefProfile(String username) {
        String url = "https://www.codechef.com/users/" + username;
        try {
            Document doc = Jsoup.connect(url).timeout(1000)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36").get();
            // String displayName
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch Codechef profile for user: " + username);
        }
        return null;
    }

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

    private long extractCurrentRating(Document doc) {
        try {
            Element ratingElement = doc.select(".rating-number").first();
            if (ratingElement != null) {
                String ratingText = ratingElement.text().replaceAll("[^0-9]", "");
                if (!ratingText.isEmpty()) {
                    return Long.parseLong(ratingText);
                }
            }
            return 0;
        } catch (Exception e) {
            return 0;
        }
    }

    private long extractMaxRating(Document doc) {
        try {
            Element maxRatingElement = doc.select(".rating-header .small").first();
            if (maxRatingElement != null) {
                String text = maxRatingElement.text();
                Pattern pattern = Pattern.compile("\\(max\\s*(\\d+)\\)");
                Matcher matcher = pattern.matcher(text);
                if (matcher.find()) {
                    return Long.parseLong(matcher.group(1));
                }
            }
            return extractCurrentRating(doc);
        } catch (Exception e) {
            return 0;
        }
    }

    private String extractStars(Document doc) {
        try {
            Elements starElements = doc.select(".rating .star");
            return starElements.size() + " Star";
        } catch (Exception e) {
            return "Unrated";
        }
    }

    private long extractTotalProblemsSolved(Document doc) {
        try {
            Elements problemStats = doc.select(".problems-solved .number");
            if (!problemStats.isEmpty()) {
                String text = problemStats.first().text().replaceAll("[^0-9]", "");
                if (!text.isEmpty()) {
                    return Long.parseLong(text);
                }
            }
            return 0;
        } catch (Exception e) {
            return 0;
        }
    }

}
