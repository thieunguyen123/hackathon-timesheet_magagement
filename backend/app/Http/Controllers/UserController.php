<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserController extends Controller
{
    public function __construct(private UserService $userService) {}

    /**
     * GET /api/admin/users
     * Danh sách nhân viên (admin), hỗ trợ ?role= và ?q= (name/email).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        return UserResource::collection(
            $this->userService->paginate($request->only(['role', 'q']))
        );
    }

    /**
     * POST /api/admin/users
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userService->create($request->validated());

        return ApiResponse::created(
            new UserResource($user),
            __('messages.user.created'),
        );
    }

    /**
     * GET /api/admin/users/{user}
     */
    public function show(User $user): JsonResponse
    {
        $user->load([
            'manager:id,name',
            'leaveBalances' => fn ($query) => $query->where('year', now()->year),
        ]);

        return ApiResponse::success(new UserResource($user));
    }

    /**
     * PUT/PATCH /api/admin/users/{user}
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $user = $this->userService->update($request->user(), $user, $request->validated());

        return ApiResponse::success(
            new UserResource($user),
            __('messages.user.updated'),
        );
    }

    /**
     * DELETE /api/admin/users/{user}
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->userService->delete($request->user(), $user);

        return ApiResponse::message(__('messages.user.deleted'));
    }

    /**
     * GET /api/team/users
     * Admin: tất cả user. Manager: subordinates + chính mình.
     */
    public function team(Request $request): JsonResponse
    {
        return ApiResponse::success(
            UserResource::collection($this->userService->teamFor($request->user()))
        );
    }
}
