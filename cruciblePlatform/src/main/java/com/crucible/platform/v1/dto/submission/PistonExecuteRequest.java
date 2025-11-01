package com.crucible.platform.v1.dto.submission;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PistonExecuteRequest {
    private String language;
    private String version;
    private List<PistonFile> files;
    private String stdin;
    private List<String> args;
    private Integer compile_timeout;
    private Integer run_timeout;
    private Long compile_memory_limit;
    private Long run_memory_limit;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PistonFile {
        private String name;
        private String content;
        private String encoding;
    }
}
