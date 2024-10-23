from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from fastapi.responses import HTMLResponse
import time
import googlemaps

app = FastAPI()


class SearchRequest(BaseModel):
    searchword: str
    searchdistance: int
    selectedRating: int


map = googlemaps.Client(key="AIzaSyAiBroOElwIbiRMwUud5LQAg_6UwWOafJA")
MaxItemNum = 10

geocode_result = map.geocode("Tainan")[0]
location = geocode_result["geometry"]["location"]


@app.get("/")
async def read_root():
    return {"message": "Hello, World!"}


@app.post("/search")
async def search(request: SearchRequest):

    search_result = []
    result = map.places_nearby(
        location, keyword=request.searchword, radius=request.searchdistance * 1000
    )
    for r in result["results"]:
        if float(r["rating"]) > request.selectedRating:
            search_result.append(r)
    next = result.get("next_page_token")

    while len(search_result) < MaxItemNum:
        time.sleep(2)
        result = map.places_nearby(
            location,
            keyword=request.searchword,
            radius=request.searchdistance * 1000,
            page_token=next,
        )
        for r in result["results"]:
            if float(r["rating"]) > request.selectedRating:
                search_result.append(r)
        next = result.get("next_page_token")

    ReturnAll = ""

    ratings = [float(place["rating"]) for place in search_result]
    reviews = [float(place["user_ratings_total"]) for place in search_result]

    def normalize(data):
        min_val = min(data)
        max_val = max(data)
        return [(x - min_val) / (max_val - min_val) for x in data]

    normalized_ratings = normalize(ratings)
    normalized_reviews = normalize(reviews)

    for i in range(len(search_result)):
        search_result[i]["normalized_rating"] = normalized_ratings[i]
        search_result[i]["normalized_reviews"] = normalized_reviews[i]

    def scorecounter(rate, reviews):
        rate_w = 0.6
        reviews_w = 0.4
        return rate * rate_w + reviews * reviews_w

    for place in search_result:
        place["score"] = scorecounter(
            place["normalized_rating"], place["normalized_reviews"]
        )

    search_result = sorted(search_result, key=lambda x: x["score"], reverse=True)

    for place in search_result:
        ReturnAll += f"<div class='place-item'><div class='place-item-left'><div class='place-item-name'>{place['name']}</div><div class='place-item-rating'>{place['rating']} <span class='star rated'>★</span> {place['user_ratings_total']} 則評論</div></div><div class='place-item-right'><label class='place-check'><input type='checkbox'></label></div></div>"

    return ReturnAll


app.mount("/Home", StaticFiles(directory="Prototype_1021", html=True))
