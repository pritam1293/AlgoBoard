package com.algoboard.DTO.Codeforces;

import java.util.List;

public class CF_ContestListDTO {
    private String status;
    private List<CodeforcesContest> result;

    public CF_ContestListDTO(String status, List<CodeforcesContest> result) {
        this.status = status;
        this.result = result;
    }

    public String getStatus() {
        return status;
    }
    public List<CodeforcesContest> getResult() {
        return result;
    }

    public static class CodeforcesContest {
        private Long id;
        private String name;
        private String phase;
        private Long durationSeconds;
        private Long startTimeSeconds;

        public CodeforcesContest(Long id, String name, String phase, Long durationSeconds, Long startTimeSeconds) {
            this.id = id;
            this.name = name;
            this.phase = phase;
            this.durationSeconds = durationSeconds;
            this.startTimeSeconds = startTimeSeconds;
        }

        public Long getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public String getPhase() {
            return phase;
        }

        public Long getDurationSeconds() {
            return durationSeconds;
        }

        public Long getStartTimeSeconds() {
            return startTimeSeconds;
        }

        @Override
        public String toString() {
            return "Contest{" +
                    "id=" + id +
                    ", name='" + name + '\'' +
                    ", phase='" + phase + '\'' +
                    ", durationSeconds=" + durationSeconds +
                    ", startTimeSeconds=" + startTimeSeconds +
                    '}';
        }
    }

    @Override
    public String toString() {
        return "ContestListDTO{" +
                "status='" + status + '\'' +
                ", result=" + result +
                '}';
    }
}
