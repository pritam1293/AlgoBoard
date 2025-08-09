package com.algoboard.Entities;

public class ContestHistory {
    private String contestId;
    private String contestName;
    private long standing;
    private long oldRating;
    private long newRating;

    public ContestHistory(String contestId, String contestName, long standing, long oldRating, long newRating) {
        this.contestId = contestId;
        this.contestName = contestName;
        this.standing = standing;
        this.oldRating = oldRating;
        this.newRating = newRating;
    }

    public String getContestId() {
        return contestId;
    }

    public void setContestId(String contestId) {
        this.contestId = contestId;
    }

    public String getContestName() {
        return contestName;
    }

    public void setContestName(String contestName) {
        this.contestName = contestName;
    }

    public long getStanding() {
        return standing;
    }

    public void setStanding(long standing) {
        this.standing = standing;
    }

    public long getOldRating() {
        return oldRating;
    }

    public void setOldRating(long oldRating) {
        this.oldRating = oldRating;
    }

    public long getNewRating() {
        return newRating;
    }

    public void setNewRating(long newRating) {
        this.newRating = newRating;
    }
}
