package com.algoboard.DTO.Codeforces;

import java.util.List;

public class CF_ContestHistoryDTO {
    private String status;
    private List<Result> result;

    public static class Result {
        private long contestId;
        private String contestName;
        private long rank;
        private long oldRating;
        private long newRating;

        public Result(long contestId, String contestName, long rank, long oldRating, long newRating) {
            this.contestId = contestId;
            this.contestName = contestName;
            this.rank = rank;
            this.oldRating = oldRating;
            this.newRating = newRating;
        }

        //getters
        public long getContestId() {
            return contestId;
        }

        public String getContestName() {
            return contestName;
        }

        public long getRank() {
            return rank;
        }

        public long getOldRating() {
            return oldRating;
        }

        public long getNewRating() {
            return newRating;
        }
    }

    public String getStatus() {
        return status;
    }

    public List<Result> getResult() {
        return result;
    }
}
