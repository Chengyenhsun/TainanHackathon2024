from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import folium

app = FastAPI()

# 移除了 name="static"
app.mount("/", StaticFiles(directory="ProjectFiles", html=True))


@app.get("/")
async def read_root():
    return {"message": "Hello, World!"}


def create_map():
    tainan_train_station_coords = [22.997212, 120.212319]

    m = folium.Map(location=tainan_train_station_coords, zoom_start=15)
    marker = folium.Marker(
        location=tainan_train_station_coords,
        icon=folium.Icon(icon="glyphicon glyphicon-map-marker", color="darkblue"),
    )
    marker.add_to(m)

    folium.Marker(
        location=tainan_train_station_coords,
        icon=folium.DivIcon(
            html="""
                <div style="font-size: 1.5em; font-weight: bold; color: darkblue; white-space: nowrap; 
                    text-align: center; background-color: transparent; 
                    padding: 0.3125em; text-shadow: 0.125em 0.125em 0.25em rgba(0, 0, 0, 0.5);">
                    台南火車站
                </div>
            """
        ),
        icon_size=(150, 30),  # 设置图标大小
        icon_anchor=(75, 15),  # 将锚点设为图标的中心
        offset=(0, -30),  # 调整偏移以放置文本
    ).add_to(m)

    m.save("ProjectFiles/map.html")


# 创建地图
create_map()
