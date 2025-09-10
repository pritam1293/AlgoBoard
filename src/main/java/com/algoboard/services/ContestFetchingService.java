package com.algoboard.services;

import com.algoboard.DTO.Codeforces.CF_ContestListDTO;
import com.algoboard.DTO.Codechef.CC_ContestListDTO;
import com.algoboard.DTO.Leetcode.LC_ContestDTO;
import com.algoboard.DTO.Leetcode.LC_ContestListDTO;
import com.algoboard.DTO.ContestDTO;
import com.algoboard.DTO.Leetcode.LC_ContestDTO.ContestHistory;

import java.util.List;
import org.springframework.web.client.RestTemplate;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Collections;
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
    // Timezone constants for consistent handling across all datetime operations
    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");
    private static final ZoneOffset IST_OFFSET = ZoneOffset.of("+05:30");

    private RestTemplate restTemplate = new RestTemplate();
    private ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Custom comparator for sorting contests by priority and time
     * Priority: Live contests → Upcoming contests → Finished contests
     * Within each category: Sort by start time (earliest first)
     */
    public int compareContestsByPriority(ContestDTO contest1, ContestDTO contest2) {
        LocalDateTime now = LocalDateTime.now();

        int priority1 = getContestPriority(contest1, now);
        int priority2 = getContestPriority(contest2, now);

        // Primary sort: by priority (lower number = higher priority)
        if (priority1 != priority2) {
            return Integer.compare(priority1, priority2);
        }

        // Secondary sort: by start time within same priority
        if (priority1 == 1) { // Live contests - sort by earliest start time
            return contest1.getStartTime().compareTo(contest2.getStartTime());
        } else if (priority1 == 2) { // Upcoming contests - sort by earliest start time
            return contest1.getStartTime().compareTo(contest2.getStartTime());
        } else { // Finished contests - sort by latest start time (most recent first)
            return contest2.getStartTime().compareTo(contest1.getStartTime());
        }
    }

    private int getContestPriority(ContestDTO contest, LocalDateTime now) {
        if (now.isAfter(contest.getStartTime()) && now.isBefore(contest.getEndTime())) {
            return 1; // Live contest
        } else if (now.isBefore(contest.getStartTime())) {
            return 2; // Upcoming contest
        } else {
            return 3; // Finished contest
        }
    }

    public void getCodeforcesContestList(List<ContestDTO> allContests) {
        String cfurl = "https://codeforces.com/api/contest.list";
        try {
            CF_ContestListDTO response = restTemplate.getForObject(cfurl, CF_ContestListDTO.class);
            int pastContestCount = 0;
            if (response != null && response.getStatus().equals("OK")) {
                for (CF_ContestListDTO.CodeforcesContest contest : response.getResult()) {
                    if (contest.getPhase().equals("BEFORE")) {
                        synchronized (allContests) {
                            allContests.add(new ContestDTO(
                                    String.valueOf(contest.getId()),
                                    contest.getName(),
                                    "https://codeforces.com/contests/" + contest.getId(),
                                    "codeforces",
                                    LocalDateTime.ofInstant(Instant.ofEpochSecond(contest.getStartTimeSeconds()),
                                            IST_ZONE),
                                    LocalDateTime.ofInstant(Instant.ofEpochSecond(
                                            contest.getStartTimeSeconds() + contest.getDurationSeconds()),
                                            IST_ZONE),
                                    contest.getDurationSeconds() / 60));
                        }
                    } else if (contest.getPhase().equals("CODING")) {
                        synchronized (allContests) {
                            allContests.add(new ContestDTO(
                                    String.valueOf(contest.getId()),
                                    contest.getName(),
                                    "https://codeforces.com/contests/" + contest.getId(),
                                    "codeforces",
                                    LocalDateTime.ofInstant(Instant.ofEpochSecond(contest.getStartTimeSeconds()),
                                            IST_ZONE),
                                    LocalDateTime.ofInstant(Instant.ofEpochSecond(
                                            contest.getStartTimeSeconds() + contest.getDurationSeconds()),
                                            IST_ZONE),
                                    contest.getDurationSeconds() / 60));
                        }
                    } else if (contest.getPhase().equals("SYSTEM_TEST")) {
                        synchronized (allContests) {
                            allContests.add(new ContestDTO(
                                    String.valueOf(contest.getId()),
                                    contest.getName(),
                                    "https://codeforces.com/contests/" + contest.getId(),
                                    "codeforces",
                                    LocalDateTime.ofInstant(Instant.ofEpochSecond(contest.getStartTimeSeconds()),
                                            IST_ZONE),
                                    LocalDateTime.ofInstant(Instant.ofEpochSecond(
                                            contest.getStartTimeSeconds() + contest.getDurationSeconds()),
                                            IST_ZONE),
                                    contest.getDurationSeconds() / 60));
                        }
                    } else {
                        pastContestCount++;
                        synchronized (allContests) {
                            allContests.add(new ContestDTO(
                                    String.valueOf(contest.getId()),
                                    contest.getName(),
                                    "https://codeforces.com/contests/" + contest.getId(),
                                    "codeforces",
                                    LocalDateTime.ofInstant(Instant.ofEpochSecond(contest.getStartTimeSeconds()),
                                            IST_ZONE),
                                    LocalDateTime.ofInstant(Instant.ofEpochSecond(
                                            contest.getStartTimeSeconds() + contest.getDurationSeconds()),
                                            IST_ZONE),
                                    contest.getDurationSeconds() / 60));
                        }
                    }
                    if (pastContestCount == 3) {
                        break;// Limit to 3 past contests
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("");
            System.out.println("Error fetching Codeforces contests: " + e.getMessage());
        }
    }

    public void getCodechefContestList(List<ContestDTO> allContests) {
        String ccurl = "https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all";
        try {
            CC_ContestListDTO response = restTemplate.getForObject(ccurl, CC_ContestListDTO.class);

            // Create a DateTimeFormatter for the CodeChef date format: "20 Aug 2025
            // 20:00:00"
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy  HH:mm:ss");

            if (response != null && response.getStatus().equals("success")) {
                addCodechefContests(allContests, response.getPresentContests(), formatter, -1);
                addCodechefContests(allContests, response.getFutureContests(), formatter, -1);
                addCodechefContests(allContests, response.getPastContests(), formatter, 4);
            }
        } catch (Exception e) {
            System.out.println("");
            System.out.println("Error fetching CodeChef contests: " + e.getMessage());
        }
    }

    private void addCodechefContests(List<ContestDTO> allContests, List<CC_ContestListDTO.CodechefContest> contestList,
            DateTimeFormatter formatter, int limit) {
        int count = 0;
        for (CC_ContestListDTO.CodechefContest contest : contestList) {
            synchronized (allContests) {
                allContests.add(new ContestDTO(
                        contest.getContestCode(),
                        contest.getContestName(),
                        "https://www.codechef.com/" + contest.getContestCode(),
                        "codechef",
                        LocalDateTime.parse(contest.getContestStartDate(), formatter),
                        LocalDateTime.parse(contest.getContestEndDate(), formatter),
                        Long.parseLong(contest.getContestDuration())));
            }

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
        try {
            upcomingFuture.get(8, TimeUnit.SECONDS);
        } catch (Exception e) {
            System.out.println("AtCoder upcoming contests timeout or error: " + e.getMessage());
        }

        try {
            pastFuture.get(8, TimeUnit.SECONDS);
        } catch (Exception e) {
            System.out.println("AtCoder past contests timeout or error: " + e.getMessage());
        }
    }

    private void fetchAtcoderUpcomingContests(List<ContestDTO> allContests) {
        String acurl = "https://atcoder.jp/contests/";
        try {
            Document doc = Jsoup.connect(acurl).get();

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
                    Element row = rows.get(i);
                    Elements cols = row.select("td");

                    if (cols.size() >= 3) {
                        String dateStr = cols.get(0).text();
                        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ssZ");
                        ZonedDateTime zonedDateTime = ZonedDateTime.parse(dateStr, formatter);
                        final LocalDateTime startTime = zonedDateTime.withZoneSameInstant(IST_ZONE).toLocalDateTime();
                        Element nameCol = cols.get(1).selectFirst("a");
                        if (nameCol != null) {
                            String contestName = nameCol.text();
                            String contestUrl = "https://atcoder.jp" + nameCol.attr("href");
                            String durationStr = cols.get(2).text();
                            final String contestId = contestIdExtractorFromUrl(contestUrl);
                            String[] parts = durationStr.split(":");
                            final int hours = Integer.parseInt(parts[0]);
                            final int minutes = Integer.parseInt(parts[1]);
                            final long totalTimeMinutes = hours * 60 + minutes;
                            final LocalDateTime endTime = startTime.plusMinutes(totalTimeMinutes);
                            synchronized (allContests) {
                                allContests.add(new ContestDTO(
                                        contestId,
                                        contestName,
                                        contestUrl,
                                        "atcoder",
                                        startTime,
                                        endTime,
                                        totalTimeMinutes));
                            }
                        }
                    }
                } catch (Exception e) {
                    return;
                }
            }
        } catch (Exception e) {
            System.out.println("Error fetching AtCoder upcoming contests: " + e.getMessage());
        }
    }

    private void fetchAtcoderPastContests(List<ContestDTO> allContests) {
        String acurl = "https://atcoder.jp/contests/archive";
        try {
            Document doc = Jsoup.connect(acurl).get();
            Elements rows = doc.select("table tbody tr");

            int countPastContests = 0;
            for (Element row : rows) {
                Elements cols = row.select("td");
                if (cols.size() >= 3) {
                    String dateStr = cols.get(0).text();
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ssZ");
                    ZonedDateTime zonedDateTime = ZonedDateTime.parse(dateStr, formatter);
                    final LocalDateTime startTime = zonedDateTime.withZoneSameInstant(IST_ZONE)
                            .toLocalDateTime();

                    Element linkElement = cols.get(1).selectFirst("a");
                    final String contestName = linkElement.text();
                    final String contestUrl = linkElement.absUrl("href");
                    final String contestId = contestIdExtractorFromUrl(contestUrl);
                    String durationStr = cols.get(2).text();
                    String[] parts = durationStr.split(":");
                    final int hours = Integer.parseInt(parts[0]);
                    final int minutes = Integer.parseInt(parts[1]);
                    final long totalTimeMinutes = hours * 60 + minutes;
                    final LocalDateTime endTime = startTime.plusMinutes(totalTimeMinutes);

                    synchronized (allContests) {
                        allContests.add(new ContestDTO(
                                contestId,
                                contestName,
                                contestUrl,
                                "atcoder",
                                startTime,
                                endTime,
                                totalTimeMinutes));
                    }
                    if (++countPastContests == 3)
                        break; // stop after 3 contests
                }
            }
        } catch (IOException e) {
            System.out.println("Error fetching AtCoder past contests: " + e.getMessage());
        }
    }

    public void getLeetcodeContestList(List<ContestDTO> allContests) {
        // Start both API calls simultaneously
        CompletableFuture<Void> futureFuture = CompletableFuture
                .runAsync(() -> fetchLeetcodeFutureContests(allContests));
        CompletableFuture<Void> pastFuture = CompletableFuture.runAsync(() -> fetchLeetcodePastContests(allContests));

        // Wait for both to complete with timeout protection
        try {
            futureFuture.get(8, TimeUnit.SECONDS);
        } catch (Exception e) {
            System.out.println("LeetCode future contests timeout or error: " + e.getMessage());
        }

        try {
            pastFuture.get(8, TimeUnit.SECONDS);
        } catch (Exception e) {
            System.out.println("LeetCode past contests timeout or error: " + e.getMessage());
        }
    }

    private void fetchLeetcodeFutureContests(List<ContestDTO> allContests) {
        String lcurl = "https://contest-hive.vercel.app/api/leetcode";

        try {
            // Get raw response as String to bypass content-type issue
            String rawResponse = restTemplate.getForObject(lcurl, String.class);
            // Parse using ObjectMapper to handle content-type issue
            LC_ContestListDTO response = objectMapper.readValue(rawResponse, LC_ContestListDTO.class);

            if (response != null && response.isOk()) {
                for (LC_ContestListDTO.LeetcodeContest contest : response.getData()) {
                    synchronized (allContests) {
                        allContests.add(new ContestDTO(
                                contestIdExtractorFromUrl(contest.getUrl()),
                                contest.getTitle(),
                                contest.getUrl(),
                                "leetcode",
                                LocalDateTime.ofInstant(Instant.parse(contest.getStartTime()),
                                        IST_ZONE),
                                LocalDateTime.ofInstant(Instant.parse(contest.getEndTime()), IST_ZONE),
                                contest.getDuration() / 60));
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("Error fetching LeetCode future contests: " + e.getMessage());
        }
    }

    private void fetchLeetcodePastContests(List<ContestDTO> allContests) {
        String lcurl = "https://leetcode-stats.tashif.codes/Pritam1293/contests";
        try {
            LC_ContestDTO response = restTemplate.getForObject(lcurl, LC_ContestDTO.class);
            if (response != null && response.getStatus().equals("success")) {
                // last 4 contests
                List<ContestHistory> history = response.getContestHistory();
                if (history != null && !history.isEmpty()) {
                    Collections.reverse(history);
                    for (int index = 0; index < Math.min(4, history.size()); index++) {
                        LocalDateTime startTime = LocalDateTime.ofEpochSecond(
                                history.get(index).getContest().getStartTime(), 0, IST_OFFSET);
                        LocalDateTime endTime = startTime.plusMinutes(90);
                        final String contestId = history.get(index).getContest().getTitle().toLowerCase().replace(" ",
                                "-");
                        synchronized (allContests) {
                            allContests.add(new ContestDTO(
                                    contestId,
                                    history.get(index).getContest().getTitle(),
                                    "https://leetcode.com/contest/" + contestId,
                                    "leetcode",
                                    startTime,
                                    endTime,
                                    90));
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("Error fetching LeetCode past contests: " + e.getMessage());
        }
    }

    private String contestIdExtractorFromUrl(String url) {
        String regex = "(?<=/contests?/)[^/]+";
        Matcher matcher = Pattern.compile(regex).matcher(url);
        return matcher.find() ? matcher.group() : "";
    }
}
