import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ocrstydcjvxqbhjmxwnb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jcnN0eWRjanZ4cWJoam14d25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxOTI3MTAsImV4cCI6MjA0NTc2ODcxMH0.ZupOGBcMk73nP8IMxbAUqzTx-weHM9RxmU48v-Tzpaw'
const supabase = createClient(supabaseUrl, supabaseKey)

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
async function fetchStoreData(selectedFoods) {
    const { data, error } = await supabase
        .from('牛肉湯')
        .select('store_name, coordinates')
        .gte('rating', selectedRating); // 根據星等過濾

    if (error) {
        console.error('Error fetching store data:', error);
        return [];
    }

    // 處理 coordinates 字串為數字格式
    const processedData = data.map(store => {
        const coordinates = store.coordinates
            .replace(/[()]/g, '')  // 去除括號
            .split(', ')  // 根據逗號分割
            .map(coord => parseFloat(coord));  // 轉換為浮點數

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
            // 重新加載地圖
            document.querySelector('iframe').src = '/Home/map.html?' + new Date().getTime();  // 加上時間戳強制重新載入
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

        // 只在選擇了"牛肉湯"時才從資料庫讀取資料
        if (selectedFoods.includes("牛肉湯")) {
            const stores = await fetchStoreData();  // 從資料庫獲取店家數據
            if (stores.length > 0) {
                await sendStoreDataToServer(stores);  // 傳送數據到後端
            }
        } else {
            console.log("未選擇牛肉湯，無法加載資料");
        }
    });

    // 監聽地圖中的點擊事件，這裡改為直接在 fastapi 生成的地圖頁面中處理
    document.querySelector("iframe").addEventListener("load", function () {
        const mapFrame = this.contentWindow;

        // 直接使用 leaflet 來處理點擊 popup
        mapFrame.L.DomEvent.on(mapFrame.document, 'click', function (event) {
            if (event.target && event.target.classList.contains('leaflet-popup-content')) {
                const storeName = event.target.innerText.trim();
                if (storeName) {
                    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeName)}`;
                    window.open(googleMapsUrl, '_blank');  // 跳轉至 Google Maps
                }
            }
        });
    });
});


