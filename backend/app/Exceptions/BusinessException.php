<?php

namespace App\Exceptions;

/**
 * 422 — a domain/business rule was violated (distinct from input validation).
 */
class BusinessException extends ApiException
{
    public function __construct(string $message, ?string $errorCode = null)
    {
        parent::__construct(422, $message, $errorCode);
    }
}
