from flask import Flask, request, send_file
import pygame
import io
import pytmx
from navigation_algo_test import generate_path, tmx_data,text_labels, arrow_images
from flask_cors import CORS
from PIL import Image
import io
import xml.etree.ElementTree as ET


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
                # else:
                    # Optional: outline non-tile objects
                    #  pygame.draw.rect(surface, (255, 0, 0), (obj.x, obj.y, obj.width, obj.height), 2)
    draw_text_objects_to_surface(surface)
    
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

def draw_text_objects_to_surface(surface):
    for label in text_labels:
        font = pygame.font.SysFont(label["font"], label["size"], bold=label["bold"])

        # Convert hex color
        r = int(label["color"][1:3], 16)
        g = int(label["color"][3:5], 16)
        b = int(label["color"][5:7], 16)

        rendered = font.render(label["text"], True, (r, g, b))

        if label["rotation"]:
            rendered = pygame.transform.rotate(rendered, -label["rotation"])

        # print(f">> Rendering: {label['text']} at ({label['x']}, {label['y']})")
        # Center text in the object's box if width/height is defined
        pos_x = label["x"]
        pos_y = label["y"]
        
        if "width" in label and "height" in label:
            pos_x += (label["width"] - rendered.get_width()) / 2
            pos_y += (label["height"] - rendered.get_height()) / 2
        
        surface.blit(rendered, (pos_x, pos_y))





if __name__ == "__main__":
    pygame.init()
    pygame.font.init()
    print(">>> Flask is starting...")
    app.run(debug=True)
