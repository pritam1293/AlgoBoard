package com.algoboard.DTO.Leetcode;

import java.util.List;

public class LC_UserDTO {
    private List<RecentSubmission> recentSubmissions;
    private String status;
    private SubmitStats submitStats;
    private String username;

    public LC_UserDTO(List<RecentSubmission> recentSubmissions, String status, SubmitStats submitStats, String username) {
        this.recentSubmissions = recentSubmissions;
        this.status = status;
        this.submitStats = submitStats;
        this.username = username;
    }

    public List<RecentSubmission> getRecentSubmissions() {
        return recentSubmissions;
    }

    public void setRecentSubmissions(List<RecentSubmission> recentSubmissions) {
        this.recentSubmissions = recentSubmissions;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public SubmitStats getSubmitStats() {
        return submitStats;
    }

    public void setSubmitStats(SubmitStats submitStats) {
        this.submitStats = submitStats;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    // RecentSubmission nested class
    public static class RecentSubmission {
        private String lang;
        private String statusDisplay;
        private String timestamp;
        private String title;
        private String titleSlug;

        public RecentSubmission(String lang, String statusDisplay, String timestamp, String title, String titleSlug) {
            this.lang = lang;
            this.statusDisplay = statusDisplay;
            this.timestamp = timestamp;
            this.title = title;
            this.titleSlug = titleSlug;
        }

        public String getLang() {
            return lang;
        }

        public void setLang(String lang) {
            this.lang = lang;
        }

        public String getStatusDisplay() {
            return statusDisplay;
        }

        public void setStatusDisplay(String statusDisplay) {
            this.statusDisplay = statusDisplay;
        }

        public String getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(String timestamp) {
            this.timestamp = timestamp;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getTitleSlug() {
            return titleSlug;
        }

        public void setTitleSlug(String titleSlug) {
            this.titleSlug = titleSlug;
        }
    }

    // SubmitStats nested class
    public static class SubmitStats {
        private List<SubmissionStat> acSubmissionNum;
        private List<SubmissionStat> totalSubmissionNum;

        public SubmitStats(List<SubmissionStat> acSubmissionNum, List<SubmissionStat> totalSubmissionNum) {
            this.acSubmissionNum = acSubmissionNum;
            this.totalSubmissionNum = totalSubmissionNum;
        }

        public List<SubmissionStat> getAcSubmissionNum() {
            return acSubmissionNum;
        }

        public void setAcSubmissionNum(List<SubmissionStat> acSubmissionNum) {
            this.acSubmissionNum = acSubmissionNum;
        }

        public List<SubmissionStat> getTotalSubmissionNum() {
            return totalSubmissionNum;
        }

        public void setTotalSubmissionNum(List<SubmissionStat> totalSubmissionNum) {
            this.totalSubmissionNum = totalSubmissionNum;
        }
    }

    // SubmissionStat nested class
    public static class SubmissionStat {
        private int count;
        private String difficulty;
        private int submissions;

        public SubmissionStat(int count, String difficulty, int submissions) {
            this.count = count;
            this.difficulty = difficulty;
            this.submissions = submissions;
        }

        public int getCount() {
            return count;
        }

        public void setCount(int count) {
            this.count = count;
        }

        public String getDifficulty() {
            return difficulty;
        }

        public void setDifficulty(String difficulty) {
            this.difficulty = difficulty;
        }

        public int getSubmissions() {
            return submissions;
        }

        public void setSubmissions(int submissions) {
            this.submissions = submissions;
        }
    }
}
