package com.algoboard.entities;

import java.util.AbstractMap;
import java.util.List;
import java.util.Set;

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
    private List<ContestHistory> contestHistory;
    private Set<AbstractMap.SimpleEntry<Long, String>> problemSet;


    public Codeforces(String username, String rank, long rating, long maxRating, String maxRank, long problemsSolved,
            long totalSubmissions, long acceptedSubmissions, long contestParticipations,
            List<ContestHistory> contestHistory, Set<AbstractMap.SimpleEntry<Long, String>> problemSet) {

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
        this.problemSet = problemSet;
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

    public Set<AbstractMap.SimpleEntry<Long, String>> getProblemSet() {
        return problemSet;
    }

    public void setProblemSet(Set<AbstractMap.SimpleEntry<Long, String>> problemSet) {
        this.problemSet = problemSet;
    }
}
