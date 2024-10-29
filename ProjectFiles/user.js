document.addEventListener("DOMContentLoaded", function () {
    
    const confirmBtn = document.getElementById("confirm-btn");

    confirmBtn.addEventListener("click", async function () {
        const selectedFoods = [];

        document.querySelectorAll(".filter-options input[type='checkbox']:checked").forEach(function (checkbox) {
            const value = checkbox.value;
            selectedFoods.push(value);
        });

        const requestData = {
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
                document.querySelector("iframe").src = "/Home/map.html";
            } else {
                console.error("搜尋請求失敗");
            }
        } catch (error) {
            console.error("發送搜尋請求時出錯:", error);
        }
    });
});
