import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ocrstydcjvxqbhjmxwnb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jcnN0eWRjanZ4cWJoam14d25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxOTI3MTAsImV4cCI6MjA0NTc2ODcxMH0.ZupOGBcMk73nP8IMxbAUqzTx-weHM9RxmU48v-Tzpaw';
const supabase = createClient(supabaseUrl, supabaseKey);

let selectedRating = 0; // 保存用戶選擇的星等

// 星等選擇功能
document.addEventListener('DOMContentLoaded', function () {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.addEventListener('mouseover', () => highlightStars(index));
        star.addEventListener('mouseout', () => highlightStars(selectedRating - 1));
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            highlightStars(index);
            console.log('選擇的星等:', selectedRating);
        });
    });

    function highlightStars(index) {
        stars.forEach((star, i) => {
            star.classList.toggle('selected', i <= index);
        });
    }
});

// 從 Supabase 資料庫中獲取店家數據
async function fetchStoreDataByCategory(category) {
    const { data, error } = await supabase
        .from('title') // 從 title 資料表中查詢
        .select('title')
        .eq('title', category); // 依據勾選的類別過濾資料表

    if (error) {
        console.error('Error fetching category data from Supabase:', error);
        return [];
    }

    // 根據 category 查詢相對應的資料表
    const { data: storeData, error: storeError } = await supabase
        .from(category) // 使用選擇的 category 作為資料表名稱
        .select('store_name, coordinates, rating, user_ratings_total')
        .gte('rating', selectedRating) // 根據星等過濾

    if (storeError) {
        console.error('Error fetching store data from Supabase:', storeError);
        return [];
    }

    // 處理 coordinates 字串為數字格式
    const processedData = storeData.map(store => {
        const coordinates = store.coordinates
            .replace(/[()]/g, '') // 去除括號
            .split(', ') // 根據逗號分割
            .map(coord => parseFloat(coord)); // 轉換為浮點數

        return { ...store, coordinates };
    });

    console.log('獲取的店家數據:', processedData);
    return processedData;
}

// 傳送數據到後端
async function sendStoreDataToServer(stores) {
    try {
        const response = await fetch('/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stores)
        });

        if (response.ok) {
            console.log('成功更新地圖');
            // 強制重新加載地圖，並加上時間戳避免緩存
            document.querySelector('iframe').src = '/Home/map.html?' + new Date().getTime(); // 加上時間戳強制重新載入
        } else {
            console.error('更新地圖失敗');
        }
    } catch (error) {
        console.error('傳送數據至後端時出錯:', error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const confirmBtn = document.getElementById("confirm-btn");

    confirmBtn.addEventListener("click", async function () {
        const selectedFoods = [];

        document.querySelectorAll(".filter-options input[type='checkbox']:checked").forEach(function (checkbox) {
            const value = checkbox.value;
            selectedFoods.push(value);
        });

        // 根據選擇的主題美食來查詢相對應的資料
        if (selectedFoods.length > 0) {
            // 假設只取選擇的第一個主題類別
            const category = selectedFoods[0];
            const stores = await fetchStoreDataByCategory(category); // 根據勾選的類別獲取資料
            if (stores.length > 0) {
                await sendStoreDataToServer(stores); // 傳送數據到後端
            }
        } else {
            console.log("未選擇主題美食，無法加載資料");
        }
    });
});
