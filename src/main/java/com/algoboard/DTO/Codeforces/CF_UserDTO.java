package com.algoboard.DTO.Codeforces;

import java.util.List;

public class CF_UserDTO {
    private String status;
    private List<Result> result;

    public static class Result {
        private String handle;
        private String firstName;
        private String lastName;
        private long rating;
        private String rank;
        private String maxRank;
        private long maxRating;

        public Result(String handle, String firstName, String lastName, String rank, long rating, String maxRank, long maxRating) {
            this.handle = handle;
            this.firstName = firstName;
            this.lastName = lastName;
            this.rating = rating;
            this.rank = rank;
            this.maxRank = maxRank;
            this.maxRating = maxRating;
        }

        public String getHandle() {
            return handle;
        }

        public String getFirstName() {
            return firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public String getRank() {
            return rank;
        }

        public long getRating() {
            return rating;
        }

        public long getMaxRating() {
            return maxRating;
        }

        public String getMaxRank() {
            return maxRank;
        }
    }

    public String getStatus() {
        return status;
    }

    public List<Result> getResult() {
        return result;
    }
}
