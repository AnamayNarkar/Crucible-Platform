package com.crucible.platform.v1.dto.submission;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PistonExecuteResponse {
    private String language;
    private String version;
    private RunResult run;
    private CompileResult compile;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RunResult {
        private String stdout;
        private String stderr;
        private String output;
        private Integer code;
        private String signal;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CompileResult {
        private String stdout;
        private String stderr;
        private String output;
        private Integer code;
        private String signal;
    }
}
