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
import com.algoboard.DTO.Leetcode.LC_ContestDTO;
import com.algoboard.DTO.Leetcode.LC_UserDTO;
import com.algoboard.DTO.Leetcode.LC_ContestDTO.ContestHistory;
import com.algoboard.DTO.Leetcode.LC_UserDTO.RecentSubmission;
import com.algoboard.DTO.Leetcode.LC_UserDTO.SubmissionStat;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
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
    private static final String CODECHEF_USER_AGENT =
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

    private final RestTemplate restTemplate;
    private final Validation validation;
    private final ObjectMapper objectMapper;

    public ProfileFetchingService(RestTemplate restTemplate, Validation validation, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.validation = validation;
        this.objectMapper = objectMapper;
    }

    /* CODEFORCES */

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

    /* ATCODER */
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
            String currRank = getAtcoderRankByRating(currRating);
            String maxRank = getAtcoderRankByRating(maxRating);

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

    private String getAtcoderRankByRating(long rating) {
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
    
    /* CODECHEF */

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
            long currentRating = 0;
            long maxRating = 0;
            for (UserContestHistory contest : history) {
                currentRating = contest.getNewRating();
                maxRating = Math.max(maxRating, contest.getNewRating());
            }

            if (history.isEmpty()) {
                currentRating = parseCodechefCurrentRating(document);
                maxRating = currentRating;
            }

            // The profile page lists contests oldest-first; the API contract is newest-first.
            Collections.reverse(history);

            Codechef codechefProfile = new Codechef();
            codechefProfile.setUsername(username);
            codechefProfile.setRating(currentRating);
            codechefProfile.setMaxRating(maxRating);
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
        headers.set(HttpHeaders.USER_AGENT, CODECHEF_USER_AGENT);
        headers.set(HttpHeaders.ACCEPT, "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
        headers.set(HttpHeaders.ACCEPT_LANGUAGE, "en-US,en;q=0.9");

        ResponseEntity<String> response = restTemplate.exchange(
                CODECHEF_PROFILE_URL + username, Objects.requireNonNull(HttpMethod.GET), new HttpEntity<>(headers), String.class);
        String body = response.getBody();
        if (!response.getStatusCode().is2xxSuccessful() || body == null || body.isBlank()) {
            return null;
        }
        return Jsoup.parse(body, CODECHEF_PROFILE_URL + username);
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
    
    /* LEETCODE */

    // Fetch and aggregate Leetcode profile data
    public Leetcode fetchLeetcodeProfile(String username) {
        requireValidUsername(username);
        String lcuserurl = "https://leetcode-stats.tashif.codes/" + username + "/profile";
        String lccontesturl = "https://leetcode-stats.tashif.codes/" + username + "/contests";

        try {
            // Start both API calls simultaneously
            CompletableFuture<LC_UserDTO> userProfileFuture = CompletableFuture
                    .supplyAsync(() -> {
                        try {
                            LC_UserDTO response = restTemplate.getForObject(lcuserurl, LC_UserDTO.class);
                            return response;
                        } catch (Exception e) {
                            return null;
                        }
                    });

            CompletableFuture<LC_ContestDTO> contestFuture = CompletableFuture
                    .supplyAsync(() -> {
                        try {
                            LC_ContestDTO response = restTemplate.getForObject(lccontesturl, LC_ContestDTO.class);
                            return response;
                        } catch (Exception e) {
                            return null;
                        }
                    });

            // Wait for both API calls to complete with timeout protection
            LC_UserDTO userProfileResponse = null;
            LC_ContestDTO contestResponse = null;

            try {
                userProfileResponse = userProfileFuture.get(10, TimeUnit.SECONDS);
            } catch (Exception e) {
                logger.warn("LeetCode profile API timed out or failed");
            }

            try {
                contestResponse = contestFuture.get(10, TimeUnit.SECONDS);
            } catch (Exception e) {
                logger.warn("LeetCode contest API timed out or failed");
            }

            // Check if we got valid responses
            if (userProfileResponse == null && contestResponse == null) {
                return new Leetcode();
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
                leetcodeProfile.setUsername(username);
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
                Collections.reverse(contestHistory);

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

            return leetcodeProfile;
        } catch (Exception e) {
            logger.warn("LeetCode profile fetch failed: {}", e.getClass().getSimpleName());
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
        // Same RequestEntity overload as above, to keep the call site free of a
        // @NonNull HttpMethod parameter.
        RequestEntity<String> request = RequestEntity
                .post(Objects.requireNonNull(URI.create(LEETCODE_GRAPHQL_URL)))
                .headers(headers)
                .body(Objects.requireNonNull(objectMapper.writeValueAsString(payload)));

        ResponseEntity<String> response = restTemplate.exchange(request, String.class);
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
