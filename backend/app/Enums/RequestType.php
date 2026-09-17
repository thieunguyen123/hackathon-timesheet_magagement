<?php

namespace App\Enums;

enum RequestType: string
{
    case Off = 'off';
    case Remote = 'remote';
    case Ot = 'ot';

    public function label(): string
    {
        return match ($this) {
            self::Off => 'Nghỉ phép',
            self::Remote => 'Làm remote',
            self::Ot => 'Làm thêm giờ (OT)',
        };
    }

    public function shortLabel(): string
    {
        return match ($this) {
            self::Off => 'nghỉ phép',
            self::Remote => 'remote',
            self::Ot => 'OT',
        };
    }
}
