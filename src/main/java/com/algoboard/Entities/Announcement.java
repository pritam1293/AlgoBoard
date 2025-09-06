package com.algoboard.entities;

import java.time.LocalDateTime;

public class Announcement {
    private String title;
    private String description;
    private String link;
    private LocalDateTime date;

    public Announcement() {
    }

    public Announcement(String title, String description, String link, LocalDateTime date) {
        this.title = title;
        this.description = description;
        this.link = link;
        this.date = date;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }
}
