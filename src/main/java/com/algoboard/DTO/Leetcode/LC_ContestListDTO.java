package com.algoboard.DTO.Leetcode;

import java.util.List;

public class LC_ContestListDTO {
    private boolean ok;
    private List<LeetcodeContest> data;

    public LC_ContestListDTO(boolean ok, List<LeetcodeContest> data) {
        this.ok = ok;
        this.data = data;
    }

    public boolean isOk() {
        return ok;
    }

    public void setOk(boolean ok) {
        this.ok = ok;
    }

    public List<LeetcodeContest> getData() {
        return data;
    }

    public void setData(List<LeetcodeContest> data) {
        this.data = data;
    }

    public static class LeetcodeContest {
        private String title;
        private String url;
        private String startTime;
        private long duration;

        public LeetcodeContest(String title, String url, String startTime, long duration) {
            this.title = title;
            this.url = url;
            this.startTime = startTime;
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

        public long getDuration() {
            return duration;
        }

        public void setDuration(long duration) {
            this.duration = duration;
        }

        @Override
        public String toString() {
            return "LeetcodeContest{" +
                    "title='" + title + '\'' +
                    ", url='" + url + '\'' +
                    ", startTime='" + startTime + '\'' +
                    ", duration=" + duration +
                    '}';
        }
    }

    @Override
    public String toString() {
        return "LC_ContestListDTO{" +
                "ok=" + ok +
                ", data=" + data +
                '}';
    }
}
