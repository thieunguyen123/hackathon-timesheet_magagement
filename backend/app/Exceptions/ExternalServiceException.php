<?php

namespace App\Exceptions;

/**
 * 502 — an upstream/external service call failed.
 */
class ExternalServiceException extends ApiException
{
    public function __construct(string $message, ?string $errorCode = null)
    {
        parent::__construct(502, $message, $errorCode);
    }
}
