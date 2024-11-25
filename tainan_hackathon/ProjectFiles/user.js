import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ocrstydcjvxqbhjmxwnb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jcnN0eWRjanZ4cWJoam14d25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxOTI3MTAsImV4cCI6MjA0NTc2ODcxMH0.ZupOGBcMk73nP8IMxbAUqzTx-weHM9RxmU48v-Tzpaw';
const supabase = createClient(supabaseUrl, supabaseKey);

let selectedRating = 0; 


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


async function fetchStoreDataByCategory(category) {
    const { data, error } = await supabase
        .from('title') 
        .select('title')
        .eq('title', category); 

    if (error) {
        console.error('Error fetching category data from Supabase:', error);
        return [];
    }

    
    const { data: storeData, error: storeError } = await supabase
        .from(category) 
        .select('store_name, coordinates, rating, user_ratings_total, photo_url')
        .gte('rating', selectedRating) 

    if (storeError) {
        console.error('Error fetching store data from Supabase:', storeError);
        return [];
    }

    
    const processedData = storeData.map(store => {
        const coordinates = store.coordinates
            .replace(/[()]/g, '') 
            .split(', ') 
            .map(coord => parseFloat(coord)); 

        return { ...store, coordinates };
    });

    console.log('獲取的店家數據:', processedData);
    return processedData;
}

async function sendStoreDataToServer(stores) {
    try {
        const response = await fetch('/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stores)
        });

        if (response.ok) {
            console.log('成功更新地圖');
            document.querySelector('iframe').src = '/Home/map.html?' + new Date().getTime(); 
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
        if (confirmBtn.textContent === "搜尋！") {
            const selectedFoods = [];
            document.querySelectorAll(".filter-options input[type='checkbox']:checked").forEach(function (checkbox) {
                selectedFoods.push(checkbox.value);
            });

            if (selectedFoods.length > 0) {
                const category = selectedFoods[0];
                const stores = await fetchStoreDataByCategory(category);
                if (stores.length > 0) {
                    await sendStoreDataToServer(stores);
                }
            } else {
                console.log("未選擇主題美食，無法加載資料");
                return;
            }
            confirmBtn.textContent = "重新搜尋";
            confirmBtn.classList.add("gray-button");
        } else if (confirmBtn.textContent === "重新搜尋") {
            confirmBtn.textContent = "搜尋！";
            confirmBtn.classList.remove("gray-button");
            document.querySelectorAll(".filter-options input[type='checkbox']").forEach(function (checkbox) {
                checkbox.checked = false;
            });

            selectedRating = 0;
            highlightStars(-1);

            await fetch('/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([])
            });
            
            document.querySelector('iframe').src = '/Home/map.html?' + new Date().getTime();
        }
    });

    function highlightStars(index) {
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, i) => {
            star.classList.toggle('selected', i <= index);
        });
    }
});
