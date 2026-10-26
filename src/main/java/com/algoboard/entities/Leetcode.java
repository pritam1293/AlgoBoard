package com.algoboard.entities;

import java.util.List;

public class Leetcode extends Platforms {

    private Level problemsSolved;
    private Level totalSubmissions;
    private Level acceptedSubmissions;
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
        super();
    }

    public Leetcode(String username, String rank, long rating, long maxRating,
            Level problemsSolved, Level totalSubmissions, Level acceptedSubmissions,
            long contestParticipations, List<UserContestHistory> contestHistory, List<Problem> recentSubmissions) {
        super(username, rank, rating, maxRating, contestParticipations, contestHistory);
        this.problemsSolved = problemsSolved;
        this.totalSubmissions = totalSubmissions;
        this.acceptedSubmissions = acceptedSubmissions;
        this.recentSubmissions = recentSubmissions;
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

    public List<Problem> getRecentSubmissions() {
        return recentSubmissions;
    }

    public void setRecentSubmissions(List<Problem> recentSubmissions) {
        this.recentSubmissions = recentSubmissions;
    }
}
