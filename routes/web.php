<?php

use Illuminate\Support\Facades\Route;

Route::view('/', 'storefront')->name('storefront');

Route::view('/{any}', 'storefront')
    ->where('any', '^(?!api(?:/|$)|up(?:/|$)|storage(?:/|$)|build(?:/|$)).*');
