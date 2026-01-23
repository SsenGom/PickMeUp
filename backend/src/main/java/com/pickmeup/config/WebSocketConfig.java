package com.pickmeup.config;

import com.pickmeup.config.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.List;

/**
 * WebSocket 설정
 * 
 * WebSocket이란?
 * - HTTP와 달리 연결을 유지하는 양방향 통신 프로토콜
 * - 서버가 클라이언트에게 먼저 데이터를 보낼 수 있음 (Push)
 * - 채팅, 실시간 알림 등에 사용
 * 
 * HTTP vs WebSocket:
 * - HTTP: 요청-응답. 클라이언트가 요청해야만 서버가 응답
 * - WebSocket: 연결 유지. 서버가 언제든 클라이언트에게 데이터 전송 가능
 * 
 * STOMP (Simple Text Oriented Messaging Protocol):
 * - WebSocket 위에서 동작하는 메시징 프로토콜
 * - 발행(Publish)-구독(Subscribe) 패턴
 * - /topic/xxx 같은 주소로 구독하고, 메시지 수신
 * 
 * 실시간 알림 흐름:
 * 1. 클라이언트가 /topic/inbox/{userId} 구독
 * 2. 외부에서 메시지 수신 시 서버가 해당 채널로 발행
 * 3. 구독 중인 클라이언트가 실시간으로 메시지 수신
 */
@Slf4j
@Configuration
@EnableWebSocketMessageBroker  // WebSocket 메시지 브로커 활성화
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    private final JwtTokenProvider jwtTokenProvider;
    
    /**
     * 메시지 브로커 설정
     * 
     * 메시지 브로커: 메시지를 중계하는 서버
     * - 발행자(Publisher)가 메시지를 브로커에 보냄
     * - 브로커가 구독자(Subscriber)들에게 메시지 전달
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 구독 경로 접두사 (클라이언트가 구독할 때)
        // /topic: 1:N 브로드캐스트 (모든 구독자에게)
        // /queue: 1:1 메시지 (특정 사용자에게)
        config.enableSimpleBroker("/topic", "/queue");
        
        // 발행 경로 접두사 (클라이언트가 메시지 보낼 때)
        // 클라이언트 -> /app/xxx -> @MessageMapping 메서드
        config.setApplicationDestinationPrefixes("/app");
        
        // 사용자별 경로 접두사
        // /user/{userId}/queue/xxx 형태로 특정 사용자에게 전송
        config.setUserDestinationPrefix("/user");
    }
    
    /**
     * WebSocket 엔드포인트 등록
     * 
     * 클라이언트가 WebSocket 연결할 때 사용하는 URL
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")           // ws://localhost:8080/ws
                .setAllowedOriginPatterns("*") // CORS 허용
                .withSockJS();                 // SockJS 폴백 (WebSocket 미지원 브라우저 대응)
    }
    
    /**
     * WebSocket 연결 시 JWT 인증 처리
     * 
     * WebSocket 연결 요청에서 JWT 토큰을 확인하고 인증 정보 설정
     * HTTP 요청의 JwtAuthenticationFilter 역할
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            /**
             * 메시지 전송 전 가로채기
             * 
             * CONNECT 명령 시 (WebSocket 최초 연결)
             * Authorization 헤더에서 JWT 토큰 추출하여 인증
             */
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor
                        .getAccessor(message, StompHeaderAccessor.class);
                
                // CONNECT 명령일 때만 인증 처리
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    // Authorization 헤더에서 토큰 추출
                    String token = accessor.getFirstNativeHeader("Authorization");
                    
                    if (token != null && token.startsWith("Bearer ")) {
                        token = token.substring(7);  // "Bearer " 제거
                        
                        // 토큰 검증
                        if (jwtTokenProvider.validateToken(token)) {
                            Long userId = jwtTokenProvider.getUserIdFromToken(token);
                            
                            // 인증 객체 생성 및 설정
                            UsernamePasswordAuthenticationToken auth = 
                                    new UsernamePasswordAuthenticationToken(
                                            userId,
                                            null,
                                            List.of(new SimpleGrantedAuthority("ROLE_USER"))
                                    );
                            accessor.setUser(auth);  // WebSocket 세션에 사용자 정보 저장
                        }
                    }
                }
                return message;
            }
        });
    }
    
    /*
     * ========== 클라이언트 사용 예시 (JavaScript) ==========
     * 
     * // 연결
     * const socket = new SockJS('http://localhost:8080/ws');
     * const client = Stomp.over(socket);
     * 
     * client.connect(
     *     { Authorization: 'Bearer ' + accessToken },  // 인증 헤더
     *     () => {
     *         // 연결 성공
     *         
     *         // 구독 (서버 -> 클라이언트)
     *         client.subscribe('/topic/inbox/' + userId, (message) => {
     *             const data = JSON.parse(message.body);
     *             console.log('새 메시지:', data);
     *         });
     *         
     *         // 발행 (클라이언트 -> 서버)
     *         client.send('/app/chat', {}, JSON.stringify({ content: '안녕하세요' }));
     *     }
     * );
     * 
     * ========== 서버에서 메시지 보내기 ==========
     * 
     * @Autowired
     * private SimpMessagingTemplate messagingTemplate;
     * 
     * // 특정 채널로 브로드캐스트
     * messagingTemplate.convertAndSend("/topic/inbox/" + userId, message);
     * 
     * // 특정 사용자에게 전송
     * messagingTemplate.convertAndSendToUser(userId, "/queue/private", message);
     */
}
