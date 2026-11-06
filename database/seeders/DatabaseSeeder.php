<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([['Plastik PET', 'Botol minuman bersih, tutup dipisahkan.', 3500], ['Kertas & kardus', 'Kering, tanpa lapisan minyak atau makanan.', 1800], ['Logam aluminium', 'Kaleng bersih dan sudah dipipihkan.', 12000], ['Kaca bening', 'Botol utuh, terpisah dari pecahan.', 600]] as [$name,$description,$price]) {
            Category::firstOrCreate(compact('name'), compact('description', 'price'));
        }
    }
}
