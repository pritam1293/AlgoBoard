package com.algoboard.Service;

import com.algoboard.Entities.User;
import com.algoboard.DTO.Codeforces.CFContestDTO;
import com.algoboard.DTO.Codeforces.CFSubmissionsDTO;
import com.algoboard.DTO.Codeforces.CFUserDTO;
import com.algoboard.Entities.Codeforces;
import com.algoboard.Entities.ContestHistory;
import com.algoboard.Entities.Atcoder;
import com.algoboard.DTO.Atcoder.ACcontestDTO;
import com.algoboard.Entities.Codechef;

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

//json import
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;

public class UserService implements IUserService {
    private Map<String, User> userDatabase;
    private RestTemplate restTemplate = new RestTemplate();

    public UserService() {
        this.userDatabase = new java.util.HashMap<>();
        System.out.println("");
        System.out.println("The application has started successfully.");
        System.out.println("");
    }

    @Override
    public User registerUser(User user) {
        if (userDatabase.containsKey(user.getUsername())) {
            return null;
        }
        for (User existingUser : userDatabase.values()) {
            if (existingUser.getEmail().equals(user.getEmail())) {
                return null;
            }
        }
        userDatabase.put(user.getUsername(), user);
        System.out.println("");
        System.out.println("User registered successfully: " + user.getUsername());
        System.out.println("");
        return user;
    }

    @Override
    public User authenticateUser(String username, String password) {
        User user = userDatabase.get(username);
        if (user != null && user.getPassword().equals(password)) {
            System.out.println("");
            System.out.println("User authenticated successfully: " + user.getUsername());
            System.out.println("");
            return user;
        }
        return null;
    }

    @Override
    public User updateUser(String username, User user) {
        User existingUser = userDatabase.get(username);
        if (existingUser != null) {
            if (user.getEmail() != null) {
                existingUser.setEmail(user.getEmail());
            }
            if (user.getPassword() != null) {
                existingUser.setPassword(user.getPassword());
            }
            userDatabase.put(username, existingUser);
            System.out.println("");
            System.out.println("User updated successfully: " + username);
            System.out.println("");
            return existingUser;
        }
        return null;
    }

    @Override
    public Codeforces getCodeforcesProfile(String username) {
        String profileUrl = "https://codeforces.com/api/user.info?handles=" + username;
        String contestUrl = "https://codeforces.com/api/user.rating?handle=" + username;
        try {
            CFUserDTO profileResponse = restTemplate.getForObject(profileUrl, CFUserDTO.class);
            if (profileResponse == null || profileResponse.getStatus().equals("FAILED")) {
                System.out.println("");
                System.out.println("Failed to fetch Codeforces profile for user: " + username);
                System.out.println("");
                throw new RuntimeException("Failed to fetch Codeforces profile for user: " + username);
            }
            CFContestDTO contestResponse = restTemplate.getForObject(contestUrl, CFContestDTO.class);
            if (contestResponse == null || contestResponse.getStatus().equals("FAILED")) {
                System.out.println("");
                System.out.println("Failed to fetch Codeforces contests for user: " + username);
                System.out.println("");
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

            System.out.println("");
            System.out.println("Number of contests: " + contestHistory.size());
            System.out.println("");

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

            System.out.println("");
            System.out.println("Profile data fetched successfully for user: " + username);
            System.out.println("");

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
            System.out.println("");
            System.out.println("Error fetching AtCoder profile: " + e.getMessage());
            System.out.println("");
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
            Document doc = Jsoup.connect(url).timeout(1000).userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36").get();
            // String displayName 
        }
        catch (Exception e) {
            System.out.println("");
            System.out.println("Error fetching Codechef profile: " + e.getMessage());
            System.out.println("");
            throw new RuntimeException("Failed to fetch Codechef profile for user: " + username);
        }
        return null;
    }

    // private String extractDisplayName(Document doc) {
    //     try {
    //         Element nameElement = doc.select(".user-details-container h1").first();
    //         return nameElement != null ? nameElement.text().trim() : ""; 
    //     } catch(Exception e) {
    //         System.out.println("");
    //         System.out.println("Error extracting display name: " + e.getMessage());
    //         System.out.println("");
    //         return "";
    //     }
    // }

    private long extractCurrentRating(Document doc) {
        try {
            Element ratingElement = doc.select(".rating-number").first();
            if(ratingElement != null) {
                String ratingText = ratingElement.text().replaceAll("[^0-9]", "");
                if(!ratingText.isEmpty()) {
                    return Long.parseLong(ratingText);
                }
            }
            return 0;
        } catch(Exception e) {
            return 0;
        }
    }

    private long extractMaxRating(Document doc)  {
        try {
            Element maxRatingElement = doc.select(".rating-header .small").first();
            if(maxRatingElement != null) {
                String text = maxRatingElement.text();
                Pattern pattern = Pattern.compile("\\(max\\s*(\\d+)\\)");
                Matcher matcher = pattern.matcher(text);
                if(matcher.find()) {
                    return Long.parseLong(matcher.group(1));
                }
            }
            return extractCurrentRating(doc);
        } catch(Exception e) {
            return 0;
        }
    }

    private String extractStars(Document doc) {
        try {
            Elements starElements = doc.select(".rating .star");
            return starElements.size() + " Star";
        } catch(Exception e) {
            return "Unrated";
        }
    }

    private long extractTotalProblemsSolved(Document doc) {
        try {
            Elements problemStats = doc.select(".problems-solved .number");
            if(!problemStats.isEmpty()) {
                String text = problemStats.first().text().replaceAll("[^0-9]", "");
                if(!text.isEmpty()) {
                    return Long.parseLong(text);
                }
            }
            return 0;
        } catch(Exception e) {
            return 0;
        }
    }

    
}
