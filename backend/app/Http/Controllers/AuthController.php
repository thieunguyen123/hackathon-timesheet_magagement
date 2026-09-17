<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\LeaveBalance;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        if (! Auth::attempt($request->validated())) {
            throw ValidationException::withMessages([
                'email' => __('messages.auth.login_failed'),
            ]);
        }

        $user = Auth::user();
        $token = $user->createToken('api')->plainTextToken;

        return ApiResponse::success(extra: [
            'token' => $token,
            'user' => new UserResource($user->load('leaveBalances')),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return ApiResponse::message(__('messages.auth.logout_success'));
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->fresh();
        LeaveBalance::for($user, (int) now()->year);
        $user->load('leaveBalances');

        return ApiResponse::success(new UserResource($user));
    }
}
