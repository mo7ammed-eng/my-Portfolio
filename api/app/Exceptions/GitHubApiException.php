<?php

namespace App\Exceptions;

use RuntimeException;

class GitHubApiException extends RuntimeException
{
    public function __construct(
        string $message,
        public int $status = 0,
        public ?int $rateLimitReset = null
    ) {
        parent::__construct($message);
    }
}
