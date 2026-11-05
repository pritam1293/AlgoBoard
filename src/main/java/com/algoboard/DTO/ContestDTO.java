package com.algoboard.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;
import java.time.ZoneId;

// status is a derived (read-only) property; ignore it when reading cached copies.
@JsonIgnoreProperties(ignoreUnknown = true)
public class ContestDTO {

    private static final String STATUS_LIVE = "live";
    private static final String STATUS_UPCOMING = "upcoming";
    private static final String STATUS_ENDED = "ended";
    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");

    private String contestId;
    private String contestName;
    private String contestUrl;
    private String platform;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private long duration;

    public ContestDTO() {
    }

    public ContestDTO(String contestId, String contestName, String contestUrl, String platform, LocalDateTime startTime, LocalDateTime endTime, long duration) {
        this.contestId = contestId;
        this.contestName = contestName;
        this.contestUrl = contestUrl;
        this.platform = platform;
        this.startTime = startTime;
        this.endTime = endTime;
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

    public String getContestUrl() {
        return contestUrl;
    }

    public void setContestUrl(String contestUrl) {
        this.contestUrl = contestUrl;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public long getDuration() {
        return duration;
    }

    public void setDuration(long duration) {
        this.duration = duration;
    }

    /**
     * Derived from start/end time so it stays accurate even when the contest
     * list is served from cache.
     */
    public String getStatus() {
        if (startTime == null) {
            return null;
        }

        LocalDateTime now = LocalDateTime.now(IST_ZONE);
        if (endTime != null && now.isAfter(endTime)) {
            return STATUS_ENDED;
        }
        if (now.isBefore(startTime)) {
            return STATUS_UPCOMING;
        }
        return STATUS_LIVE;
    }

    @Override
    public String toString() {
        return "CFContest{" +
                "contestId='" + contestId + '\'' +
                ", contestName='" + contestName + '\'' +
                ", startTime='" + startTime + '\'' +
                ", endTime='" + endTime + '\'' +
                ", duration='" + duration + '\'' +
                ", status='" + getStatus() + '\'' +
                '}';
    }
}
