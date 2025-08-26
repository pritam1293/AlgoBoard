package com.algoboard.entities;

import java.util.List;

public class Codeforces {
    private String username;
    private String rank;
    private long rating;
    private long maxRating;
    private String maxRank;
    private long problemsSolved;
    private long totalSubmissions;
    private long acceptedSubmissions;
    private long contestParticipations;
    private List<UserContestHistory> contestHistory;
    private List<Problem> recentSubmissions;

    public static class Problem {
        private long id;
        private String index;
        private String name;
        private String status;

        public Problem(long id, String index, String name, String status) {
            this.id = id;
            this.index = index;
            this.name = name;
            this.status = status;
        }

        // Getters and Setters
        public long getId() {
            return id;
        }

        public void setId(long id) {
            this.id = id;
        }

        public String getIndex() {
            return index;
        }

        public void setIndex(String index) {
            this.index = index;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public Codeforces(String username, String rank, long rating, long maxRating, String maxRank, long problemsSolved,
            long totalSubmissions, long acceptedSubmissions, long contestParticipations,
            List<UserContestHistory> contestHistory, List<Problem> recentSubmissions) {

        this.username = username;
        this.rank = rank;
        this.rating = rating;
        this.maxRating = maxRating;
        this.maxRank = maxRank;
        this.problemsSolved = problemsSolved;
        this.totalSubmissions = totalSubmissions;
        this.acceptedSubmissions = acceptedSubmissions;
        this.contestParticipations = contestParticipations;
        this.contestHistory = contestHistory;
        this.recentSubmissions = recentSubmissions;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRank() {
        return rank;
    }

    public void setRank(String rank) {
        this.rank = rank;
    }

    public long getRating() {
        return rating;
    }

    public void setRating(long rating) {
        this.rating = rating;
    }

    public long getMaxRating() {
        return maxRating;
    }

    public void setMaxRating(long maxRating) {
        this.maxRating = maxRating;
    }

    public String getMaxRank() {
        return maxRank;
    }

    public void setMaxRank(String maxRank) {
        this.maxRank = maxRank;
    }

    public long getProblemsSolved() {
        return problemsSolved;
    }

    public void setProblemsSolved(long problemsSolved) {
        this.problemsSolved = problemsSolved;
    }

    public long getTotalSubmissions() {
        return totalSubmissions;
    }

    public void setTotalSubmissions(long totalSubmissions) {
        this.totalSubmissions = totalSubmissions;
    }

    public long getAcceptedSubmissions() {
        return acceptedSubmissions;
    }

    public void setAcceptedSubmissions(long acceptedSubmissions) {
        this.acceptedSubmissions = acceptedSubmissions;
    }

    public long getContestParticipations() {
        return contestParticipations;
    }

    public void setContestParticipations(long contestParticipations) {
        this.contestParticipations = contestParticipations;
    }

    public List<UserContestHistory> getContestHistory() {
        return contestHistory;
    }

    public List<Problem> getRecentSubmissions() {
        return recentSubmissions;
    }

    public void setRecentSubmissions(List<Problem> recentSubmissions) {
        this.recentSubmissions = recentSubmissions;
    }
}
