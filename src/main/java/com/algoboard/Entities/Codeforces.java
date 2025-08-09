package com.algoboard.Entities;

import java.util.AbstractMap;
import java.util.List;
import java.util.Set;

public class Codeforces extends Platforms {

    private Set<AbstractMap.SimpleEntry<Long, String>> problemSet;

    public Codeforces(String username, String rank, long rating, long maxRating, String maxRank, long problemsSolved,
            long totalSubmissions, long acceptedSubmissions, long contestParticipations,
            List<ContestHistory> contestHistory, Set<AbstractMap.SimpleEntry<Long, String>> problemSet) {
                
        super(username, rank, rating, maxRating, maxRank, problemsSolved, totalSubmissions, acceptedSubmissions, contestParticipations, contestHistory);
        this.problemSet = problemSet;
    }

    public Set<AbstractMap.SimpleEntry<Long, String>> getProblemSet() {
        return problemSet;
    }

    public void setProblemSet(Set<AbstractMap.SimpleEntry<Long, String>> problemSet) {
        this.problemSet = problemSet;
    }
}
