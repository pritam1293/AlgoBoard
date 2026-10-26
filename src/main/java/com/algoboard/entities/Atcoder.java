package com.algoboard.entities;

import java.util.List;

public class Atcoder extends Platforms {

    private String maxRank;

    public Atcoder() {
        super();
    }

    public Atcoder(String username, String rank, long rating, long maxRating, String maxRank, long contestParticipations, List<UserContestHistory> contestHistory) {
        super(username, rank, rating, maxRating, contestParticipations, contestHistory);
        this.maxRank = maxRank;
    }

    public String getMaxRank() {
        return maxRank;
    }

    public void setMaxRank(String maxRank) {
        this.maxRank = maxRank;
    }
}
