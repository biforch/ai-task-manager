export function resolvePlanGenerateError(requestError) {
  const code = requestError.response?.data?.code;

  if (code === "AI_INVALID_RESPONSE") {
    return {
      message: "AI 生成的方案格式异常，尚未保存。请点击重新生成。",
      canRetry: true
    };
  }

  if (code === "AI_SERVICE_ERROR") {
    return {
      message: "AI 服务暂时不可用，请稍后重试。",
      canRetry: true
    };
  }

  if (code === "VALIDATION_ERROR") {
    return {
      message: requestError.response?.data?.error || "请输入有效的目标描述。",
      canRetry: false
    };
  }

  if (requestError.response?.data?.error) {
    return {
      message: "请求失败，请稍后重试。",
      canRetry: true
    };
  }

  return {
    message: "网络异常，请检查连接后重试。",
    canRetry: true
  };
}
