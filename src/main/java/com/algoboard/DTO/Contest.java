package com.algoboard.DTO;

import java.time.LocalDateTime;

public class Contest {
    private String contestId;
    private String contestName;
    private LocalDateTime startTime;
    private long duration;

    public Contest(String contestId, String contestName, LocalDateTime startTime, long duration) {
        this.contestId = contestId;
        this.contestName = contestName;
        this.startTime = startTime;
        this.duration = duration;
    }

    // getters and setters
    public String getContestId() {
        return contestId;
    }

    public void setContestId(String contestId) {
        this.contestId = contestId;
    }

    public String getContestName() {
        return contestName;
    }

    public void setContestName(String contestName) {
        this.contestName = contestName;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public long getDuration() {
        return duration;
    }

    public void setDuration(long duration) {
        this.duration = duration;
    }

    @Override
    public String toString() {
        return "CFContest{" +
                "contestId='" + contestId + '\'' +
                ", contestName='" + contestName + '\'' +
                ", startTime='" + startTime + '\'' +
                ", duration='" + duration + '\'' +
                '}';
    }
}
