"""领域异常：由路由层映射为 HTTP 状态码。"""


class PlatformError(Exception):
    """可预期的业务错误。"""

    def __init__(self, message: str, code: str = "platform_error"):
        self.message = message
        self.code = code
        super().__init__(message)


class TenantIsolationError(PlatformError):
    """跨租户访问被拒绝。"""

    def __init__(self, message: str = "无权访问该机构数据"):
        super().__init__(message, code="tenant_forbidden")


class AuthError(PlatformError):
    def __init__(self, message: str = "认证失败"):
        super().__init__(message, code="auth_error")


class MigrationError(PlatformError):
    def __init__(self, message: str):
        super().__init__(message, code="migration_error")


class OrganizationExpiredException(PlatformError):
    """机构 status=expired 或 expire_at 已过期，拒绝新学生绑定。"""

    def __init__(self, message: str = "机构订阅已过期，无法绑定学生"):
        super().__init__(message, code="organization_expired")


class OrganizationFrozenException(PlatformError):
    """机构 status=frozen，运营熔断。"""

    def __init__(self, message: str = "机构已被冻结，无法绑定学生"):
        super().__init__(message, code="organization_frozen")
