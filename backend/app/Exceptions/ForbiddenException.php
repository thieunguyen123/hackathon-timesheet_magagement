<?php

namespace App\Exceptions;

/**
 * 403 — the authenticated user is not allowed to perform the action.
 */
class ForbiddenException extends ApiException
{
    public function __construct(?string $message = null, ?string $errorCode = null)
    {
        parent::__construct(403, $message ?? __('messages.common.forbidden'), $errorCode);
    }
}
