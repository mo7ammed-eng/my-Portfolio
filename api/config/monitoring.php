<?php

return [
    'log_retention_days' => (int) env('SYSTEM_LOG_RETENTION_DAYS', 30),
    'activity_retention_days' => (int) env('REQUEST_ACTIVITY_RETENTION_DAYS', 90),
    'visitor_retention_days' => (int) env('VISITOR_RETENTION_DAYS', 180),
    'max_client_error_length' => 4000,
    'trusted_proxies' => ['127.0.0.1', '::1'],
];
