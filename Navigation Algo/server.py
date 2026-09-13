from flask import Flask, request, send_file
import pygame
import io
import os
import base64
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





# ---------------------------------------------------------------------------
# Custom-layout route rendering (driven by the in-browser Store Editor).
# Accepts an arbitrary grid + entrance + item cells and renders a generic map
# (aisles/shelves as flat tiles) with the A*+TSP route drawn on top -- no Tiled
# art required, so any layout the user designs can be rendered.
# ---------------------------------------------------------------------------
TILE = 48

def draw_arrows_generic(surface, path, item_tiles, tile):
    rendered = set()

    def get_direction(a, b):
        dx_, dy_ = b[0] - a[0], b[1] - a[1]
        if dx_ == -1: return 'up'
        if dx_ == 1: return 'down'
        if dy_ == -1: return 'left'
        if dy_ == 1: return 'right'
        return None

    opp = {"up": "down", "down": "up", "left": "right", "right": "left"}

    for i in range(1, len(path) - 1):
        prev, curr, nxt = path[i - 1], path[i], path[i + 1]
        if curr in rendered:
            continue
        d1, d2 = get_direction(prev, curr), get_direction(curr, nxt)
        x, y = curr[1] * tile, curr[0] * tile
        if curr in item_tiles:
            img = arrow_images.get("item")
        elif d1 == d2:
            img = arrow_images["vertical"] if d1 in ("up", "down") else arrow_images["horizontal"]
        elif d1 == opp.get(d2):
            img = arrow_images.get(f"uturn_{d2}")
        else:
            img = arrow_images.get(f"curve_{d1}_{d2}")
        if img:
            img = pygame.transform.scale(img, (tile, tile))
            surface.blit(img, (x, y))
            rendered.add(curr)

    if path:
        last = path[-1]
        img = arrow_images.get("item")
        if img and last not in rendered:
            img = pygame.transform.scale(img, (tile, tile))
            surface.blit(img, (last[1] * tile, last[0] * tile))


def render_grid_route(grid_data, entrance, path, item_tiles, rec_cells=None):
    rows, cols = len(grid_data), len(grid_data[0])
    surface = pygame.Surface((cols * TILE, rows * TILE))
    surface.fill((230, 230, 230))
    for r in range(rows):
        for c in range(cols):
            rect = (c * TILE, r * TILE, TILE - 1, TILE - 1)
            color = (150, 110, 70) if grid_data[r][c] == 1 else (245, 245, 245)
            pygame.draw.rect(surface, color, rect)
    ex, ey = entrance
    pygame.draw.rect(surface, (40, 180, 80), (ey * TILE, ex * TILE, TILE - 1, TILE - 1))
    draw_arrows_generic(surface, path, item_tiles, TILE)

    # Recommended-on-route items: yellow pins at their shelf cells.
    for (rx, ry) in (rec_cells or []):
        cx, cy = ry * TILE + TILE // 2, rx * TILE + TILE // 2
        pygame.draw.circle(surface, (255, 205, 0), (cx, cy), TILE // 4)
        pygame.draw.circle(surface, (170, 120, 0), (cx, cy), TILE // 4, 2)

    raw_str = pygame.image.tostring(surface, 'RGB')
    image = Image.frombytes('RGB', surface.get_size(), raw_str)
    buf = io.BytesIO()
    image.save(buf, format='PNG')
    buf.seek(0)
    return buf


@app.route("/api/route", methods=["POST"])
def render_route():
    data = request.json
    grid_data = data.get("grid")
    entrance = tuple(data.get("entrance", [len(grid_data) - 1, 0]))
    items = data.get("items", [])
    recommended = data.get("recommended", [])   # candidate shelf cells [[x,y], ...]
    threshold = data.get("threshold", 1)         # how close counts as "on the way"

    path, item_tiles = generate_path(items, custom_grid=grid_data, custom_entrance=entrance)

    # Keep only recommended items whose pickup cell is within `threshold` of the
    # shortest route -- i.e. items the shopper passes anyway (minimal detour).
    on_route = []
    for idx, (rx, ry) in enumerate(recommended):
        pickup = (rx + 1, ry)
        dmin = min((abs(pickup[0] - px) + abs(pickup[1] - py) for (px, py) in path), default=9999)
        if dmin <= threshold:
            on_route.append(idx)

    rec_on_route_cells = [tuple(recommended[i]) for i in on_route]
    image_bytes = render_grid_route(grid_data, entrance, path, item_tiles, rec_on_route_cells)
    b64 = base64.b64encode(image_bytes.getvalue()).decode()
    print(f">> Route: {len(items)} items, path {len(path)}, {len(on_route)}/{len(recommended)} recs on-route")
    return {"image": "data:image/png;base64," + b64, "on_route_indices": on_route}


if __name__ == "__main__":
    pygame.init()
    pygame.font.init()
    port = int(os.environ.get("PORT", 5001))
    print(f">>> Flask is starting on port {port} (all interfaces)...")
    app.run(host="0.0.0.0", port=port)
