from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
import folium
from fastapi.responses import JSONResponse
import logging

app = FastAPI()

# 將靜態文件夾 ProjectFiles 挂載到根目錄
app.mount("/Home", StaticFiles(directory="ProjectFiles", html=True))

# 設定日誌級別
logging.basicConfig(level=logging.INFO)

# 店家資料（店名與座標）
beef_soup_stores = {
    "永樂牛肉湯": [22.997780586622824, 120.1987674364872],
    "新鮮牛肉湯(東門店)": [22.98623509535712, 120.22139604018476],
    "億哥牛肉湯": [22.98853061429865, 120.23443586300858],
}


@app.get("/")
async def read_root():
    return {"message": "Hello, World!"}


@app.post("/search")
async def search(request: Request):
    logging.info("Received a request to /search")
    data = await request.json()

    # 檢查是否勾選了“牛肉湯”
    if "牛肉湯" in data.get("foods", []):
        # 創建並更新地圖
        create_map(beef_soup_stores)
        return JSONResponse(content=beef_soup_stores)

    return JSONResponse(content={"message": "錯誤的請求"}, status_code=400)


def create_map(store_data):
    # 台南火車站的座標
    tainan_train_station_coords = [22.997212, 120.212319]

    # 創建地圖
    m = folium.Map(location=tainan_train_station_coords, zoom_start=14)

    # 添加店家標記
    for store, coords in store_data.items():
        folium.Marker(
            location=coords,
            popup=store,
            icon=folium.Icon(icon="glyphicon glyphicon-cutlery", color="red"),
        ).add_to(m)

    # 保存地圖
    m.save("ProjectFiles/map.html")


# 創建初始地圖
create_map({})
