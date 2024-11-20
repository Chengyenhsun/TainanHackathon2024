/*
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ocrstydcjvxqbhjmxwnb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jcnN0eWRjanZ4cWJoam14d25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxOTI3MTAsImV4cCI6MjA0NTc2ODcxMH0.ZupOGBcMk73nP8IMxbAUqzTx-weHM9RxmU48v-Tzpaw'
const supabase = createClient(supabaseUrl, supabaseKey)

/*
async function insertData(name, lat, lng, photo_url, rating, user_ratings_total, business_status) {
    const { data, error } = await supabase
        .from('牛肉湯')
        .insert([
            { 
                store_name: name, 
                coordinates: [lat, lng], 
                photo_url: photo_url, 
                rating: rating, 
                user_ratings_total: user_ratings_total, 
                business_status: business_status
            }
        ])

    if (error) {
        console.error('Error inserting data:', error)
    } else {
        console.log('Data inserted:', data)
    }
}
*/

async function insertData(folderName, places) {
    if (!folderName || !Array.isArray(places) || places.length === 0) {
        console.error('Invalid data or folder name');
        return;
    }

    try {
        const { data, error } = await supabase
            .from(folderName) 
            .insert(places);

        if (error) {
            console.error('Error inserting data:', error);
            return;
        }

        console.log('Data inserted:', data);
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}
export default insertData;


document.querySelector('.add-folder-btn').addEventListener('click', async function(event) {

    const placeItemName = document.querySelector('.place-item-name');

    const name = placeItemName.textContent;
    const latitude = parseFloat(placeItemName.getAttribute('data-lat'));
    const longitude = parseFloat(placeItemName.getAttribute('data-lng'));
    const photo_url = placeItemName.closest('.place-item').querySelector('img').getAttribute('src');
    const rating = placeItemName.closest('.place-item').querySelector('.place-item-rating').textContent.trim().split(' ')[0];
    const user_ratings_total = placeItemName.closest('.place-item').querySelector('.place-item-rating').textContent.trim().split('/')[1].split('則')[0].trim();
    const business_status = placeItemName.closest('.place-item').querySelector('.place-item-status').textContent.trim();

    console.log(name, latitude, longitude, photo_url, rating, user_ratings_total, business_status);

    insertData(name, latitude, longitude, photo_url, rating, user_ratings_total, business_status);
});

const container = document.getElementById('result');

container.addEventListener('click', async function(event) {
    if (event.target.classList.contains('place-item-name')) {

    const placeItemName = document.querySelector('.place-item-name');

    const name = placeItemName.textContent;
    const latitude = parseFloat(placeItemName.getAttribute('data-lat'));
    const longitude = parseFloat(placeItemName.getAttribute('data-lng'));
    const photo_url = placeItemName.closest('.place-item').querySelector('img').getAttribute('src');
    const rating = placeItemName.closest('.place-item').querySelector('.place-item-rating').textContent.trim().split(' ')[0];
    const user_ratings_total = placeItemName.closest('.place-item').querySelector('.place-item-rating').textContent.trim().split('/')[1].split('則')[0].trim();
    const business_status = placeItemName.closest('.place-item').querySelector('.place-item-status').textContent.trim();

    console.log(name, latitude, longitude, photo_url, rating, user_ratings_total, business_status);

    insertData(name, latitude, longitude, photo_url, rating, user_ratings_total, business_status);
}});