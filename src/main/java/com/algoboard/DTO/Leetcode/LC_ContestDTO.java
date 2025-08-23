package com.algoboard.DTO.Leetcode;

import java.util.List;

public class LC_ContestDTO {

    private int attendedContestsCount;
    private Badge badge;
    private List<ContestHistory> contestHistory;
    private int globalRanking;
    private String message;
    private double rating;
    private String status;
    private double topPercentage;
    private int totalParticipants;

    // Getters and Setters
    public int getAttendedContestsCount() {
        return attendedContestsCount;
    }

    public void setAttendedContestsCount(int attendedContestsCount) {
        this.attendedContestsCount = attendedContestsCount;
    }

    public Badge getBadge() {
        return badge;
    }

    public void setBadge(Badge badge) {
        this.badge = badge;
    }

    public List<ContestHistory> getContestHistory() {
        return contestHistory;
    }

    public void setContestHistory(List<ContestHistory> contestHistory) {
        this.contestHistory = contestHistory;
    }

    public int getGlobalRanking() {
        return globalRanking;
    }

    public void setGlobalRanking(int globalRanking) {
        this.globalRanking = globalRanking;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getTopPercentage() {
        return topPercentage;
    }

    public void setTopPercentage(double topPercentage) {
        this.topPercentage = topPercentage;
    }

    public int getTotalParticipants() {
        return totalParticipants;
    }

    public void setTotalParticipants(int totalParticipants) {
        this.totalParticipants = totalParticipants;
    }

    // Inner Classes
    public static class Badge {
        private String name;

        public Badge(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }

    public static class ContestHistory {
        private boolean attended;
        private Contest contest;
        private int finishTimeInSeconds;
        private int problemsSolved;
        private int ranking;
        private double rating;
        private int totalProblems;
        private String trendDirection;

        public ContestHistory(boolean attended, Contest contest, int finishTimeInSeconds, int problemsSolved, int ranking, double rating, int totalProblems, String trendDirection) {
            this.attended = attended;
            this.contest = contest;
            this.finishTimeInSeconds = finishTimeInSeconds;
            this.problemsSolved = problemsSolved;
            this.ranking = ranking;
            this.rating = rating;
            this.totalProblems = totalProblems;
            this.trendDirection = trendDirection;
        }

        // Getters and Setters
        public boolean isAttended() {
            return attended;
        }

        public void setAttended(boolean attended) {
            this.attended = attended;
        }

        public Contest getContest() {
            return contest;
        }

        public void setContest(Contest contest) {
            this.contest = contest;
        }

        public int getFinishTimeInSeconds() {
            return finishTimeInSeconds;
        }

        public void setFinishTimeInSeconds(int finishTimeInSeconds) {
            this.finishTimeInSeconds = finishTimeInSeconds;
        }

        public int getProblemsSolved() {
            return problemsSolved;
        }

        public void setProblemsSolved(int problemsSolved) {
            this.problemsSolved = problemsSolved;
        }

        public int getRanking() {
            return ranking;
        }

        public void setRanking(int ranking) {
            this.ranking = ranking;
        }

        public double getRating() {
            return rating;
        }

        public void setRating(double rating) {
            this.rating = rating;
        }

        public int getTotalProblems() {
            return totalProblems;
        }

        public void setTotalProblems(int totalProblems) {
            this.totalProblems = totalProblems;
        }

        public String getTrendDirection() {
            return trendDirection;
        }

        public void setTrendDirection(String trendDirection) {
            this.trendDirection = trendDirection;
        }
    }

    public static class Contest {
        private long startTime;
        private String title;
        public Contest(long startTime, String title) {
            this.startTime = startTime;
            this.title = title;
        }

        public long getStartTime() {
            return startTime;
        }

        public void setStartTime(long startTime) {
            this.startTime = startTime;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }
    }
}
