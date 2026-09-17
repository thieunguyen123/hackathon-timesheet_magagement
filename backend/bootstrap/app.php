<?php

use App\Exceptions\ApiException;
use App\Http\Middleware\ForceJsonResponse;
use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withCommands()
    ->withSchedule(function (Schedule $schedule) {
        $schedule->command('connecteam:sync')->hourly();
    })
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [
            ForceJsonResponse::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson()
        );

        $exceptions->render(function (ApiException $e) {
            return ApiResponse::error(
                $e->getMessage() ?: __('messages.common.server_error'),
                $e->getStatusCode(),
                $e->errorCode()
            );
        });

        $exceptions->render(function (ValidationException $e) {
            return ApiResponse::error($e->getMessage(), 422, errors: $e->errors());
        });

        $exceptions->render(function (AuthenticationException $e) {
            return ApiResponse::error(__('messages.auth.unauthenticated'), 401);
        });

        $exceptions->render(function (AuthorizationException|AccessDeniedHttpException $e) {
            return ApiResponse::error($e->getMessage() ?: __('messages.common.forbidden'), 403);
        });

        $exceptions->render(function (ModelNotFoundException|NotFoundHttpException $e) {
            return ApiResponse::error(__('messages.common.not_found'), 404);
        });

        $exceptions->render(function (Throwable $e) {
            if ($e instanceof HttpResponseException) {
                return $e->getResponse();
            }

            if ($e instanceof HttpExceptionInterface) {
                $status = $e->getStatusCode();
                $message = $e->getMessage() ?: (Response::$statusTexts[$status] ?? 'Error');

                return ApiResponse::error($message, $status, headers: $e->getHeaders());
            }

            return ApiResponse::error(__('messages.common.server_error'), 500);
        });
    })->create();
