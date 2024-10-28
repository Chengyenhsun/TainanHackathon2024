document.addEventListener("DOMContentLoaded", function () {
    const searchBtn = document.getElementById("search-btn");

    searchBtn.addEventListener("click", async function () {
        const selectedAreas = [];
        const selectedFoods = [];

        // 一次遍歷區域與美食的選項
        document.querySelectorAll(".filter-options input[type='checkbox']:checked").forEach(function (checkbox) {
            const value = checkbox.value;
            // 根據選項是區域還是美食分類
            if (["中西區", "東區", "北區", "南區", "永康區", "安平區"].includes(value)) {
                selectedAreas.push(value);
            } else {
                selectedFoods.push(value);
            }
        });

        const requestData = {
            areas: selectedAreas,
            foods: selectedFoods
        };

        try {
            const response = await fetch("/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                // 重新加載地圖
                document.getElementById("map-frame").src = "/map.html";
            } else {
                console.error("搜尋請求失敗");
            }
        } catch (error) {
            console.error("發送搜尋請求時出錯:", error);
        }
    });
});
