package com.algoboard.DTO.Atcoder;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ACcontestDTO {
    @JsonProperty("IsRated")
    private boolean IsRated;

    @JsonProperty("Place")
    private long Place;

    @JsonProperty("OldRating")
    private long OldRating;

    @JsonProperty("NewRating")
    private long NewRating;

    @JsonProperty("ContestName")
    private String ContestName;

    public ACcontestDTO(boolean isRated, long place, long oldRating, long newRating, String contestName) {
        IsRated = isRated;
        Place = place;
        OldRating = oldRating;
        NewRating = newRating;
        ContestName = contestName;
    }

    public boolean isRated() {
        return IsRated;
    }

    public long getPlace() {
        return Place;
    }

    public long getOldRating() {
        return OldRating;
    }

    public long getNewRating() {
        return NewRating;
    }

    public String getContestName() {
        return ContestName;
    }
}
