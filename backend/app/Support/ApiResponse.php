<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

final class ApiResponse
{
    /** $extra keys are merged at top level alongside message/data. */
    public static function success(mixed $data = null, ?string $message = null, array $extra = [], int $status = 200): JsonResponse
    {
        $payload = $extra;
        if ($message !== null) {
            $payload['message'] = $message;
        }
        if ($data !== null) {
            $payload['data'] = $data;
        }

        return response()->json($payload, $status);
    }

    public static function created(mixed $data = null, ?string $message = null, array $extra = []): JsonResponse
    {
        return static::success($data, $message, $extra, 201);
    }

    public static function message(string $message, array $extra = [], int $status = 200): JsonResponse
    {
        return static::success(null, $message, $extra, $status);
    }

    public static function error(string $message, int $status, ?string $code = null, array $errors = [], array $headers = []): JsonResponse
    {
        $payload = ['message' => $message];
        if ($code !== null) {
            $payload['code'] = $code;
        }
        if ($errors !== []) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $status, $headers);
    }
}
