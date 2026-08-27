<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('category')->index();
            $table->decimal('price', 10, 2);
            $table->decimal('compare_at_price', 10, 2)->nullable();
            $table->text('image');
            $table->text('description');
            $table->decimal('rating', 3, 2)->default(0);
            $table->unsignedInteger('reviews')->default(0);
            $table->string('badge')->nullable();
            $table->boolean('featured')->default(false)->index();
            $table->json('colors')->nullable();
            $table->json('sizes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
