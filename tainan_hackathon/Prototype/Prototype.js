import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ocrstydcjvxqbhjmxwnb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jcnN0eWRjanZ4cWJoam14d25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxOTI3MTAsImV4cCI6MjA0NTc2ODcxMH0.ZupOGBcMk73nP8IMxbAUqzTx-weHM9RxmU48v-Tzpaw'
const supabase = createClient(supabaseUrl, supabaseKey)

document.addEventListener("DOMContentLoaded", function () {
    const stars = document.querySelectorAll('.star');
    let selectedRating = 0;

    let addToFolderButton;
    let inputField;

    const slider = document.getElementById("distanceslider");
    const output = document.getElementById("distancevalue");

    const numslider = document.getElementById("numslider");
    const numoutput = document.getElementById("numvalue");

    const reviewslider = document.getElementById("reviewslider");
    const reviewoutput = document.getElementById("reviewvalue");

    updateDistanceValue(slider.value);
    updateNumValue(numslider.value);
    updateReviewValue(reviewslider.value);

    slider.oninput = function () {
        updateDistanceValue(this.value);
    };

    numslider.oninput = function () {
        updateNumValue(this.value);
    };

    reviewslider.oninput = function () {
        updateReviewValue(this.value);
    };

    stars.forEach((star, index) => {
        star.addEventListener('mouseover', () => {
            highlightStars(index);
        });

        star.addEventListener('mouseout', () => {
            highlightStars(selectedRating - 1); 
        });

        star.addEventListener('click', () => {
            selectedRating = index + 1; 
            highlightStars(index);
            console.log('選擇的星等:', selectedRating);
        });
    });

    
    document.getElementById("searchbtn").onclick = handleSearch;


    function updateDistanceValue(value) {
        output.innerText = `${value} km`;
    }

    function updateNumValue(value) {
        numoutput.innerText = `${value} 家`;
    }

    function updateReviewValue(value) {
        reviewoutput.innerText = `${value} 年`;
    }


    async function handleSearch() {
        const searchword = document.getElementById("searchword").value;
        const searchdistance = slider.value;
        const selectedAreas = Array.from(document.querySelectorAll('.filter-options input:checked'))
                                                                .map(checkbox => checkbox.value);
        const MaxItemNum = numslider.value;

        console.log('searchword:', searchword);
        console.log('searchdistance:', searchdistance);
        console.log('selectedRating:', selectedRating);
        console.log('selectedAreas:', selectedAreas);
        console.log('searchMaxNum:', MaxItemNum)

        try {
            const response = await fetch("/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ searchword, searchdistance, selectedRating, selectedAreas, MaxItemNum })
            });

            if (response.ok) {
                const data = await response.text();
                const Data = data.replace(/^"(.*)"$/, '$1');
                document.getElementById("result").innerHTML = "<h2>搜尋結果：</h2>"+Data;
            
                const placeItemNames = document.querySelectorAll('.place-item-name');
                if (placeItemNames.length > 0) {
                    createConfirmButton();
                }
                
                const confirmButton = document.getElementById("confirm-btn");
                confirmButton.addEventListener("click", function() {
                    const checkboxes = document.querySelectorAll('.place-check input[type="checkbox"]');
                    checkboxes.forEach(function(checkbox) {
                        const placeItem = checkbox.closest('.place-item');
                        if (!checkbox.checked) {
                            placeItem.style.display = 'none'; 
                        }
                    });
                    createAddToFolderButton();
                });

            } else {
                const errorData = await response.json();
                console.error("Error details:", errorData);
                document.getElementById("result").innerText = "發生錯誤！" + JSON.stringify(errorData);
            }
        } catch (error) {
            console.error("Error during fetch:", error);
            document.getElementById("result").innerText = "發生錯誤！請稍後再試。";
        }
    }

    function createConfirmButton() {
        const resultContainer = document.getElementById("result");

        let confirmButton = resultContainer.querySelector("#confirm-btn");
        if (!confirmButton) {
            confirmButton = document.createElement("button");
            confirmButton.id = "confirm-btn";
            confirmButton.innerText = "確認";
            confirmButton.classList.add("confirm-btn-style");
            resultContainer.appendChild(confirmButton);

            confirmButton.addEventListener("click", handleConfirmClick);
        }
    }

    function handleConfirmClick() {
        console.log("已確認，保留勾選項目");

        const checkboxes = document.querySelectorAll('.place-check input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const placeItem = checkbox.closest('.place-item');
            if (!checkbox.checked) {
                placeItem.style.display = 'none';
            }
        });

        createAddToFolderButton();
    }

    function createAddToFolderButton() {
        const resultContainer = document.getElementById("result");
        console.log('createAddtoFolderBtn');
        if (!inputField) {
            inputField = document.createElement("input");
            inputField.type = "text";
            inputField.placeholder = "輸入資料夾名稱";
            inputField.classList.add("input-folder-name");
            resultContainer.appendChild(inputField);
        }

        if (!addToFolderButton) {
            addToFolderButton = document.createElement("button");
            addToFolderButton.id = "add-folder-btn";
            addToFolderButton.innerText = "確認，加入資料夾";
            addToFolderButton.classList.add("add-folder-btn-style");
            resultContainer.appendChild(addToFolderButton);

            addToFolderButton.addEventListener("click", handleAddToFolder);
        }
    }

    async function handleAddToFolder() {
        const folderName = inputField.value.trim();
        if (!folderName) {
            console.log("請輸入資料夾名稱");
            return;
        }

        const checkboxes = document.querySelectorAll('.place-check input[type="checkbox"]:checked');
        if (checkboxes.length === 0) {
            console.log("請選擇至少一個店家");
            return;
        }

        const selectedPlaces = Array.from(checkboxes).map(checkbox => {
            const placeItem = checkbox.closest('.place-item');
            const placeNameElement = placeItem.querySelector('.place-item-name');
            
            return {
                store_name: placeNameElement.getAttribute('data-name') || null,
                coordinates: `(${parseFloat(placeNameElement.getAttribute('data-lat')) || null}, ${parseFloat(placeNameElement.getAttribute('data-lng')) || null})`, // 組合 lat, lng
                photo_url: placeNameElement.getAttribute('data-photo_url') || null,
                rating: parseFloat(placeNameElement.getAttribute('data-rating')) || null,
                user_ratings_total: parseInt(placeNameElement.getAttribute('data-user_ratings_total'), 10) || null,
                business_status: placeNameElement.getAttribute('data-status') || null,
            };
        });

        console.log(`將選定的項目加入資料夾：${folderName}`, selectedPlaces);

        try {
            const { data, error } = await supabase
                .from(folderName) 
                .insert(selectedPlaces);
    
            if (error) {
                console.error('Error inserting data:', error);
                return;
            }
    
            console.log('Data inserted:', data);
        } catch (error) {
            console.error('Unexpected error:', error);
        }
    }

    
    function highlightStars(index) {
        stars.forEach((star, i) => {
            if (i <= index) {
                star.classList.add('selected');
            } else {
                star.classList.remove('selected');
            }
        });
    }
});

const container = document.getElementById('result');

container.addEventListener('click', async function(event) {
    if (event.target.classList.contains('place-item-name')) {
        const selectedItem = event.target.textContent;
        const userRatingsTotal = event.target.getAttribute('data-user_ratings_total');
        console.log(selectedItem);

        const ratingElement = event.target.closest('.place-item').querySelector('.place-item-rating');
        let loadingElement = ratingElement.parentNode.querySelector('.place-item-loading, .hashtag-response');

        if (!loadingElement) {
            loadingElement = document.createElement('div');
            loadingElement.className = 'place-item-loading';
            ratingElement.parentNode.insertBefore(loadingElement, ratingElement.nextSibling);
        } else {
            loadingElement.innerText = '';
            loadingElement.className = 'place-item-loading';
        }

        let currentDots = 2;

        // dynamic loading
        const interval = setInterval(() => {
            loadingElement.innerText = '.'.repeat(currentDots); 
            currentDots = (currentDots < 6) ? currentDots + 1 : 2;
        }, 500); 

        try {
            const response = await fetch("/hashtag", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ searchword: selectedItem, reviewsnum: userRatingsTotal })
            });

            clearInterval(interval);
            
            if (response.ok) {
                const data = await response.text();
                const Data = data.replace(/^"(.*)"$/, '$1');
                loadingElement.innerHTML = Data; 
                loadingElement.classList.remove('place-item-loading');
                loadingElement.classList.add('hashtag-response');
            } else {
                loadingElement.innerText = 'Unable to obtain';
                loadingElement.classList.remove('place-item-loading');
                loadingElement.classList.add('hashtag-response');
            }
        } catch (error) {
            console.error("Error during fetch:", error);
            clearInterval(interval);
            loadingElement.innerText = '發生錯誤！';
            loadingElement.classList.remove('place-item-loading');
            loadingElement.classList.add('hashtag-response');
        }
    }
});