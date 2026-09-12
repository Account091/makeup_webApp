export class AiGatewayError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code = "AI_GATEWAY_ERROR", statusCode = 500) {
    super(message);
    this.name = "AiGatewayError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class AiAuthenticationError extends AiGatewayError {
  constructor(message = "Authentication required for AI request") {
    super(message, "AI_UNAUTHENTICATED", 401);
    this.name = "AiAuthenticationError";
  }
}

export class AiAuthorizationError extends AiGatewayError {
  constructor(message = "Role or scope unauthorized for this AI feature") {
    super(message, "AI_UNAUTHORIZED", 403);
    this.name = "AiAuthorizationError";
  }
}

export class AiSafetyViolationError extends AiGatewayError {
  constructor(message = "Request violated AI safety or boundary rules") {
    super(message, "AI_SAFETY_VIOLATION", 400);
    this.name = "AiSafetyViolationError";
  }
}

export class AiToolAuthorizationError extends AiGatewayError {
  constructor(message = "Unauthorized tool execution attempt") {
    super(message, "AI_TOOL_UNAUTHORIZED", 403);
    this.name = "AiToolAuthorizationError";
  }
}

export class AiRateLimitError extends AiGatewayError {
  constructor(message = "AI request rate limit exceeded. Please try again later.") {
    super(message, "AI_RATE_LIMIT_EXCEEDED", 429);
    this.name = "AiRateLimitError";
  }
}

export class AiModelTimeoutError extends AiGatewayError {
  constructor(message = "Model provider request timed out") {
    super(message, "AI_MODEL_TIMEOUT", 504);
    this.name = "AiModelTimeoutError";
  }
}

export class AiResponseValidationError extends AiGatewayError {
  constructor(message = "Model response failed schema or business rule validation") {
    super(message, "AI_RESPONSE_VALIDATION_FAILED", 422);
    this.name = "AiResponseValidationError";
  }
}
