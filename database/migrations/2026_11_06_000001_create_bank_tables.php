<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $t) {
            $t->string('role')->default('member');
            $t->bigInteger('balance')->default(0);
        });
        Schema::create('categories', function (Blueprint $t) {
            $t->id();
            $t->string('name')->unique();
            $t->string('description');
            $t->unsignedInteger('price');
            $t->boolean('active')->default(true);
            $t->timestamps();
        });
        Schema::create('deposits', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained();
            $t->foreignId('category_id')->constrained();
            $t->string('category_name');
            $t->unsignedInteger('weight_g');
            $t->unsignedInteger('price');
            $t->unsignedBigInteger('amount');
            $t->string('status')->default('pending');
            $t->text('note')->nullable();
            $t->timestamps();
        });
        Schema::create('withdrawals', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained();
            $t->unsignedBigInteger('amount');
            $t->string('status')->default('pending');
            $t->text('note')->nullable();
            $t->timestamps();
        });
        Schema::create('entries', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained();
            $t->string('source')->unique();
            $t->string('kind');
            $t->bigInteger('amount');
            $t->bigInteger('balance_after');
            $t->string('description');
            $t->timestamps();
        });
        Schema::create('audits', function (Blueprint $t) {
            $t->id();
            $t->foreignId('actor_id')->constrained('users');
            $t->string('subject');
            $t->string('action');
            $t->json('details');
            $t->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['audits', 'entries', 'withdrawals', 'deposits', 'categories'] as $n) {
            Schema::dropIfExists($n);
        }Schema::table('users', fn (Blueprint $t) => $t->dropColumn(['role', 'balance']));
    }
};
