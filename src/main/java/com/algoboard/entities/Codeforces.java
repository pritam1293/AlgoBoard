package com.algoboard.entities;

import java.util.List;

public class Codeforces extends Platforms {

    private String maxRank;
    private long problemsSolved;
    private long totalSubmissions;
    private long acceptedSubmissions;
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

    public Codeforces() {
        super();
    }

    public Codeforces(String username, String rank, long rating, long maxRating, String maxRank, long problemsSolved,
            long totalSubmissions, long acceptedSubmissions, long contestParticipations,
            List<UserContestHistory> contestHistory, List<Problem> recentSubmissions) {

        super(username, rank, rating, maxRating, contestParticipations, contestHistory);
        this.maxRank = maxRank;
        this.problemsSolved = problemsSolved;
        this.totalSubmissions = totalSubmissions;
        this.acceptedSubmissions = acceptedSubmissions;
        this.recentSubmissions = recentSubmissions;
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

    public List<Problem> getRecentSubmissions() {
        return recentSubmissions;
    }

    public void setRecentSubmissions(List<Problem> recentSubmissions) {
        this.recentSubmissions = recentSubmissions;
    }
}
