package com.algoboard.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.time.Duration;
import java.util.Map;

@Configuration
@EnableCaching
@EnableScheduling
public class CacheConfig {

    private static final String[] CACHE_NAMES = {
            "contestList",
            "leetcodeProfile",
            "codeforcesProfile",
            "codechefProfile",
            "atcoderProfile"
    };

    @Bean
    @ConditionalOnProperty(name = "app.cache.type", havingValue = "simple", matchIfMissing = true)
    public CacheManager inMemoryCacheManager() {
        return new ConcurrentMapCacheManager(CACHE_NAMES);
    }

    @Bean
    @ConditionalOnProperty(name = "app.cache.type", havingValue = "redis")
    public CacheManager redisCacheManager(RedisConnectionFactory connectionFactory, ObjectMapper objectMapper) {
        ObjectMapper cacheMapper = objectMapper.copy();
        cacheMapper.activateDefaultTyping(
                BasicPolymorphicTypeValidator.builder()
                        .allowIfSubType("com.algoboard.")
                        .allowIfSubType("java.util.")
                        .allowIfSubType("java.time.")
                        .build(),
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY);

        RedisSerializationContext.SerializationPair<String> keySerializer =
                RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer());
        RedisSerializationContext.SerializationPair<Object> valueSerializer =
                RedisSerializationContext.SerializationPair.fromSerializer(
                        new GenericJackson2JsonRedisSerializer(cacheMapper));

        RedisCacheConfiguration profileCache = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(1))
                .disableCachingNullValues()
                .serializeKeysWith(keySerializer)
                .serializeValuesWith(valueSerializer);

        RedisCacheConfiguration contestCache = profileCache.entryTtl(Duration.ofMinutes(30));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(profileCache)
                .withInitialCacheConfigurations(Map.of(
                        "contestList", contestCache,
                        "leetcodeProfile", profileCache,
                        "codeforcesProfile", profileCache,
                        "codechefProfile", profileCache,
                        "atcoderProfile", profileCache))
                .build();
    }
}
