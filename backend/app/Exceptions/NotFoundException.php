<?php

namespace App\Exceptions;

/**
 * 404 — the requested resource could not be found.
 */
class NotFoundException extends ApiException
{
    public function __construct(?string $message = null, ?string $errorCode = null)
    {
        parent::__construct(404, $message ?? __('messages.common.not_found'), $errorCode);
    }
}
