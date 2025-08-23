package com.algoboard.DTO.Codechef;

import java.util.List;

public class CC_ContestListDTO {
    private String status;
    private List<CodechefContest> present_contests;
    private List<CodechefContest> future_contests;
    private List<CodechefContest> past_contests;

    public static class CodechefContest {
        private String contest_code;
        private String contest_name;
        private String contest_start_date;
        private String contest_end_date;
        private String contest_duration;

        public CodechefContest(String contest_code, String contest_name, String contest_start_date, String contest_duration, String contest_end_date) {
            this.contest_code = contest_code;
            this.contest_name = contest_name;
            this.contest_start_date = contest_start_date;
            this.contest_end_date = contest_end_date;
            this.contest_duration = contest_duration;
        }

        // Getters and Setters
        public String getContestCode() {
            return contest_code;
        }

        public void setContestCode(String contest_code) {
            this.contest_code = contest_code;
        }

        public String getContestName() {
            return contest_name;
        }

        public void setContestName(String contest_name) {
            this.contest_name = contest_name;
        }

        public String getContestStartDate() {
            return contest_start_date;
        }

        public void setContestStartDate(String contest_start_date) {
            this.contest_start_date = contest_start_date;
        }

        public String getContestEndDate() {
            return contest_end_date;
        }

        public void setContestEndDate(String contest_end_date) {
            this.contest_end_date = contest_end_date;
        }

        public String getContestDuration() {
            return contest_duration;
        }

        public void setContestDuration(String contest_duration) {
            this.contest_duration = contest_duration;
        }

        @Override
        public String toString() {
            return "CodechefContest{" +
                    "contest_code='" + contest_code + '\'' +
                    ", contest_start_date='" + contest_start_date + '\'' +
                    ", contest_duration='" + contest_duration + '\'' +
                    '}';
        }
    }

    public CC_ContestListDTO(String status, List<CodechefContest> present_contests, List<CodechefContest> future_contests, List<CodechefContest> past_contests) {
        this.status = status;
        this.present_contests = present_contests;
        this.future_contests = future_contests;
        this.past_contests = past_contests;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<CodechefContest> getPresentContests() {
        return present_contests;
    }

    public void setPresentContests(List<CodechefContest> present_contests) {
        this.present_contests = present_contests;
    }

    public List<CodechefContest> getFutureContests() {
        return future_contests;
    }

    public void setFutureContests(List<CodechefContest> future_contests) {
        this.future_contests = future_contests;
    }

    public List<CodechefContest> getPastContests() {
        return past_contests;
    }

    public void setPastContests(List<CodechefContest> past_contests) {
        this.past_contests = past_contests;
    }

    @Override
    public String toString() {
        return "CC_ContestListDTO{" +
                "status='" + status + '\'' +
                ", present_contests=" + present_contests +
                ", future_contests=" + future_contests +
                ", past_contests=" + past_contests +
                '}';
    }
}
