package com.algoboard.DTO.Codeforces;

import java.util.List;

public class CF_SubmissionsDTO {
    private String status;
    private List<Result> result;

    public static class Result {
        // private long id; //submission id
        private long contestId;
        private Problem problem;
        private Author author;
        private String verdict;

        public static class Problem {
            private long contestId;
            private String index;
            private String name;

            public Problem(long contestId, String index, String name) {
                this.contestId = contestId;
                this.index = index;
                this.name = name;
            }

            public long getContestId() {
                return contestId;
            }

            public String getIndex() {
                return index;
            }

            public String getName() {
                return name;
            }
        }

        public static class Author {
            private long contestId;
            private String participantType;

            public Author(long contestId, String participantType) {
                this.contestId = contestId;
                this.participantType = participantType;
            }

            public long getContestId() {
                return contestId;
            }

            public String getParticipantType() {
                return participantType;
            }
        }

        public Result(long contestId, Problem problem, Author author, String verdict) {
            // this.id = id;
            this.contestId = contestId;
            this.problem = problem;
            this.author = author;
            this.verdict = verdict;
        }

        // public long getId() {
        //     return id;
        // }

        public long getContestId() {
            return contestId;
        }

        public Problem getProblem() {
            return problem;
        }

        public Author getAuthor() {
            return author;
        }

        public String getVerdict() {
            return verdict;
        }
    }

    public String getStatus() {
        return status;
    }

    public List<Result> getResult() {
        return result;
    }
}
