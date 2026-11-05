package com.algoboard.services;

import com.algoboard.DTO.Codeforces.CF_ContestListDTO;
import com.algoboard.DTO.Codechef.CC_ContestListDTO;
import com.algoboard.DTO.Leetcode.LC_ContestListDTO;
import com.algoboard.DTO.ContestDTO;
import com.fasterxml.jackson.databind.JsonNode;

import java.net.URI;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;
import org.jsoup.nodes.Element;
import java.io.IOException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ContestFetchingService {
    private static final Logger logger = LoggerFactory.getLogger(ContestFetchingService.class);
    private static final int JSOUP_TIMEOUT_MILLIS = 5000;
    private static final int FETCH_TIMEOUT_SECONDS = 8;
    private static final int LEETCODE_CONTEST_DURATION_MINUTES = 90;
    private static final int LEETCODE_PAST_CONTEST_LIMIT = 4;
    private static final String LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";
    private static final String BROWSER_USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

    // Timezone constants for consistent handling across all datetime operations
    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");

    private static final DateTimeFormatter CODECHEF_DATE_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy  HH:mm:ss");
    private static final DateTimeFormatter ATCODER_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ssZ");
    private static final Pattern CONTEST_ID_PATTERN = Pattern.compile("(?<=/contests?/)[^/]+");

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ContestFetchingService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Custom comparator for sorting contests by priority and time
     * Priority: Live contests → Upcoming contests → Finished contests
     * Within each category: Sort by start time (earliest first)
     */
    public int compareContestsByPriority(ContestDTO contest1, ContestDTO contest2) {
        LocalDateTime now = LocalDateTime.now(IST_ZONE);

        int priority1 = getContestPriority(contest1, now);
        int priority2 = getContestPriority(contest2, now);

        // Primary sort: by priority (lower number = higher priority)
        if (priority1 != priority2) {
            return Integer.compare(priority1, priority2);
        }

        // Secondary sort: live/upcoming by earliest start; finished by most recent
        if (priority1 == 3) {
            return contest2.getStartTime().compareTo(contest1.getStartTime());
        }
        return contest1.getStartTime().compareTo(contest2.getStartTime());
    }

    private int getContestPriority(ContestDTO contest, LocalDateTime now) {
        if (contest.getEndTime() != null && now.isAfter(contest.getEndTime())) {
            return 3; // Finished contest
        } else if (now.isBefore(contest.getStartTime())) {
            return 2; // Upcoming contest
        } else {
            return 1; // Live contest
        }
    }

    public void getCodeforcesContestList(List<ContestDTO> allContests) {
        String cfUrl = "https://codeforces.com/api/contest.list";
        try {
            CF_ContestListDTO response = restTemplate.getForObject(cfUrl, CF_ContestListDTO.class);
            int pastContestCount = 0;
            if (response != null && "OK".equals(response.getStatus())) {
                for (CF_ContestListDTO.CodeforcesContest contest : response.getResult()) {
                    if (!isCodeforcesUpcomingOrLive(contest.getPhase())) {
                        pastContestCount++;
                    }
                    addContest(allContests, toContest(contest));
                    if (pastContestCount == 3) {
                        break; // Limit to 3 past contests
                    }
                }
            }
        } catch (Exception e) {
            logger.warn("Error fetching Codeforces contests: {}", e.getClass().getSimpleName());
        }
    }

    private boolean isCodeforcesUpcomingOrLive(String phase) {
        return "BEFORE".equals(phase) || "CODING".equals(phase) || "SYSTEM_TEST".equals(phase);
    }

    private ContestDTO toContest(CF_ContestListDTO.CodeforcesContest contest) {
        LocalDateTime startTime = LocalDateTime.ofInstant(
                Instant.ofEpochSecond(contest.getStartTimeSeconds()), IST_ZONE);
        LocalDateTime endTime = LocalDateTime.ofInstant(
                Instant.ofEpochSecond(contest.getStartTimeSeconds() + contest.getDurationSeconds()), IST_ZONE);
        return new ContestDTO(
                String.valueOf(contest.getId()),
                contest.getName(),
                "https://codeforces.com/contests/" + contest.getId(),
                "codeforces",
                startTime,
                endTime,
                contest.getDurationSeconds() / 60);
    }

    public void getCodechefContestList(List<ContestDTO> allContests) {
        String ccUrl = "https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all";
        try {
            CC_ContestListDTO response = restTemplate.getForObject(ccUrl, CC_ContestListDTO.class);

            if (response != null && "success".equals(response.getStatus())) {
                addCodechefContests(allContests, response.getPresentContests(), -1);
                addCodechefContests(allContests, response.getFutureContests(), -1);
                addCodechefContests(allContests, response.getPastContests(), 4);
            }
        } catch (Exception e) {
            logger.warn("Error fetching CodeChef contests: {}", e.getClass().getSimpleName());
        }
    }

    private void addCodechefContests(List<ContestDTO> allContests,
            List<CC_ContestListDTO.CodechefContest> contestList, int limit) {
        if (contestList == null) {
            return;
        }
        int count = 0;
        for (CC_ContestListDTO.CodechefContest contest : contestList) {
            addContest(allContests, new ContestDTO(
                    contest.getContestCode(),
                    contest.getContestName(),
                    "https://www.codechef.com/" + contest.getContestCode(),
                    "codechef",
                    LocalDateTime.parse(contest.getContestStartDate(), CODECHEF_DATE_FORMAT),
                    LocalDateTime.parse(contest.getContestEndDate(), CODECHEF_DATE_FORMAT),
                    Long.parseLong(contest.getContestDuration())));

            if (limit > 0 && ++count >= limit) {
                break; // Limit reached
            }
        }
    }

    public void getAtcoderContestList(List<ContestDTO> allContests) {
        // Start both API calls simultaneously
        CompletableFuture<Void> upcomingFuture = CompletableFuture
                .runAsync(() -> fetchAtcoderUpcomingContests(allContests));
        CompletableFuture<Void> pastFuture = CompletableFuture.runAsync(() -> fetchAtcoderPastContests(allContests));

        // Wait for both to complete with timeout protection
        await(upcomingFuture, "AtCoder upcoming");
        await(pastFuture, "AtCoder past");
    }

    private void fetchAtcoderUpcomingContests(List<ContestDTO> allContests) {
        String acurl = "https://atcoder.jp/contests/";
        try {
            Document doc = Jsoup.connect(acurl).timeout(JSOUP_TIMEOUT_MILLIS).get();

            // Try multiple selectors to find the upcoming contests table
            Element upcomingTable = null;

            // First try: Look for h3 with "Upcoming Contests"
            Element upcomingHeader = doc.selectFirst("h3:contains(Upcoming Contests)");
            if (upcomingHeader != null) {
                upcomingTable = upcomingHeader.nextElementSibling();
            }

            // Second try: Look for h2 with "Upcoming Contests"
            if (upcomingTable == null) {
                upcomingHeader = doc.selectFirst("h2:contains(Upcoming Contests)");
                if (upcomingHeader != null) {
                    upcomingTable = upcomingHeader.nextElementSibling();
                }
            }

            // Third try: Look for any header containing "Upcoming"
            if (upcomingTable == null) {
                upcomingHeader = doc.selectFirst("h2:contains(Upcoming), h3:contains(Upcoming)");
                if (upcomingHeader != null) {
                    upcomingTable = upcomingHeader.nextElementSibling();
                }
            }

            // Fourth try: Look directly for tables and find one with contest data
            if (upcomingTable == null) {
                Elements tables = doc.select("table");
                for (Element table : tables) {
                    Elements rows = table.select("tr");
                    if (rows.size() > 1) {
                        Elements firstRowCols = rows.get(0).select("th, td");
                        // Check if this looks like a contest table
                        if (firstRowCols.size() >= 3) {
                            String headerText = firstRowCols.text().toLowerCase();
                            if (headerText.contains("contest") || headerText.contains("start")
                                    || headerText.contains("duration")) {
                                upcomingTable = table;
                                break;
                            }
                        }
                    }
                }
            }

            if (upcomingTable == null) {
                return;
            }

            // Each row in that section corresponds to a contest (skip the header row)
            Elements rows = upcomingTable.select("tr");
            if (rows.size() <= 1) {
                return;
            }

            // Loop through each contest entry (skip the first header row)
            for (int i = 1; i < rows.size(); i++) {
                try {
                    ContestDTO contest = toAtcoderContest(rows.get(i));
                    if (contest != null) {
                        addContest(allContests, contest);
                    }
                } catch (Exception e) {
                    return;
                }
            }
        } catch (Exception e) {
            logger.warn("Error fetching AtCoder upcoming contests: {}", e.getClass().getSimpleName());
        }
    }

    private void fetchAtcoderPastContests(List<ContestDTO> allContests) {
        String acurl = "https://atcoder.jp/contests/archive";
        try {
            Document doc = Jsoup.connect(acurl).timeout(JSOUP_TIMEOUT_MILLIS).get();
            Elements rows = doc.select("table tbody tr");

            int countPastContests = 0;
            for (Element row : rows) {
                ContestDTO contest = toAtcoderContest(row);
                if (contest == null) {
                    continue;
                }
                addContest(allContests, contest);
                if (++countPastContests == 3) {
                    break; // stop after 3 contests
                }
            }
        } catch (IOException e) {
            logger.warn("Error fetching AtCoder past contests: {}", e.getClass().getSimpleName());
        }
    }

    private ContestDTO toAtcoderContest(Element row) {
        Elements cols = row.select("td");
        if (cols.size() < 3) {
            return null;
        }
        Element link = cols.get(1).selectFirst("a");
        if (link == null) {
            return null;
        }
        LocalDateTime startTime = ZonedDateTime.parse(cols.get(0).text(), ATCODER_DATE_FORMAT)
                .withZoneSameInstant(IST_ZONE)
                .toLocalDateTime();
        long durationMinutes = parseDurationMinutes(cols.get(2).text());
        String contestUrl = link.absUrl("href");
        return new ContestDTO(
                contestIdExtractorFromUrl(contestUrl),
                link.text(),
                contestUrl,
                "atcoder",
                startTime,
                startTime.plusMinutes(durationMinutes),
                durationMinutes);
    }

    private long parseDurationMinutes(String duration) {
        String[] parts = duration.split(":");
        return Integer.parseInt(parts[0]) * 60L + Integer.parseInt(parts[1]);
    }

    public void getLeetcodeContestList(List<ContestDTO> allContests) {
        // Start both API calls simultaneously
        CompletableFuture<Void> futureFuture = CompletableFuture
                .runAsync(() -> fetchLeetcodeFutureContests(allContests));
        CompletableFuture<Void> pastFuture = CompletableFuture.runAsync(() -> fetchLeetcodePastContests(allContests));

        // Wait for both to complete with timeout protection
        await(futureFuture, "LeetCode future");
        await(pastFuture, "LeetCode past");
    }

    private void fetchLeetcodeFutureContests(List<ContestDTO> allContests) {
        // Direct LeetCode GraphQL call (public data, no credentials required).
        final String query = """
                query upcomingLeetcodeContests {
                  upcomingContests {
                    title
                    titleSlug
                    startTime
                    duration
                  }
                }
                """;
        try {
            JsonNode data = queryLeetcodeGraphql(query, Map.of());
            JsonNode contests = data == null ? null : data.path("upcomingContests");
            if (contests != null && contests.isArray()) {
                for (JsonNode contest : contests) {
                    addContest(allContests, toLeetcodeContest(contest));
                }
            }
        } catch (Exception e) {
            logger.warn("Error fetching LeetCode future contests via GraphQL: {}",
                    e.getClass().getSimpleName());
        }
    }

    private void fetchLeetcodePastContests(List<ContestDTO> allContests) {
        // Direct LeetCode GraphQL call (public data, no credentials required).
        // allContests is newest-first and also contains future contests, so keep
        // only the ones that have already ended and take the most recent few.
        final String query = """
                query pastLeetcodeContests {
                  allContests {
                    title
                    titleSlug
                    startTime
                    duration
                  }
                }
                """;
        try {
            JsonNode data = queryLeetcodeGraphql(query, Map.of());
            JsonNode contests = data == null ? null : data.path("allContests");
            if (contests == null || !contests.isArray()) {
                return;
            }

            LocalDateTime now = LocalDateTime.now(IST_ZONE);
            List<ContestDTO> endedContests = new ArrayList<>();
            for (JsonNode contest : contests) {
                ContestDTO dto = toLeetcodeContest(contest);
                if (dto.getEndTime().isBefore(now)) {
                    endedContests.add(dto);
                }
            }
            endedContests.sort(Comparator.comparing(ContestDTO::getStartTime).reversed());

            int limit = Math.min(LEETCODE_PAST_CONTEST_LIMIT, endedContests.size());
            for (int index = 0; index < limit; index++) {
                addContest(allContests, endedContests.get(index));
            }
        } catch (Exception e) {
            logger.warn("Error fetching LeetCode past contests via GraphQL: {}",
                    e.getClass().getSimpleName());
        }
    }

    /**
     * Maps a LeetCode GraphQL contest node (upcomingContests / allContests) to
     * the common ContestDTO shape. LeetCode returns startTime and duration in
     * epoch seconds.
     */
    private ContestDTO toLeetcodeContest(JsonNode contest) {
        String title = contest.path("title").asText("");
        String titleSlug = contest.path("titleSlug").asText("");
        long startEpochSeconds = contest.path("startTime").asLong(0);
        long durationSeconds = contest.path("duration").asLong(LEETCODE_CONTEST_DURATION_MINUTES * 60L);

        LocalDateTime startTime = LocalDateTime.ofInstant(
                Instant.ofEpochSecond(startEpochSeconds), IST_ZONE);
        return new ContestDTO(
                titleSlug,
                title,
                "https://leetcode.com/contest/" + titleSlug,
                "leetcode",
                startTime,
                startTime.plusSeconds(durationSeconds),
                durationSeconds / 60);
    }

    /**
     * Executes a query against LeetCode's public GraphQL endpoint. No API key,
     * cookie or login is needed for the public contest fields used here.
     */
    private JsonNode queryLeetcodeGraphql(String query, Map<String, Object> variables) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(HttpHeaders.USER_AGENT, BROWSER_USER_AGENT);
        headers.set(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);
        headers.set(HttpHeaders.REFERER, "https://leetcode.com/contest/");
        headers.set(HttpHeaders.ORIGIN, "https://leetcode.com");

        Map<String, Object> payload = Map.of(
                "query", query,
                "variables", variables);
        RequestEntity<String> request = RequestEntity
                .post(Objects.requireNonNull(URI.create(LEETCODE_GRAPHQL_URL)))
                .headers(headers)
                .body(Objects.requireNonNull(objectMapper.writeValueAsString(payload)));

        ResponseEntity<String> response = restTemplate.exchange(request, String.class);
        String body = response.getBody();
        if (!response.getStatusCode().is2xxSuccessful() || body == null || body.isBlank()) {
            return null;
        }

        JsonNode root = objectMapper.readTree(body);
        if (root.has("errors") && !root.path("errors").isEmpty()) {
            logger.warn("LeetCode GraphQL returned errors: {}", root.path("errors"));
            return null;
        }
        JsonNode data = root.path("data");
        return data.isMissingNode() || data.isNull() ? null : data;
    }

    private void addContest(List<ContestDTO> contests, ContestDTO contest) {
        synchronized (contests) {
            contests.add(contest);
        }
    }

    private void await(CompletableFuture<Void> future, String description) {
        try {
            future.get(FETCH_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        } catch (Exception e) {
            logger.warn("{} contests timed out or failed: {}", description, e.getClass().getSimpleName());
        }
    }

    private String contestIdExtractorFromUrl(String url) {
        Matcher matcher = CONTEST_ID_PATTERN.matcher(url);
        return matcher.find() ? matcher.group() : "";
    }
}
