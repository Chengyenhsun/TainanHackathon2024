import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ocrstydcjvxqbhjmxwnb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jcnN0eWRjanZ4cWJoam14d25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxOTI3MTAsImV4cCI6MjA0NTc2ODcxMH0.ZupOGBcMk73nP8IMxbAUqzTx-weHM9RxmU48v-Tzpaw';  // 替換為你自己的 Supabase 金鑰
const supabase = createClient(supabaseUrl, supabaseKey);

// 從 Supabase 讀取資料庫中的店家數據
async function fetchStoreData() {
    const { data, error } = await supabase
        .from('test')
        .select('store_name, coordinates');

    if (error) {
        console.error('Error fetching store data:', error);
        return [];
    } else {
        console.log('Store data fetched:', data);
        return data;
    }
}

// 將資料傳遞給後端 FastAPI
async function sendStoreDataToServer(stores) {
    try {
        const response = await fetch("/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(stores)
        });

        if (response.ok) {
            console.log("店家資料已傳送並更新地圖");
            // 重新加載地圖
            document.querySelector("iframe").src = "/Home/map.html";
        } else {
            console.error("傳送店家資料失敗");
        }
    } catch (error) {
        console.error("傳送店家資料時出錯:", error);
    }
}

// 監聽確認按鈕的點擊事件
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

    // 監聽地圖中的點擊事件
    document.querySelector("iframe").addEventListener("load", function() {
        const mapFrame = this.contentWindow;

        // 假設使用了 jQuery 來簡化事件處理
        $(mapFrame.document).on('click', '.leaflet-popup-content', function(event) {
            const storeName = $(this).text();  // 取得商店名稱
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${storeName}`;
            window.open(googleMapsUrl, '_blank');  // 跳轉至 Google Maps
        });
    });
});

