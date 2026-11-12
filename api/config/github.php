<?php

return [
    'client_id' => env('GITHUB_CLIENT_ID'),
    'client_secret' => env('GITHUB_CLIENT_SECRET'),
    'redirect_uri' => env('GITHUB_OAUTH_REDIRECT_URI', env('FRONTEND_URL', 'http://localhost:3000').'/api/admin/github/callback'),
    'webhook_secret' => env('GITHUB_WEBHOOK_SECRET'),
    'token' => env('GITHUB_TOKEN'),
    'api_url' => env('GITHUB_API_URL', 'https://api.github.com'),
    'timeout' => (int) env('GITHUB_API_TIMEOUT', 20),
    'cache_ttl' => (int) env('GITHUB_CACHE_TTL', 600),
    'max_file_bytes' => (int) env('GITHUB_MAX_FILE_BYTES', 524288),
];
