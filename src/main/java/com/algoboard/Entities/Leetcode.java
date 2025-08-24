package com.algoboard.entities;

import java.util.List;

public class Leetcode {

    private String username;
    private String rank;
    private long rating;
    private long maxRating;
    private Level problemsSolved;
    private Level totalSubmissions;
    private Level acceptedSubmissions;
    private long contestParticipations;
    private List<UserContestHistory> contestHistory;
    private List<Problem> recentSubmissions;

    public static class Level {
        private long all;
        private long easy;
        private long medium;
        private long hard;

        public Level(long all, long easy, long medium, long hard) {
            this.all = all;
            this.easy = easy;
            this.medium = medium;
            this.hard = hard;
        }

        public long getAll() {
            return all;
        }

        public void setAll(long all) {
            this.all = all;
        }

        public long getEasy() {
            return easy;
        }

        public void setEasy(long easy) {
            this.easy = easy;
        }

        public long getMedium() {
            return medium;
        }

        public void setMedium(long medium) {
            this.medium = medium;
        }

        public long getHard() {
            return hard;
        }

        public void setHard(long hard) {
            this.hard = hard;
        }
    }

    public static class Problem {
        private String status;
        private String problemTitle;
        private String problemUrl;

        public Problem(String status, String problemTitle, String problemUrl) {
            this.status = status;
            this.problemTitle = problemTitle;
            this.problemUrl = problemUrl;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getProblemTitle() {
            return problemTitle;
        }

        public void setProblemTitle(String problemTitle) {
            this.problemTitle = problemTitle;
        }

        public String getProblemUrl() {
            return problemUrl;
        }

        public void setProblemUrl(String problemUrl) {
            this.problemUrl = problemUrl;
        }
    }

    public Leetcode() {
    }

    public Leetcode(String username, String rank, long rating, long maxRating,
            Level problemsSolved, Level totalSubmissions, Level acceptedSubmissions,
            long contestParticipations, List<UserContestHistory> contestHistory, List<Problem> recentSubmissions) {
        this.username = username;
        this.rank = rank;
        this.rating = rating;
        this.maxRating = maxRating;
        this.problemsSolved = problemsSolved;
        this.totalSubmissions = totalSubmissions;
        this.acceptedSubmissions = acceptedSubmissions;
        this.contestParticipations = contestParticipations;
        this.contestHistory = contestHistory;
        this.recentSubmissions = recentSubmissions;
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

    public Level getProblemsSolved() {
        return problemsSolved;
    }

    public void setProblemsSolved(Level problemsSolved) {
        this.problemsSolved = problemsSolved;
    }

    public Level getTotalSubmissions() {
        return totalSubmissions;
    }

    public void setTotalSubmissions(Level totalSubmissions) {
        this.totalSubmissions = totalSubmissions;
    }

    public Level getAcceptedSubmissions() {
        return acceptedSubmissions;
    }

    public void setAcceptedSubmissions(Level acceptedSubmissions) {
        this.acceptedSubmissions = acceptedSubmissions;
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

    public List<Problem> getRecentSubmissions() {
        return recentSubmissions;
    }

    public void setRecentSubmissions(List<Problem> recentSubmissions) {
        this.recentSubmissions = recentSubmissions;
    }
}
