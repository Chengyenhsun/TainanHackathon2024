from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
import folium
from fastapi.responses import JSONResponse
import logging

app = FastAPI()
app.mount("/Home", StaticFiles(directory="ProjectFiles", html=True))
logging.basicConfig(level=logging.INFO)


def create_initial_map():
    tainan_train_station_coords = [22.997212, 120.212319]
    m = folium.Map(location=tainan_train_station_coords, zoom_start=14)
    m.save("ProjectFiles/map.html")


# 初始地圖，確保每次啟動伺服器時都會生成
create_initial_map()


@app.get("/")
async def read_root():
    return {"message": "Hello, World!"}


@app.post("/search")
async def search(request: Request):
    logging.info("Received a request to /search")
    stores = await request.json()

    store_data = {}
    for store in stores:
        store_name = store["store_name"]
        coordinates = store["coordinates"]
        photo_url = store["photo_url"]
        store_data[store_name] = {"coordinates": coordinates, "photo_url": photo_url}

    # 根據是否有店家數據來決定生成哪種地圖
    if store_data:
        create_map(store_data)
    else:
        # 如果沒有店家數據，則重新加載初始地圖
        create_initial_map()

    return JSONResponse(content=store_data)


def create_map(store_data):
    tainan_train_station_coords = [22.997212, 120.212319]
    m = folium.Map(location=tainan_train_station_coords, zoom_start=14)

    for store, data in store_data.items():
        coords = data["coordinates"]
        photo_url = data["photo_url"]
        google_maps_url = f"https://www.google.com/maps/search/?api=1&query={store}"

        icon_html = f"""
        <div style="
            width: 6.75em; 
            height: 6.75em; 
            background-image: url('{photo_url}'); 
            background-size: cover; 
            background-position: center; 
            border: 0.225em solid white;
            box-shadow: 0em 0.25em 0.375em rgba(0, 0, 0, 0.3);
        "></div>
        """

        # 添加主要標記並附加 JavaScript 事件
        marker = folium.Marker(location=coords, icon=folium.DivIcon(html=icon_html))
        marker.add_to(m)

        # 使用 JavaScript 將標記點擊事件與 Google Maps 連結
        m.get_root().html.add_child(
            folium.Element(
                f"""
                <script>
                    var marker = L.marker([{coords[0]}, {coords[1]}]).addTo(m);
                    marker.on('click', function() {{
                        window.open('{google_maps_url}', '_blank');
                    }});
                </script>
                """
            )
        )
        # 添加顯示店名的標記，並讓其可以直接跳轉
        folium.Marker(
            location=[coords[0], coords[1]],  # 店名標記與圖標保持相同的經緯度
            icon=folium.DivIcon(
                html=f"""
        <div style="
            position: relative;
            top: 4.5em; 
            font-size: 1.5em;
            font-weight: bold;
            text-align: center;
            white-space: nowrap;
            color: black;
        ">
            <a href="{google_maps_url}" target="_blank" style="text-decoration: none; color: black;">
                {store}
            </a>
        </div>
        """
            ),
        ).add_to(m)

    m.save("ProjectFiles/map.html")


create_map({})
