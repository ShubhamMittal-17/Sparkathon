from flask import Flask, request, send_file
import pygame
import io
import pytmx
from navigation_algo_test import generate_path, tmx_data, arrow_images
from flask_cors import CORS
from PIL import Image
import io


app = Flask(__name__)
CORS(app)

@app.route("/api/path_image", methods=["POST"])
def render_path_image():
    raw_items = request.json.get("items", [])
    path, item_tiles = generate_path(raw_items)

    width = tmx_data.width * tmx_data.tilewidth
    height = tmx_data.height * tmx_data.tileheight

    # Create off-screen surface
    surface = pygame.Surface((width, height))
    surface.fill((0, 0, 0))

    # Draw on surface
    draw_map_to_surface(surface)
    draw_arrows_to_surface(surface, path,item_tiles)

    # Convert pygame surface to PIL image
    raw_str = pygame.image.tostring(surface, 'RGB')
    image = Image.frombytes('RGB', surface.get_size(), raw_str)

    # Save PIL image to BytesIO buffer
    image_bytes = io.BytesIO()
    image.save(image_bytes, format='PNG')
    image_bytes.seek(0)

    print(">> Sending navigation image")
    return send_file(image_bytes, mimetype='image/png')

def draw_map_to_surface(surface):
    for layer in tmx_data.visible_layers:
        if isinstance(layer, pytmx.TiledTileLayer):
            for x, y, gid in layer:
                tile = tmx_data.get_tile_image_by_gid(gid)
                if tile:
                    surface.blit(tile, (x * tmx_data.tilewidth, y * tmx_data.tileheight))
        elif isinstance(layer, pytmx.TiledObjectGroup):
            for obj in layer:
                if hasattr(obj, "gid") and obj.gid:
                    img = tmx_data.get_tile_image_by_gid(obj.gid)
                    if img:
                        surface.blit(img, (obj.x, obj.y))
                else:
                    # Optional: outline non-tile objects
                    pygame.draw.rect(surface, (255, 0, 0), (obj.x, obj.y, obj.width, obj.height), 2)

def draw_arrows_to_surface(surface, path, item_tiles):
    rendered = set()

    def get_direction(a, b):
        dx = b[0] - a[0]
        dy = b[1] - a[1]
        if dx == -1: return 'up'
        if dx == 1: return 'down'
        if dy == -1: return 'left'
        if dy == 1: return 'right'
        return None

    opposite = {
        "up": "down", "down": "up",
        "left": "right", "right": "left"
    }

    for i in range(1, len(path) - 1):
        prev = path[i - 1]
        curr = path[i]
        nxt = path[i + 1]

        if curr in rendered:
            continue

        dir1 = get_direction(prev, curr)
        dir2 = get_direction(curr, nxt)

        x = curr[1] * tmx_data.tilewidth
        y = curr[0] * tmx_data.tileheight

        if curr in item_tiles:
            img = arrow_images.get("item")
        elif dir1 == dir2:
            img = arrow_images["vertical"] if dir1 in ("up", "down") else arrow_images["horizontal"]
        elif dir1 == opposite.get(dir2):
            img = arrow_images.get(f"uturn_{dir2}")
        else:
            img = arrow_images.get(f"curve_{dir1}_{dir2}")

        if img:
            img = pygame.transform.scale(img, (tmx_data.tilewidth, tmx_data.tileheight))
            surface.blit(img, (x, y))
            rendered.add(curr)
        else:
            print(f"[WARN] Missing arrow image for: {dir1}, {dir2}")
        
        final = path[-1]
        if final not in rendered:
            x = final[1] * tmx_data.tilewidth
            y = final[0] * tmx_data.tileheight
            img = arrow_images.get("item")
            if img:
                img = pygame.transform.scale(img, (tmx_data.tilewidth, tmx_data.tileheight))
                surface.blit(img, (x, y))


if __name__ == "__main__":
    pygame.init()
    print(">>> Flask is starting...")
    app.run(debug=True)
