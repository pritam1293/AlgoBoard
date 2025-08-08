package com.algoboard.Entities;

public class ContestHistory {
    private String contestId;
    private String contestName;
    private long rank;
    private long oldRating;
    private long newRating;

    public ContestHistory(String contestId, String contestName, long rank, long oldRating, long newRating) {
        this.contestId = contestId;
        this.contestName = contestName;
        this.rank = rank;
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

    public long getRank() {
        return rank;
    }

    public void setRank(long rank) {
        this.rank = rank;
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
