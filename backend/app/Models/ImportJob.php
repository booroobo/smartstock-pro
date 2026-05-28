<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImportJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'filename',
        'file_path',
        'status',
        'total_rows',
        'success_rows',
        'failed_rows',
        'error_message',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
