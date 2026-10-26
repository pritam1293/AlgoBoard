package com.algoboard.entities;

import java.util.List;

public abstract class Platforms {
    private String username;
    private String rank;
    private long rating;
    private long maxRating;
    private long contestParticipations;
    private List<UserContestHistory> contestHistory;


    public Platforms() {
        
    }

    public Platforms(String username, String rank, long rating, long maxRating, long contestParticipations, List<UserContestHistory> contestHistory) {
        this.username = username;
        this.rank = rank;
        this.rating = rating;
        this.maxRating = maxRating;
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

    public long getContestParticipations() {
        return contestParticipations;
    }

    public void setContestParticipations(long contestParticipations) {
        this.contestParticipations = contestParticipations;
    }

    public List<UserContestHistory> getContestHistory() {
        return contestHistory;
    }

    public void setContestHistory(List<UserContestHistory> contestHistory) {
        this.contestHistory = contestHistory;
    }
}
