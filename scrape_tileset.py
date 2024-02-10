from PIL import Image
from io import BytesIO
import requests
import os

def get_zxy(z, x, y):
    url = f"https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    # url = f"https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png"
    user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0"
    headers = {'User-Agent': user_agent}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        img = Image.open(BytesIO(response.content))
        return img
    else:
        raise Exception(f"Failed to retrieve image. HTTP status code: {response.status_code}")

def cache_image(z, x, y):
    img_path = f"tilesosm/{z}/{x}/{y}.png"
    # img_path = f"tilesarcgis/{z}/{x}/{y}.png"
    if os.path.exists(img_path):
        return
    img = get_zxy(z, x, y)
    os.makedirs(os.path.dirname(img_path), exist_ok=True)
    img.save(img_path)

targetDepth = 5
total_img_count = 0
for i in range(0, targetDepth + 1):
    total_img_count += 4 ** i
imgcount = 0
imgcountlevel = 0
currentTargetDepth = 0
def get_node(z, x, y):
    global imgcountlevel

    if z > currentTargetDepth:
        return

    if z == currentTargetDepth:
        imgcountlevel += 1
    #level 7 has 4^7 =            16 384 images
    #level 8 has 4^8 =            65 536 images
    #level 10 has 4^10 =       1 048 576 images
    #level 19 has 4^19 = 274 877 906 944 images
    print("Total: " + format((imgcount + imgcountlevel) / total_img_count, '.5f') + "%",
          "Level:", currentTargetDepth, format(imgcountlevel / 4 ** currentTargetDepth, '.3f') + "%", "- " * z, x, y)

    cache_image(z, x, y)
    get_node(z + 1, x * 2 + 0, y * 2 + 0)
    get_node(z + 1, x * 2 + 1, y * 2 + 0)
    get_node(z + 1, x * 2 + 0, y * 2 + 1)
    get_node(z + 1, x * 2 + 1, y * 2 + 1)

for i in range(0, targetDepth + 1):
    imgcountlevel = 0
    currentTargetDepth = i
    get_node(0, 0, 0)
    imgcount += 4 ** i

