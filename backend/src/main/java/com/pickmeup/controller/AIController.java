package com.pickmeup.controller;

import com.pickmeup.dto.common.ApiResponse;
import com.pickmeup.service.OpenAIService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final OpenAIService openAIService;

    /**
     * Mermaid 다이어그램 생성
     */
    @PostMapping("/diagram")
    public ApiResponse<Map<String, String>> generateDiagram(@RequestBody DiagramRequest request) {
        String diagram = openAIService.generateDiagram(
            request.content(),
            request.diagramType(),
            request.prompt()
        );
        
        // mermaid 코드 블록에서 실제 코드만 추출
        String cleanDiagram = diagram
            .replace("```mermaid", "")
            .replace("```", "")
            .trim();
        
        return ApiResponse.success(Map.of("diagram", cleanDiagram));
    }

    public record DiagramRequest(
        String content,
        String diagramType,
        String prompt
    ) {}
}
