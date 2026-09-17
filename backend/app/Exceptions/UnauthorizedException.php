<?php

namespace App\Exceptions;

/**
 * 401 — the request requires an authenticated user.
 */
class UnauthorizedException extends ApiException
{
    public function __construct(?string $message = null, ?string $errorCode = null)
    {
        parent::__construct(401, $message ?? __('messages.auth.unauthenticated'), $errorCode);
    }
}
