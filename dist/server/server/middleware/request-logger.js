export const requestLogger = (req, res, next) => {
    const requestId = generateRequestId();
    const startTime = Date.now();
    // Add request ID to headers for tracing
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-ID', requestId);
    const requestLog = {
        requestId,
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        timestamp: new Date().toISOString()
    };
    // Log request start
    console.log(`[${requestLog.timestamp}] ${requestLog.method} ${requestLog.url} - ${requestLog.ip} [${requestId}]`);
    // Capture response details
    const originalSend = res.send;
    res.send = function (body) {
        const responseTime = Date.now() - startTime;
        requestLog.responseTime = responseTime;
        requestLog.statusCode = res.statusCode;
        requestLog.contentLength = Buffer.byteLength(body || '');
        // Log response
        const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
        console.log(`[${new Date().toISOString()}] ${logLevel} ${requestLog.method} ${requestLog.url} - ${res.statusCode} ${responseTime}ms ${requestLog.contentLength}bytes [${requestId}]`);
        // Log slow requests
        if (responseTime > 5000) {
            console.warn(`[SLOW REQUEST] ${requestLog.method} ${requestLog.url} took ${responseTime}ms [${requestId}]`);
        }
        return originalSend.call(this, body);
    };
    next();
};
export const healthCheckLogger = (req, res, next) => {
    // Skip logging for health checks to reduce noise
    if (req.url === '/api/health' || req.url === '/health') {
        return next();
    }
    return requestLogger(req, res, next);
};
function generateRequestId() {
    return Math.random().toString(36).substring(2, 15);
}
