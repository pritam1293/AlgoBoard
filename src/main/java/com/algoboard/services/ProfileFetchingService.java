package com.algoboard.services;

import com.algoboard.entities.Leetcode;
import com.algoboard.entities.Codechef;
import com.algoboard.entities.Codeforces;
import com.algoboard.entities.Atcoder;
import com.algoboard.entities.UserContestHistory;
import com.algoboard.entities.Leetcode.Level;
import com.algoboard.entities.Leetcode.Problem;
import com.algoboard.DTO.Atcoder.AC_ContestDTO;
import com.algoboard.DTO.Codechef.CC_ContestDTO;
import com.algoboard.DTO.Codeforces.CF_ContestDTO;
import com.algoboard.DTO.Codeforces.CF_SubmissionsDTO;
import com.algoboard.DTO.Codeforces.CF_UserDTO;
import com.algoboard.DTO.Leetcode.LC_ContestDTO;
import com.algoboard.DTO.Leetcode.LC_UserDTO;
import com.algoboard.DTO.Leetcode.LC_ContestDTO.ContestHistory;
import com.algoboard.DTO.Leetcode.LC_UserDTO.RecentSubmission;
import com.algoboard.DTO.Leetcode.LC_UserDTO.SubmissionStat;
import com.algoboard.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.HashSet;

@Service
public class ProfileFetchingService {

    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    public ProfileFetchingService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.restTemplate = new RestTemplate();
    }

    // Fetch and aggregate Codeforces profile data
    public Codeforces fetchCodeforcesProfile(String username) {
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

    // Fetch and aggregate Atcoder profile data
    public Atcoder fetchAtcoderProfile(String username) {
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
    
    // Fetch and aggregate Codechef profile data
    public Codechef fetchCodechefProfile(String username) {
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
    
    // Fetch and aggregate Leetcode profile data
    public Leetcode fetchLeetcodeProfile(String username) {
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
