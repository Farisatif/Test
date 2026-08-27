<?php

use App\Http\Controllers\CatalogController;
use App\Http\Controllers\StoreApiController;
use Illuminate\Support\Facades\Route;

Route::get('/healthz', [StoreApiController::class, 'health']);
Route::get('/products', [CatalogController::class, 'products']);
Route::get('/products/{product}', [CatalogController::class, 'product']);
Route::get('/categories', [CatalogController::class, 'categories']);
Route::get('/dashboard/summary', [StoreApiController::class, 'dashboard']);
Route::post('/orders', [StoreApiController::class, 'createOrder']);
