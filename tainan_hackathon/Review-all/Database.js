import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ocrstydcjvxqbhjmxwnb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jcnN0eWRjanZ4cWJoam14d25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxOTI3MTAsImV4cCI6MjA0NTc2ODcxMH0.ZupOGBcMk73nP8IMxbAUqzTx-weHM9RxmU48v-Tzpaw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchAllTitles() {
    const Container = document.querySelector('.filter-options')
    Container.innerHTML = '';

    const { data, error } = await supabase
        .from('title')
        .select('title');

    if (error) {
        console.error('Error fetching titles from Supabase:', error);
        Container.innerText = '無法獲取分類資料';
        return;
    }

    data.forEach(item => {
        console.log('got title');
        const button = document.createElement('button');
        button.textContent = item.title; 
        button.classList.add('filter-btn');
        button.dataset.category = item.title;

        /*
        button.addEventListener('click', function() {
            button.classList.toggle('selected');

            const selectedButtons = document.querySelectorAll('.filter-btn.selected');
            const selectedCategories = Array.from(selectedButtons).map(btn => btn.dataset.category);
            console.log('選擇的分類:', selectedCategories);

        });
        */

        Container.appendChild(button);
    });
}

fetchAllTitles();

document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver(() => {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.removeEventListener('click', handleClick);
            button.addEventListener('click', handleClick);
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    
    function handleClick(event) {
        const type = event.target.innerText.trim();
        console.log('chose: ' + type);
        fetchAllData(type);
    }
});

async function fetchAllData(type) {
    const resultContainer = document.getElementById('result');
    resultContainer.innerHTML = '<h2>已儲存店家：</h2>';

    const { data, error } = await supabase
        .from(type)
        .select('*');

    if (error) {
        console.error('Error fetching data:', error);
        resultContainer.innerText = '無法獲取資料';
    } else {
        const status = {
            'OPERATIONAL': '🟢 營業中',
            'CLOSED_TEMPORARILY': '🟡 暫時歇業',
            'CLOSED_PERMANENTLY': '🔴 永久歇業'
        };

        const uniqueData = [];
        const seenStores = new Set();

        data.forEach(item => {
            if (!seenStores.has(item.store_name)) {
                seenStores.add(item.store_name);
                uniqueData.push(item);
            }
        });

        uniqueData.forEach(item => {
            const placeItemDiv = document.createElement('div');
            placeItemDiv.classList.add('place-item');
            
            placeItemDiv.innerHTML = `
                <img src="${item.photo_url}" alt="${item.store_name} 的圖片" class="place-image"/>
                <div class="place-item-left">
                    <div class="place-item-name" data-lat="${item.coordinates[0]}" data-lng="${item.coordinates[1]}">
                        ${item.store_name}
                    </div>
                    <div class="place-item-rating">
                        ${item.rating} <span class="star rated">★</span> / ${item.user_ratings_total} 則評論
                    </div>
                    <div class="place-item-status">
                        ${status[item.business_status] || '📛 狀態未知'}
                    </div>
                </div>
                <div class="place-item-right">
                    <label class="place-check">
                        <input type="checkbox">
                    </label>
                </div>
            `;

            resultContainer.appendChild(placeItemDiv);
        });
    }
}

//document.addEventListener('DOMContentLoaded', fetchAllData);
