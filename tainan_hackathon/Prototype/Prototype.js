document.addEventListener("DOMContentLoaded", function () {
    const stars = document.querySelectorAll('.star');
    let selectedRating = 0;
    const slider = document.getElementById("distanceslider");
    const output = document.getElementById("distancevalue");

    updateDistanceValue(slider.value);

    slider.oninput = function () {
        updateDistanceValue(this.value);
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


    async function handleSearch() {
        const searchword = document.getElementById("searchword").value;
        const searchdistance = slider.value;
        const selectedAreas = Array.from(document.querySelectorAll('.filter-options input:checked'))
                               .map(checkbox => checkbox.value);

        console.log('searchword:', searchword);
        console.log('searchdistance:', searchdistance);
        console.log('selectedRating:', selectedRating);
        console.log('selectedAreas:', selectedAreas);

        try {
            const response = await fetch("/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ searchword, searchdistance, selectedRating, selectedAreas })
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

    // New Confirm Button //
    function createConfirmButton() {
        const resultContainer = document.getElementById("result");
        const confirmButton = document.createElement("button");
        confirmButton.id = "confirm-btn";
        confirmButton.innerText = "確認";
        confirmButton.classList.add("confirm-btn-style");
        resultContainer.appendChild(confirmButton);
    }  
    
    // New AddToFolderButton //
    function createAddToFolderButton() {
        const resultContainer = document.getElementById("result");
        const addToFolderButton = document.createElement("button");
        addToFolderButton.id = "add-folder-btn";
        addToFolderButton.innerText = "確認，加入資料夾";
        addToFolderButton.classList.add("add-folder-btn-style");
        resultContainer.appendChild(addToFolderButton);

        addToFolderButton.addEventListener("click", function() {
            console.log("將選定的項目加入資料夾");
        });
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
        console.log(selectedItem);

        const loadingElement = document.createElement('div');
        loadingElement.className = 'place-item-loading';
        
        // 找到place-item-rating並插入loadingElement在其下面
        const ratingElement = event.target.closest('.place-item').querySelector('.place-item-rating');
        ratingElement.parentNode.insertBefore(loadingElement, ratingElement.nextSibling);

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
                body: JSON.stringify({ searchword: selectedItem, reviewsnum: 50 })
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

