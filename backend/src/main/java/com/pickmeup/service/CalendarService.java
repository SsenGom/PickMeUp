package com.pickmeup.service;

import com.pickmeup.domain.calendar.CalendarEvent;
import com.pickmeup.domain.calendar.RecurrenceType;
import com.pickmeup.domain.user.User;
import com.pickmeup.dto.calendar.CalendarDto.*;
import com.pickmeup.exception.BusinessException;
import com.pickmeup.exception.ErrorCode;
import com.pickmeup.repository.CalendarEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CalendarService {
    
    private final CalendarEventRepository calendarEventRepository;
    
    @Transactional
    public Response createEvent(User user, CreateRequest request) {
        CalendarEvent event = CalendarEvent.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .isAllDay(request.getIsAllDay())
                .location(request.getLocation())
                .color(request.getColor())
                .recurrenceType(request.getRecurrenceType())
                .recurrenceInterval(request.getRecurrenceInterval())
                .recurrenceEndAt(request.getRecurrenceEndAt())
                .build();
        
        calendarEventRepository.save(event);
        
        // DAILY는 단순히 시작~종료 사이 모든 날짜 표시 용도로 사용
        // WEEKLY, MONTHLY, YEARLY만 반복 인스턴스 생성
        if (request.getRecurrenceType() != null
                && request.getRecurrenceType() != RecurrenceType.NONE
                && request.getRecurrenceType() != RecurrenceType.DAILY) {
            createRecurringInstances(event, request);
        }
        
        return Response.from(event);
    }
    
    public List<Response> getEvents(User user, LocalDateTime start, LocalDateTime end) {
        return calendarEventRepository.findByUserAndDateRange(user, start, end)
                .stream().map(Response::from).toList();
    }
    
    public Response getEvent(User user, Long eventId) {
        CalendarEvent event = findEventWithAuth(user, eventId);
        return Response.from(event);
    }
    
    @Transactional
    public Response updateEvent(User user, Long eventId, UpdateRequest request) {
        CalendarEvent event = findEventWithAuth(user, eventId);
        
        event.update(
                request.getTitle() != null ? request.getTitle() : event.getTitle(),
                request.getDescription() != null ? request.getDescription() : event.getDescription(),
                request.getStartAt() != null ? request.getStartAt() : event.getStartAt(),
                request.getEndAt() != null ? request.getEndAt() : event.getEndAt(),
                request.getIsAllDay() != null ? request.getIsAllDay() : event.getIsAllDay(),
                request.getLocation() != null ? request.getLocation() : event.getLocation(),
                request.getColor() != null ? request.getColor() : event.getColor(),
                request.getRecurrenceType() != null ? request.getRecurrenceType() : event.getRecurrenceType()
        );
        
        return Response.from(event);
    }
    
    @Transactional
    public void deleteEvent(User user, Long eventId) {
        CalendarEvent event = findEventWithAuth(user, eventId);
        List<CalendarEvent> childEvents = calendarEventRepository.findByParentEventId(eventId);
        calendarEventRepository.deleteAll(childEvents);
        calendarEventRepository.delete(event);
    }
    
    public List<Response> getUpcomingEvents(User user) {
        return calendarEventRepository.findUpcomingEvents(user, LocalDateTime.now())
                .stream().map(Response::from).toList();
    }
    
    private CalendarEvent findEventWithAuth(User user, Long eventId) {
        CalendarEvent event = calendarEventRepository.findById(eventId)
                .orElseThrow(() -> new BusinessException(ErrorCode.EVENT_NOT_FOUND));
        if (!event.getUser().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        return event;
    }
    
    private void createRecurringInstances(CalendarEvent parentEvent, CreateRequest request) {
        List<CalendarEvent> instances = new ArrayList<>();
        LocalDateTime currentStart = request.getStartAt();
        LocalDateTime currentEnd = request.getEndAt();
        LocalDateTime recurrenceEnd = request.getRecurrenceEndAt() != null 
                ? request.getRecurrenceEndAt() : request.getStartAt().plusYears(1);
        int interval = request.getRecurrenceInterval() != null ? request.getRecurrenceInterval() : 1;
        
        while (currentStart.isBefore(recurrenceEnd) && instances.size() < 100) {
            currentStart = addInterval(currentStart, request.getRecurrenceType(), interval);
            currentEnd = addInterval(currentEnd, request.getRecurrenceType(), interval);
            
            if (currentStart.isBefore(recurrenceEnd)) {
                instances.add(CalendarEvent.builder()
                        .user(parentEvent.getUser())
                        .title(parentEvent.getTitle())
                        .description(parentEvent.getDescription())
                        .startAt(currentStart)
                        .endAt(currentEnd)
                        .isAllDay(parentEvent.getIsAllDay())
                        .location(parentEvent.getLocation())
                        .color(parentEvent.getColor())
                        .parentEventId(parentEvent.getId())
                        .build());
            }
        }
        calendarEventRepository.saveAll(instances);
    }
    
    private LocalDateTime addInterval(LocalDateTime dateTime, RecurrenceType type, int interval) {
        return switch (type) {
            case DAILY -> dateTime.plusDays(interval);
            case WEEKLY -> dateTime.plusWeeks(interval);
            case MONTHLY -> dateTime.plusMonths(interval);
            case YEARLY -> dateTime.plusYears(interval);
            default -> dateTime;
        };
    }
}
