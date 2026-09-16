<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
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

        return response()->json([
            'message' => 'Tạo nhân viên thành công',
            'data' => new UserResource($user),
        ], 201);
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

        return response()->json(['data' => new UserResource($user)]);
    }

    /**
     * PUT/PATCH /api/admin/users/{user}
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $user = $this->userService->update($request->user(), $user, $request->validated());

        return response()->json([
            'message' => 'Cập nhật thành công',
            'data' => new UserResource($user),
        ]);
    }

    /**
     * DELETE /api/admin/users/{user}
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->userService->delete($request->user(), $user);

        return response()->json(['message' => 'Đã xóa nhân viên']);
    }

    /**
     * GET /api/team/users
     * Admin: tất cả user. Manager: subordinates + chính mình.
     */
    public function team(Request $request): JsonResponse
    {
        return response()->json([
            'data' => UserResource::collection($this->userService->teamFor($request->user())),
        ]);
    }
}
