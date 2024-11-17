import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ocrstydcjvxqbhjmxwnb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jcnN0eWRjanZ4cWJoam14d25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxOTI3MTAsImV4cCI6MjA0NTc2ODcxMH0.ZupOGBcMk73nP8IMxbAUqzTx-weHM9RxmU48v-Tzpaw';
const supabase = createClient(supabaseUrl, supabaseKey);

// 插入資料的函數
async function insertData(name, lat, lng, photo_url, rating, user_ratings_total, business_status) {
    try {
        const { data, error } = await supabase
            .from('牛肉湯') // 確認這是正確的資料表名稱
            .insert([
                {
                    store_name: name,
                    coordinates: [lat, lng],
                    photo_url: photo_url,
                    rating: rating,
                    user_ratings_total: user_ratings_total,
                    //business_status: business_status
                }
            ]);
        
        if (error) {
            console.error('Error inserting data:', error);
        } else {
            console.log('Data inserted:', data);
        }
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.right-panel'); // 假設所有的 place-item-name 元素都在 right-panel 內

    container.addEventListener('click', async function(event) {
        if (event.target.classList.contains('place-item-name')) {
            const placeItemName = event.target;
            
            const latitude = parseFloat(placeItemName.getAttribute('data-lat'));
            const longitude = parseFloat(placeItemName.getAttribute('data-lng'));
            const photo_url = placeItemName.getAttribute('data-photo_url');
            const rating = parseFloat(placeItemName.getAttribute('data-rating'));
            const user_ratings_total = parseInt(placeItemName.getAttribute('data-user_ratings_total'));
            const business_status = placeItemName.getAttribute('data-business_status'); // 營業狀態

            console.log({
                store_name: placeItemName.textContent,
                coordinates: [latitude, longitude],
                photo_url: photo_url,
                rating: rating,
                user_ratings_total: user_ratings_total,
                business_status: business_status
            });

            // 呼叫插入資料的函數
            await insertData(placeItemName.textContent, latitude, longitude, photo_url, rating, user_ratings_total, business_status);
        }
    });
});
