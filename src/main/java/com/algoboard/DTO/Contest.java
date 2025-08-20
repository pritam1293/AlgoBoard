package com.algoboard.DTO;

import java.time.LocalDateTime;


public class Contest {
    private String contestId;
    private String contestName;
    private LocalDateTime startTime;
    private long duration;
    private String phase; //present or past and future

    public Contest(String contestId, String contestName, LocalDateTime startTime, long duration, String phase) {
        this.contestId = contestId;
        this.contestName = contestName;
        this.startTime = startTime;
        this.duration = duration;
        this.phase = phase;
    }

    //getters and setters
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

    public String getPhase() {
        return phase;
    }

    public void setPhase(String phase) {
        this.phase = phase;
    }

    @Override
    public String toString() {
        return "CFContest{" +
                "contestId='" + contestId + '\'' +
                ", contestName='" + contestName + '\'' +
                ", startTime='" + startTime + '\'' +
                ", duration='" + duration + '\'' +
                ", phase='" + phase + '\'' +
                '}';
    }
}
