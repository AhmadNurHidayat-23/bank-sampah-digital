<?php

namespace Tests\Unit;

use App\Models\Category;
use App\Models\Deposit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryDepositModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_category_deposit_relations_and_scopes(): void
    {
        $user = User::factory()->create();
        $category = Category::create([
            'name' => 'Kardus Tebal',
            'description' => 'Kardus coklat bersih tanpa perekat',
            'price' => 1500,
            'active' => true,
        ]);

        $deposit = Deposit::create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'category_name' => $category->name,
            'weight_g' => 5000,
            'price' => $category->price,
            'amount' => 7500,
            'status' => 'pending',
            'note' => 'Setoran kardus kemasan',
        ]);

        $this->assertTrue($deposit->category->is($category));
        $this->assertTrue($category->deposits->contains($deposit));
        $this->assertTrue($deposit->isPending());
        $this->assertFalse($deposit->isVerified());

        $this->assertCount(1, Category::active()->get());
    }
}
