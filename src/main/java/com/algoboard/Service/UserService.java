package com.algoboard.Service;

import com.algoboard.Entities.User;
import com.algoboard.DTO.Codeforces.CFContestDTO;
import com.algoboard.DTO.Codeforces.CFSubmissionsDTO;
import com.algoboard.DTO.Codeforces.CFUserDTO;
import com.algoboard.Entities.Codeforces;
import com.algoboard.Entities.ContestHistory;

import java.util.Map;
import java.util.Set;
import java.util.HashSet;
import java.util.AbstractMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Objects;
import org.springframework.web.client.RestTemplate;

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
                String submissionsUrl = "https://codeforces.com/api/user.status?handle=" + username + "&from=" + from+ "&count=" + count;
                CFSubmissionsDTO submissionsResponse = restTemplate.getForObject(submissionsUrl, CFSubmissionsDTO.class);
                if (submissionsResponse == null || !Objects.equals(submissionsResponse.getStatus(), "OK")) {
                    break;
                }
                totalSubmissions += submissionsResponse.getResult().size();
                for (CFSubmissionsDTO.Result submission : submissionsResponse.getResult()) {
                    if (submission.getVerdict().equals("OK")) {
                        acceptedSubmissions++;
                    }
                    problemSet.add(new AbstractMap.SimpleEntry<>(submission.getProblem().getContestId(), submission.getProblem().getIndex()));
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
                    contestHistory
                    );
        } catch (Exception e) {
            System.out.println("");
            System.out.println("Error fetching Codeforces profile: " + e.getMessage());
            System.out.println("");
            throw new RuntimeException("Failed to fetch Codeforces profile for user: " + username);
        }
    }
}
