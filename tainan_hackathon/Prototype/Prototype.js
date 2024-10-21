document.addEventListener("DOMContentLoaded", function () {
    const slider = document.getElementById("distanceslider");
    const output = document.getElementById("distancevalue");
    let selectedStarRating = 0; // 儲存選擇的星等值

    // 初始化距離滑條的值
    updateDistanceValue(slider.value);

    // 綁定距離滑條事件
    slider.oninput = function () {
        updateDistanceValue(this.value);
    };

    // 綁定搜尋按鈕事件
    document.getElementById("searchbtn").onclick = handleSearch;

    // 綁定星等選擇事件
    bindStarRatingEvents();

    // 更新距離滑條的顯示值
    function updateDistanceValue(value) {
        output.innerText = `${value} km`;
    }

    // 處理搜尋按鈕的邏輯
    async function handleSearch() {
        const searchword = document.getElementById("searchword").value;
        const searchdistance = slider.value;

        console.log('搜尋字詞:', searchword);
        console.log('搜尋距離:', searchdistance);
        console.log('選擇的星等:', selectedStarRating);

        try {
            const response = await fetch("/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ searchword, searchdistance, starRating: selectedStarRating })
            });

            if (response.ok) {
                const data = await response.text();
                document.getElementById("result").innerHTML = data;
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

    // 綁定星等選擇功能
    function bindStarRatingEvents() {
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            star.dataset.value = index + 1; // 為每個星等元素添加 data-value 屬性
            star.addEventListener('click', () => {
                stars.forEach(s => s.classList.remove('selected'));
                for (let i = 0; i <= index; i++) {
                    stars[i].classList.add('selected');
                }
                selectedStarRating = star.dataset.value; // 更新選擇的星等
                console.log('選擇的星等:', selectedStarRating);
            });
        });
    }
});
