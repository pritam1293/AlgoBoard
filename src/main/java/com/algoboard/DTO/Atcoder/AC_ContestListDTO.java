package com.algoboard.DTO.Atcoder;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AC_ContestListDTO {
    private boolean ok;
    private List<AtcoderContest> data;

    // Default constructor for Jackson
    public AC_ContestListDTO() {
    }

    public AC_ContestListDTO(boolean ok, List<AtcoderContest> data) {
        this.ok = ok;
        this.data = data;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AtcoderContest {
        private String title;
        private String url;
        private String startTime;
        private String endTime;
        private int duration;

        // Default constructor for Jackson
        public AtcoderContest() {
        }

        public AtcoderContest(String title, String url, String startTime, String endTime, int duration) {
            this.title = title;
            this.url = url;
            this.startTime = startTime;
            this.endTime = endTime;
            this.duration = duration;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public String getStartTime() {
            return startTime;
        }

        public void setStartTime(String startTime) {
            this.startTime = startTime;
        }

        public String getEndTime() {
            return endTime;
        }

        public void setEndTime(String endTime) {
            this.endTime = endTime;
        }

        public int getDuration() {
            return duration;
        }

        public void setDuration(int duration) {
            this.duration = duration;
        }

        @Override
        public String toString() {
            return "LeetcodeContest{" +
                    "title='" + title + '\'' +
                    ", url='" + url + '\'' +
                    ", startTime='" + startTime + '\'' +
                    ", endTime='" + endTime + '\'' +
                    ", duration=" + duration +
                    '}';
        }
    }

    public boolean isOk() {
        return ok;
    }

    public void setOk(boolean ok) {
        this.ok = ok;
    }

    public List<AtcoderContest> getData() {
        return data;
    }

    public void setData(List<AtcoderContest> data) {
        this.data = data;
    }

    @Override
    public String toString() {
        return "LC_ContestListDTO{" +
                "ok=" + ok +
                ", data=" + data +
                '}';
    }
}
