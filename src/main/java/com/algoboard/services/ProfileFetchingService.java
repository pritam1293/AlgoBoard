package com.algoboard.services;

import com.algoboard.entities.Leetcode;
import com.algoboard.entities.Codechef;
import com.algoboard.entities.Codeforces;
import com.algoboard.entities.Atcoder;
import com.algoboard.entities.UserContestHistory;
import com.algoboard.entities.Leetcode.Level;
import com.algoboard.entities.Leetcode.Problem;
import com.algoboard.DTO.Atcoder.AC_ContestDTO;
import com.algoboard.DTO.Codeforces.CF_ContestHistoryDTO;
import com.algoboard.DTO.Codeforces.CF_SubmissionsDTO;
import com.algoboard.DTO.Codeforces.CF_UserDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;

@Service
public class ProfileFetchingService {

    private static final Logger logger = LoggerFactory.getLogger(ProfileFetchingService.class);
    private static final Pattern ATCODER_CONTEST_NAME_PATTERN =
            Pattern.compile("(atcoder\\s+.*?\\s+contest\\s+\\d+)", Pattern.CASE_INSENSITIVE);
    private static final Pattern CODECHEF_ALL_RATING_PATTERN =
            Pattern.compile("var\\s+all_rating\\s*=\\s*(\\[.*?\\])\\s*;", Pattern.DOTALL);
    private static final Pattern DIGITS_PATTERN = Pattern.compile("\\d+");
    private static final String CODECHEF_PROFILE_URL = "https://www.codechef.com/users/";
    private static final String LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";
    private static final String BROWSER_USER_AGENT =
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
    private static final String LEETCODE_PROFILE_QUERY = """
            query userProfile($username: String!) {
              matchedUser(username: $username) {
                username
                submitStats {
                  acSubmissionNum { difficulty count submissions }
                  totalSubmissionNum { difficulty count submissions }
                }
              }
              userContestRanking(username: $username) {
                attendedContestsCount
                rating
                globalRanking
                totalParticipants
                topPercentage
                badge { name }
              }
              userContestRankingHistory(username: $username) {
                attended
                trendDirection
                problemsSolved
                totalProblems
                finishTimeInSeconds
                rating
                ranking
                contest { title startTime }
              }
              recentSubmissionList(username: $username, limit: 10) {
                title
                titleSlug
                statusDisplay
                timestamp
              }
            }
            """;

    private final RestTemplate restTemplate;
    private final Validation validation;
    private final ObjectMapper objectMapper;

    public ProfileFetchingService(RestTemplate restTemplate, Validation validation, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.validation = validation;
        this.objectMapper = objectMapper;
    }

    // Fetch and aggregate Codeforces profile data
    public Codeforces fetchCodeforcesProfile(String username) {
        requireValidUsername(username);
        String profileUrl = "https://codeforces.com/api/user.info?handles=" + username;
        String contestUrl = "https://codeforces.com/api/user.rating?handle=" + username;
        try {
            // Execute API calls in parallel
            CompletableFuture<CF_UserDTO> profileFuture = CompletableFuture
                    .supplyAsync(() -> restTemplate.getForObject(profileUrl, CF_UserDTO.class));
            CompletableFuture<CF_ContestHistoryDTO> contestFuture = CompletableFuture
                    .supplyAsync(() -> restTemplate.getForObject(contestUrl, CF_ContestHistoryDTO.class));

            // Wait for both API calls to complete with timeout
            CF_UserDTO profileResponse = profileFuture.get(10, TimeUnit.SECONDS);
            CF_ContestHistoryDTO contestResponse = contestFuture.get(10, TimeUnit.SECONDS);

            if (profileResponse == null || profileResponse.getStatus().equals("FAILED")) {
                return new Codeforces();
            }
            if (contestResponse == null || contestResponse.getStatus().equals("FAILED")) {
                return new Codeforces();
            }
            long from = 1;
            long count = 1000;
            long totalSubmissions = 0;
            long acceptedSubmissions = 0;
            Set<AbstractMap.SimpleEntry<Long, String>> problemSet = new HashSet<>();
            List<Codeforces.Problem> recentSubmissions = new ArrayList<>();

            while (true) {
                String submissionsUrl = "https://codeforces.com/api/user.status?handle=" + username + "&from=" + from
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
                        // last 10 submissions
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
            List<CF_ContestHistoryDTO.Result> contestResults = contestResponse.getResult();
            List<UserContestHistory> contestHistory = new ArrayList<>();
            if (contestResults != null) {
                for (CF_ContestHistoryDTO.Result contestResult : contestResults) {
                    contestHistory.add(new UserContestHistory(
                            Long.toString(contestResult.getContestId()),
                            contestResult.getContestName(),
                            contestResult.getRank(),
                            contestResult.getOldRating(),
                            contestResult.getNewRating()));
                }

                // Reverse the contest history array
                Collections.reverse(contestHistory);
            }
            return new Codeforces(
                    username,
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
            return new Codeforces();
        }
    }

    // Fetch and aggregate Atcoder profile data
    public Atcoder fetchAtcoderProfile(String username) {
        requireValidUsername(username);
        String url = "https://atcoder.jp/users/" + username + "/history/json";

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

            Collections.reverse(history);

            return new Atcoder(
                    username,
                    currRank,
                    currRating,
                    maxRating,
                    maxRank,
                    contestParticipations,
                    history);
        } catch (Exception e) {
            return new Atcoder();
        }
    }

    private String contestNameExtractor(String originalName) {
        Matcher matcher = ATCODER_CONTEST_NAME_PATTERN.matcher(originalName);
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
    
    // Fetch and aggregate CodeChef profile data by scraping the public profile page.
    // Contest lists are unaffected and still come from the CodeChef contests API.
    public Codechef fetchCodechefProfile(String username) {
        requireValidUsername(username);
        try {
            Document document = fetchCodechefProfilePage(username);
            if (document == null) {
                return new Codechef();
            }

            List<UserContestHistory> history = extractCodechefContestHistory(document);
            long currentRating = -1;
            long maxRating = -1;
            for (UserContestHistory contest : history) {
                currentRating = contest.getNewRating();
                maxRating = Math.max(maxRating, contest.getNewRating());
            }

            if (history.isEmpty()) {
                long pageRating = parseCodechefCurrentRating(document);
                if (pageRating > 0) {
                    currentRating = pageRating;
                    maxRating = pageRating;
                }
            }

            // The profile page lists contests oldest-first; the API contract is newest-first.
            Collections.reverse(history);

            Codechef codechefProfile = new Codechef();
            codechefProfile.setUsername(username);
            codechefProfile.setRating(currentRating < 0 ? 0 : currentRating);
            codechefProfile.setMaxRating(maxRating < 0 ? 0 : maxRating);
            codechefProfile.setRank(getCodechefRankByRating(currentRating));
            codechefProfile.setMaxRank(getCodechefRankByRating(maxRating));
            codechefProfile.setContestParticipations(history.size());
            codechefProfile.setContestHistory(history);
            return codechefProfile;
        } catch (Exception e) {
            logger.warn("CodeChef profile scrape failed for {}: {}", username, e.getClass().getSimpleName());
            return new Codechef();
        }
    }

    private Document fetchCodechefProfilePage(String username) {
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.USER_AGENT, BROWSER_USER_AGENT);
        headers.set(HttpHeaders.ACCEPT, "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
        headers.set(HttpHeaders.ACCEPT_LANGUAGE, "en-US,en;q=0.9");

        ResponseEntity<String> response = restTemplate.exchange(
                CODECHEF_PROFILE_URL + username, Objects.requireNonNull(HttpMethod.GET),
                new HttpEntity<>(headers), String.class);
        String body = response.getBody();
        if (!response.getStatusCode().is2xxSuccessful() || body == null || body.isBlank()) {
            return null;
        }

        Document document = Jsoup.parse(body, CODECHEF_PROFILE_URL + username);
        // Unknown handles redirect to the CodeChef home page, which has none of these markers.
        boolean looksLikeProfile = document.selectFirst("#rating-block-all") != null
                || document.selectFirst(".rating-header") != null
                || document.selectFirst(".rating-number") != null
                || CODECHEF_ALL_RATING_PATTERN.matcher(body).find();
        if (!looksLikeProfile) {
            logger.warn("CodeChef profile page not found for {}", username);
            return null;
        }
        return document;
    }

    private List<UserContestHistory> extractCodechefContestHistory(Document document) throws Exception {
        List<UserContestHistory> history = new ArrayList<>();
        Matcher matcher = CODECHEF_ALL_RATING_PATTERN.matcher(document.html());
        if (!matcher.find()) {
            return history;
        }

        JsonNode ratings = objectMapper.readTree(matcher.group(1));
        if (ratings == null || !ratings.isArray()) {
            return history;
        }

        // all_rating entries are chronological and only carry the post-contest rating,
        // so the previous entry's rating becomes the old rating of the next one.
        long previousRating = 0;
        for (JsonNode contest : ratings) {
            long newRating = contest.path("rating").asLong(previousRating);
            history.add(new UserContestHistory(
                    contest.path("code").asText(""),
                    contest.path("name").asText(""),
                    contest.path("rank").asLong(0),
                    previousRating,
                    newRating));
            previousRating = newRating;
        }
        return history;
    }

    private long parseCodechefCurrentRating(Document document) {
        Element ratingElement = document.selectFirst("#rating-block-all .rating-number");
        if (ratingElement == null) {
            ratingElement = document.selectFirst(".rating-number");
        }
        if (ratingElement == null) {
            return 0;
        }
        Matcher matcher = DIGITS_PATTERN.matcher(ratingElement.text());
        return matcher.find() ? Long.parseLong(matcher.group()) : 0;
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
    
    // Fetch and aggregate LeetCode profile data from LeetCode's own public GraphQL endpoint.
    // The HTML profile pages are Cloudflare-protected, so GraphQL is the server-side source.
    public Leetcode fetchLeetcodeProfile(String username) {
        requireValidUsername(username);
        try {
            JsonNode data = queryLeetcodeProfile(username);
            if (data == null) {
                return new Leetcode();
            }

            JsonNode matchedUser = data.path("matchedUser");
            JsonNode contestRanking = data.path("userContestRanking");
            if (isNullOrMissing(matchedUser) && isNullOrMissing(contestRanking)) {
                return new Leetcode();
            }

            Leetcode leetcodeProfile = new Leetcode();
            leetcodeProfile.setUsername(username);

            JsonNode submitStats = matchedUser.path("submitStats");
            leetcodeProfile.setProblemsSolved(
                    buildLeetcodeLevel(submitStats.path("acSubmissionNum"), true));
            leetcodeProfile.setAcceptedSubmissions(
                    buildLeetcodeLevel(submitStats.path("acSubmissionNum"), false));
            leetcodeProfile.setTotalSubmissions(
                    buildLeetcodeLevel(submitStats.path("totalSubmissionNum"), false));
            leetcodeProfile.setRecentSubmissions(buildLeetcodeRecentSubmissions(data.path("recentSubmissionList")));

            long currentRating = 0;
            long maxRating = 0;
            long attendedContests = 0;
            if (isNullOrMissing(contestRanking)) {
                leetcodeProfile.setRank("Newbie");
            } else {
                currentRating = Math.round(contestRanking.path("rating").asDouble(0));
                attendedContests = contestRanking.path("attendedContestsCount").asLong(0);
                JsonNode badgeName = contestRanking.path("badge").path("name");
                leetcodeProfile.setRank(
                        badgeName.isTextual() && !badgeName.asText().isBlank() ? badgeName.asText() : "Newbie");
            }

            List<UserContestHistory> contestHistory = new ArrayList<>();
            JsonNode history = data.path("userContestRankingHistory");
            long previousRating = 0;
            if (history.isArray()) {
                for (JsonNode contest : history) {
                    if (!contest.path("attended").asBoolean(false)) {
                        continue;
                    }
                    String contestTitle = contest.path("contest").path("title").asText("");
                    long newRating = Math.round(contest.path("rating").asDouble(0));
                    contestHistory.add(new UserContestHistory(
                            contestTitle.toLowerCase().replace(" ", "-"),
                            contestTitle,
                            contest.path("ranking").asLong(0),
                            previousRating,
                            newRating));
                    previousRating = newRating;
                    maxRating = Math.max(maxRating, newRating);
                }
            }
            // GraphQL history is oldest-first; the API contract is newest-first.
            Collections.reverse(contestHistory);

            leetcodeProfile.setContestHistory(contestHistory);
            leetcodeProfile.setContestParticipations(attendedContests);
            leetcodeProfile.setRating(currentRating);
            leetcodeProfile.setMaxRating(Math.max(maxRating, currentRating));
            return leetcodeProfile;
        } catch (Exception e) {
            logger.warn("LeetCode profile fetch failed for {}: {}", username, e.getClass().getSimpleName());
            return new Leetcode();
        }
    }

    private JsonNode queryLeetcodeProfile(String username) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(HttpHeaders.USER_AGENT, BROWSER_USER_AGENT);
        headers.set(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);
        headers.set(HttpHeaders.REFERER, "https://leetcode.com/u/" + username + "/");
        headers.set(HttpHeaders.ORIGIN, "https://leetcode.com");

        Map<String, Object> payload = Map.of(
                "query", LEETCODE_PROFILE_QUERY,
                "variables", Map.of("username", username));
        HttpEntity<String> request = new HttpEntity<>(objectMapper.writeValueAsString(payload), headers);

        ResponseEntity<String> response = restTemplate.exchange(
                LEETCODE_GRAPHQL_URL, Objects.requireNonNull(HttpMethod.POST), request, String.class);
        String body = response.getBody();
        if (!response.getStatusCode().is2xxSuccessful() || body == null || body.isBlank()) {
            return null;
        }

        JsonNode root = objectMapper.readTree(body);
        if (root.has("errors")) {
            logger.warn("LeetCode GraphQL returned errors for {}: {}", username, root.path("errors"));
            return null;
        }
        JsonNode data = root.path("data");
        return isNullOrMissing(data) ? null : data;
    }

    private Level buildLeetcodeLevel(JsonNode stats, boolean useSolvedCount) {
        Level level = new Level(0, 0, 0, 0);
        if (stats == null || !stats.isArray()) {
            return level;
        }
        for (JsonNode stat : stats) {
            long value = useSolvedCount
                    ? stat.path("count").asLong(0)
                    : stat.path("submissions").asLong(0);
            switch (stat.path("difficulty").asText("")) {
                case "All" -> level.setAll(value);
                case "Easy" -> level.setEasy(value);
                case "Medium" -> level.setMedium(value);
                case "Hard" -> level.setHard(value);
                default -> {
                    // Ignore unknown difficulty buckets.
                }
            }
        }
        return level;
    }

    private List<Problem> buildLeetcodeRecentSubmissions(JsonNode submissions) {
        List<Problem> recentSubmissions = new ArrayList<>();
        if (submissions == null || !submissions.isArray()) {
            return recentSubmissions;
        }
        for (JsonNode submission : submissions) {
            String titleSlug = submission.path("titleSlug").asText("");
            recentSubmissions.add(new Problem(
                    submission.path("statusDisplay").asText(""),
                    submission.path("title").asText(""),
                    "https://leetcode.com/problems/" + titleSlug + "/description"));
        }
        return recentSubmissions;
    }

    private boolean isNullOrMissing(JsonNode node) {
        return node == null || node.isMissingNode() || node.isNull();
    }

    private void requireValidUsername(String username) {
        if (username == null || username.isEmpty() || !validation.isValidPlatformUsername(username)) {
            throw new IllegalArgumentException("Invalid platform username format.");
        }
    }
}
