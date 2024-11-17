from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
import folium
from fastapi.responses import JSONResponse
import logging

app = FastAPI()
app.mount("/Home", StaticFiles(directory="ProjectFiles", html=True))
logging.basicConfig(level=logging.INFO)


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
        store_data[store_name] = coordinates

    create_map(store_data)
    return JSONResponse(content=store_data)


def create_map(store_data):
    tainan_train_station_coords = [22.997212, 120.212319]
    m = folium.Map(location=tainan_train_station_coords, zoom_start=14)

    # 為每個商店添加標記
    for store, coords in store_data.items():
        # 添加主要標記
        folium.Marker(
            location=coords,
            icon=folium.Icon(icon="glyphicon glyphicon-cutlery", color="red"),
            popup=store,  # 使用 popup 顯示店名
        ).add_to(m)

        # 添加顯示店名的標記
        folium.Marker(
            location=[coords[0] - 0.0001, coords[1]],
            icon=folium.DivIcon(
                html=f"""
                <div style="font-size: 1.5em; font-weight: bold; text-align: center; white-space: nowrap;">
                    {store}
                </div>
                """
            ),
        ).add_to(m)

    m.save("ProjectFiles/map.html")


create_map({})
