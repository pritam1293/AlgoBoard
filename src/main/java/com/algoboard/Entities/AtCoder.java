package com.algoboard.entities;

import java.util.List;

public class Atcoder extends Platforms {

    public Atcoder(String username, String rank, long rating, long maxRating, String maxRank, long problemsSolved, long totalSubmissions, long acceptedSubmissions, long contestParticipations, List<ContestHistory> contestHistory) {
        super(username, rank, rating, maxRating, maxRank, problemsSolved, totalSubmissions, acceptedSubmissions, contestParticipations, contestHistory);
    }
}
