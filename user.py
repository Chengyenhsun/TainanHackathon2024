from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
import folium
from fastapi.responses import JSONResponse
import logging
import math

app = FastAPI()
app.mount("/Home", StaticFiles(directory="ProjectFiles", html=True))
logging.basicConfig(level=logging.INFO)


def create_initial_map():
    tainan_train_station_coords = [22.997212, 120.212319]
    m = folium.Map(location=tainan_train_station_coords, zoom_start=14)
    m.save("ProjectFiles/map.html")


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
        hashtag = store.get("hashtag", "")

        store_data[store_name] = {
            "coordinates": coordinates,
            "photo_url": photo_url,
            "hashtag": hashtag,
        }

    if store_data:
        create_map(store_data)
    else:
        create_initial_map()

    return JSONResponse(content=store_data)


def calculate_zoom_level(lat_diff, lon_diff):
    """根據經緯度範圍計算地圖的 zoom_start"""
    max_diff = max(lat_diff, lon_diff)
    if max_diff < 0.01:
        return 16
    elif max_diff < 0.1:
        return 14
    elif max_diff < 1:
        return 12
    else:
        return max(8, 12 - int(math.log(max_diff, 2)))


def create_map(store_data):

    if not store_data:
        print("No store data available")
        return
    min_lat = min(store["coordinates"][0] for store in store_data.values())
    max_lat = max(store["coordinates"][0] for store in store_data.values())
    min_lon = min(store["coordinates"][1] for store in store_data.values())
    max_lon = max(store["coordinates"][1] for store in store_data.values())

    lat_diff = max_lat - min_lat
    lon_diff = max_lon - min_lon

    center_lat = (min_lat + max_lat) / 2
    center_lon = (min_lon + max_lon) / 2
    zoom_level = calculate_zoom_level(lat_diff, lon_diff)

    m = folium.Map(location=[center_lat, center_lon], zoom_start=zoom_level)

    for store, data in store_data.items():
        coords = data["coordinates"]
        photo_url = data["photo_url"]
        hashtag = data["hashtag"]
        google_maps_url = f"https://www.google.com/maps/search/?api=1&query={store}"

        icon_html = f"""
        <a href="{google_maps_url}" target="_blank" style="text-decoration: none;">
            <div style="
                width: 6.75em; 
                height: 6.75em; 
                background-image: url('{photo_url}'); 
                background-size: cover; 
                background-position: center; 
                border: 0.225em solid white;
                box-shadow: 0em 0.25em 0.375em rgba(0, 0, 0, 0.3);
            "></div>
        </a>
        """
        marker = folium.Marker(location=coords, icon=folium.DivIcon(html=icon_html))
        if hashtag:
            marker.add_child(
                folium.Tooltip(
                    f"<span style='font-size: 1.35em; font-weight: bold;'>{hashtag}</span>",
                    permanent=False,
                )
            )

        marker.add_to(m)

        folium.Marker(
            location=[coords[0], coords[1]],
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
