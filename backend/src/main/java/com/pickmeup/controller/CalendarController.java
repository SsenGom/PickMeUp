package com.pickmeup.controller;

import com.pickmeup.domain.user.User;
import com.pickmeup.dto.calendar.CalendarDto.*;
import com.pickmeup.dto.common.ApiResponse;
import com.pickmeup.service.CalendarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Response>>> getEvents(
            @AuthenticationPrincipal User user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<Response> events = calendarService.getEvents(user, start, end);
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<Response>>> getUpcomingEvents(
            @AuthenticationPrincipal User user) {
        List<Response> events = calendarService.getUpcomingEvents(user);
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Response>> getEvent(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        Response event = calendarService.getEvent(user, id);
        return ResponseEntity.ok(ApiResponse.success(event));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Response>> createEvent(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateRequest request) {
        Response event = calendarService.createEvent(user, request);
        return ResponseEntity.ok(ApiResponse.success(event));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Response>> updateEvent(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody UpdateRequest request) {
        Response event = calendarService.updateEvent(user, id, request);
        return ResponseEntity.ok(ApiResponse.success(event));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        calendarService.deleteEvent(user, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
