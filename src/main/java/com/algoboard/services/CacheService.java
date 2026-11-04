package com.algoboard.services;

import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class CacheService {

    private final CacheManager cacheManager;

    public CacheService(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    @CacheEvict(value = "contestList", allEntries = true)
    @Scheduled(fixedRate = 1800000)
    public void refreshContestListCache() {
    }

    @CacheEvict(value = {
            "leetcodeProfile",
            "codeforcesProfile",
            "atcoderProfile",
            "codechefProfile"
    }, allEntries = true)
    @Scheduled(fixedRate = 3600000)
    public void refreshProfileCaches() {
    }

    public void evictCodeforcesCache(String email) {
        evict("codeforcesProfile", emailKey(email));
    }

    public void evictAtcoderCache(String email) {
        evict("atcoderProfile", emailKey(email));
    }

    public void evictLeetcodeCache(String email) {
        evict("leetcodeProfile", emailKey(email));
    }

    public void evictCodechefCache(String email) {
        evict("codechefProfile", emailKey(email));
    }

    public void evictCodeforcesUsernameCache(String username) {
        evict("codeforcesProfile", usernameKey(username));
    }

    public void evictAtcoderUsernameCache(String username) {
        evict("atcoderProfile", usernameKey(username));
    }

    public void evictLeetcodeUsernameCache(String username) {
        evict("leetcodeProfile", usernameKey(username));
    }

    public void evictCodechefUsernameCache(String username) {
        evict("codechefProfile", usernameKey(username));
    }

    public void evictAllProfileCaches(String email) {
        evictCodeforcesCache(email);
        evictAtcoderCache(email);
        evictLeetcodeCache(email);
        evictCodechefCache(email);
    }

    public void evictAllCaches() {
        clearCache("contestList");
        clearCache("codeforcesProfile");
        clearCache("atcoderProfile");
        clearCache("codechefProfile");
        clearCache("leetcodeProfile");
    }

    private void evict(String cacheName, String key) {
        Cache cache = cacheManager.getCache(Objects.requireNonNull(cacheName, "Cache name cannot be null"));
        if (cache != null) {
            cache.evict(Objects.requireNonNull(key, "Cache key cannot be null"));
        }
    }

    private String emailKey(String email) {
        return "email:" + Objects.requireNonNull(email, "Cache email cannot be null");
    }

    private String usernameKey(String username) {
        return "user:" + Objects.requireNonNull(username, "Cache username cannot be null");
    }

    private void clearCache(String name) {
        Cache cache = cacheManager.getCache(Objects.requireNonNull(name, "Cache name cannot be null"));
        if (cache != null) {
            cache.clear();
        }
    }
}
