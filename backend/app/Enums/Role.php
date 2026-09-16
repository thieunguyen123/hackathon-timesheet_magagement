<?php

namespace App\Enums;

enum Role: string
{
    case Admin = 'admin';
    case Manager = 'manager';
    case User = 'user';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Quản trị viên',
            self::Manager => 'Quản lý',
            self::User => 'Nhân viên',
        };
    }
}
