package com.algoboard.entities;

import java.util.List;

public abstract class Platforms {
    private String username;
    private String rank;
    private long rating;
    private long maxRating;
    private String maxRank;
    private long problemsSolved;
    private long totalSubmissions;
    private long acceptedSubmissions;
    private long contestParticipations;
    private List<ContestHistory> contestHistory;


    public Platforms(String username, String rank, long rating, long maxRating, String maxRank, long problemsSolved, long totalSubmissions, long acceptedSubmissions, long contestParticipations, List<ContestHistory> contestHistory) {
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

    public List<ContestHistory> getContestHistory() {
        return contestHistory;
    }

    public void setContestHistory(List<ContestHistory> contestHistory) {
        this.contestHistory = contestHistory;
    }
}
