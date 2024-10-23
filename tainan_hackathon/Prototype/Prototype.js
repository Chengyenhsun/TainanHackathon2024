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

        console.log('searchword:', searchword);
        console.log('searchdistance:', searchdistance);
        console.log('selectedRating:', selectedRating);

        try {
            const response = await fetch("/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ searchword, searchdistance, selectedRating })
            });

            if (response.ok) {
                const data = await response.text();
                const Data = data.replace(/^"(.*)"$/, '$1');
                document.getElementById("result").innerHTML = "<h2>搜尋結果：</h2>"+Data;
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
