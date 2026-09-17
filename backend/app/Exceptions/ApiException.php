<?php

namespace App\Exceptions;

/**
 * Base exception for API errors carrying an HTTP status code and an optional
 * machine-readable error code.
 */
abstract class ApiException extends \Symfony\Component\HttpKernel\Exception\HttpException
{
    public function __construct(int $statusCode, string $message = '', protected ?string $errorCode = null)
    {
        parent::__construct($statusCode, $message);
    }

    public function errorCode(): ?string
    {
        return $this->errorCode;
    }
}
