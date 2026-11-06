<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_landing_loads(): void
    {
        $this->withoutVite()->get('/')->assertOk();
    }
}
