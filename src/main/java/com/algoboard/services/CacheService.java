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

    // Automatically refresh contest list cache every 30 minutes
    @CacheEvict(value = "contestList", allEntries = true)
    @Scheduled(fixedRate = 1800000) // 30 minutes in milliseconds
    public void refreshContestListCache() {
        // Cache will be automatically refreshed on next access
    }

    // Automatically refresh LeetCode profile cache every 1 hour
    @CacheEvict(value = "leetcodeProfile", allEntries = true)
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    public void refreshLeetcodeProfileCache() {
        // Cache will be automatically refreshed on next access
    }

    // Automatically refresh Codeforces profile cache every 1 hour
    @CacheEvict(value = "codeforcesProfile", allEntries = true)
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    public void refreshCodeforcesProfileCache() {
        // Cache will be automatically refreshed on next access
    }

    // Automatically refresh AtCoder profile cache every 1 hour
    @CacheEvict(value = "atcoderProfile", allEntries = true)
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    public void refreshAtcoderProfileCache() {
        // Cache will be automatically refreshed on next access
    }

    // Automatically refresh CodeChef profile cache every 1 hour
    @CacheEvict(value = "codechefProfile", allEntries = true)
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    public void refreshCodechefProfileCache() {
        // Cache will be automatically refreshed on next access
    }

    // Selective cache eviction methods for individual users
    public void evictCodeforcesCache(String key) {
        Cache cache = cacheManager.getCache("codeforcesProfile");
        if (cache != null) {
            cache.evict(Objects.requireNonNull(key, "Cache key cannot be null"));
        }
    }

    public void evictAtcoderCache(String key) {
        Cache cache = cacheManager.getCache("atcoderProfile");
        if (cache != null) {
            cache.evict(Objects.requireNonNull(key, "Cache key cannot be null"));
        }
    }

    public void evictLeetcodeCache(String key) {
        Cache cache = cacheManager.getCache("leetcodeProfile");
        if (cache != null) {
            cache.evict(Objects.requireNonNull(key, "Cache key cannot be null"));
        }
    }

    public void evictCodechefCache(String key) {
        Cache cache = cacheManager.getCache("codechefProfile");
        if (cache != null) {
            cache.evict(Objects.requireNonNull(key, "Cache key cannot be null"));
        }
    }

    // Utility method to clear all profile caches for a user
    public void evictAllProfileCaches(String key) {
        evictCodeforcesCache(key);
        evictAtcoderCache(key);
        evictLeetcodeCache(key);
        evictCodechefCache(key);
    }

    // Utility method to clear all caches
    public void evictAllCaches() {
        clearCache("contestList");
        clearCache("codeforcesProfile");
        clearCache("atcoderProfile");
        clearCache("codechefProfile");
        clearCache("leetcodeProfile");
    }

    private void clearCache(String name) {
        String cacheName = Objects.requireNonNull(name, "Cache name cannot be null");
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.clear();
        }
    }
}
