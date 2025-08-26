package com.algoboard.DTO.Codechef;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class CC_ContestDTO {
    private String status;
    private Data data;

    // Getters and Setters
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Data getData() {
        return data;
    }

    public void setData(Data data) {
        this.data = data;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Data {
        private Resources resources;

        public Resources getResources() {
            return resources;
        }

        public void setResources(Resources resources) {
            this.resources = resources;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Resources {
        @JsonProperty("codechef.com")
        private CodechefResource codechefCom;

        public CodechefResource getCodechefCom() {
            return codechefCom;
        }

        public void setCodechefCom(CodechefResource codechefCom) {
            this.codechefCom = codechefCom;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CodechefResource {// this is the 2nd data in that json
        private List<List<Contest>> data;

        public List<List<Contest>> getData() {
            return data;
        }

        public void setData(List<List<Contest>> data) {
            this.data = data;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Contest {
        private String place;
        private String name;
        private String key;
        private String date;
        @JsonProperty("new_rating")
        private Integer newRating;
        @JsonProperty("old_rating")
        private Integer oldRating;

        // Getters and Setters
        public String getPlace() {
            return place;
        }

        public void setPlace(String place) {
            this.place = place;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getKey() {
            return key;
        }

        public void setKey(String key) {
            this.key = key;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public Integer getNewRating() {
            return newRating;
        }

        public void setNewRating(Integer newRating) {
            this.newRating = newRating;
        }

        public Integer getOldRating() {
            return oldRating;
        }

        public void setOldRating(Integer oldRating) {
            this.oldRating = oldRating;
        }
    }
}
