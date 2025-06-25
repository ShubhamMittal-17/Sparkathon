from heapq import heappop, heappush
import pygame
import sys
import pygame
import pytmx
from pytmx.util_pygame import load_pygame

arrow_images = {
    # Straight
    "up": pygame.image.load("data/arrows/up.png"),
    "down": pygame.image.load("data/arrows/down.png"),
    "left": pygame.image.load("data/arrows/left.png"),
    "right": pygame.image.load("data/arrows/right.png"),

    # Curves
    "curve_up_right": pygame.image.load("data/arrows/curve_up_right.png"),
    "curve_right_down": pygame.image.load("data/arrows/curve_right_down.png"),
    "curve_down_left": pygame.image.load("data/arrows/curve_down_left.png"),
    "curve_left_up": pygame.image.load("data/arrows/curve_left_up.png"),
    "curve_up_left": pygame.image.load("data/arrows/curve_up_left.png"),
    "curve_right_up": pygame.image.load("data/arrows/curve_right_up.png"),
    "curve_down_right": pygame.image.load("data/arrows/curve_down_right.png"),
    "curve_left_down": pygame.image.load("data/arrows/curve_left_down.png"),

    # U-turns
    "uturn_up": pygame.image.load("data/arrows/uturn_up.png"),
    "uturn_down": pygame.image.load("data/arrows/uturn_down.png"),
    "uturn_left": pygame.image.load("data/arrows/uturn_left.png"),
    "uturn_right": pygame.image.load("data/arrows/uturn_right.png"),
    
    # Plain Paths
    "horizontal":pygame.image.load("data/arrows/horizontal_path.png"),
    "vertical":pygame.image.load("data/arrows/vertical_path.png"),
    
    # Item
    "item": pygame.image.load("data/arrows/item.png"),
    
}

opposite = {
    "up": "down", "down": "up",
    "left": "right", "right": "left"
}


# Grid setup
ROWS, COLS = 10, 10
CELL_SIZE = 64
WIDTH, HEIGHT = COLS * CELL_SIZE, ROWS * CELL_SIZE

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GRAY = (200, 200, 200)
GREEN = (0, 255, 0)
BLUE = (0, 100, 255)
RED = (255, 0, 0)
YELLOW = (255, 255, 0)

dx = [-1, 1, 0, 0]
dy = [0, 0, -1, 1]

grid = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
]

entrance = (9, 4)
raw_items = [(7, 8), (5, 2), (1, 6), (3, 3),(3,8)]
items = []

for x, y in raw_items:
    pickup = (x + 1, y)
    if 0 <= pickup[0] < ROWS and grid[pickup[0]][pickup[1]] == 0:
        items.append(pickup)
    else:
        print(f"Item at {(x, y)} has unreachable pickup spot at {pickup}")
        
points = [entrance] + items

def heuristic(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


def astar(grid, start, goal):
    pq = [(heuristic(start, goal), 0, start)]
    g_score = [[float('inf')] * COLS for _ in range(ROWS)]
    came_from = [[None] * COLS for _ in range(ROWS)]
    g_score[start[0]][start[1]] = 0

    while pq:
        _, g, (x, y) = heappop(pq)
        if (x, y) == goal:
            path = []
            while (x, y) != start:
                path.append((x, y))
                x, y = came_from[x][y]
            path.append(start)
            return path[::-1]

        for d in range(4):
            nx, ny = x + dx[d], y + dy[d]
            if 0 <= nx < ROWS and 0 <= ny < COLS and grid[nx][ny] == 0:
                new_g = g + 1
                if new_g < g_score[nx][ny]:
                    g_score[nx][ny] = new_g
                    came_from[nx][ny] = (x, y)
                    heappush(pq, (new_g + heuristic((nx, ny), goal), new_g, (nx, ny)))
    return []

# def draw_grid(screen, grid, entrance,raw_items, final_path):
#     for row in range(ROWS):
#         for col in range(COLS):
#             rect = pygame.Rect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE)
#             value = grid[row][col]

#             if (row, col) == entrance:
#                 pygame.draw.rect(screen, GREEN, rect)  # Entrance
#             elif (row, col) in raw_items:
#                 pygame.draw.rect(screen, RED, rect)  # Items
#             elif (row, col) in final_path:
#                 pygame.draw.rect(screen, YELLOW, rect)  # Path
#             elif value == 1:
#                 pygame.draw.rect(screen, BLACK, rect)  # Wall
#             else:
#                 pygame.draw.rect(screen, WHITE, rect)

#             pygame.draw.rect(screen, GRAY, rect, 1)  # Grid lines

# def run_visualization(grid, entrance, raw_items, final_path):
#     pygame.init()
#     screen = pygame.display.set_mode((WIDTH, HEIGHT))
#     pygame.display.set_caption("In-Store Path Visualization")

#     clock = pygame.time.Clock()
#     running = True

#     while running:
#         screen.fill(WHITE)
#         draw_grid(screen, grid, entrance, raw_items, final_path)
#         pygame.display.flip()
#         clock.tick(30)

#         for event in pygame.event.get():
#             if event.type == pygame.QUIT:
#                 running = False

#     pygame.quit()
#     sys.exit()


def tsp_nearest_neighbor(N, distance_map):
    visited = [False] * N
    order = [0]
    visited[0] = True
    current = 0

    for _ in range(1, N):
        next_node = None
        min_dist = float('inf')
        for i in range(1, N):
            if not visited[i]:
                key = f"{current}_{i}"
                if distance_map[key] < min_dist:
                    min_dist = distance_map[key]
                    next_node = i
        visited[next_node] = True
        order.append(next_node)
        current = next_node

    return order


distance_map = {}
path_map = {}

for i in range(len(points)):
    for j in range(i + 1, len(points)):
        path = astar(grid, points[i], points[j])
        dist = len(path)
        key1 = f"{i}_{j}"
        key2 = f"{j}_{i}"
        distance_map[key1] = distance_map[key2] = dist
        path_map[key1] = path
        path_map[key2] = path[::-1]

order = tsp_nearest_neighbor(len(points), distance_map)

final_path = []
for i in range(len(order) - 1):
    key = f"{order[i]}_{order[i + 1]}"
    segment = path_map[key]
    if i > 0:
        segment = segment[1:]
    final_path.extend(segment)

# visual_grid = [['.' for _ in range(COLS)] for _ in range(ROWS)]
# for i in range(ROWS):
#     for j in range(COLS):
#         if grid[i][j] == 1:
#             visual_grid[i][j] = '#'
# visual_grid[entrance[0]][entrance[1]] = 'E'
# for x, y in items:
#     visual_grid[x][y] = 'M'
# for x, y in final_path:
#     if visual_grid[x][y] in ('.', '0'):
#         visual_grid[x][y] = '*'

# visual_output = "\n".join(" ".join(row) for row in visual_grid)
# print(visual_output)

def get_direction(a, b):
    dx = b[0] - a[0]
    dy = b[1] - a[1]
    if dx == -1: return 'up'
    if dx == 1: return 'down'
    if dy == -1: return 'left'
    if dy == 1: return 'right'
    return None

def draw_arrows(path):
    rendered = set()  

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
        if(curr in items):
            img = arrow_images["item"]
        elif dir1 == dir2:
            if dir1 == "up" or dir1 == "down":
                img = arrow_images["vertical"]
            else:
                img= arrow_images["horizontal"]
        elif dir1 == opposite.get(dir2):
            img = arrow_images.get(f"uturn_{dir2}")
        else:
            img = arrow_images.get(f"curve_{dir1}_{dir2}")

        if img:
            img = pygame.transform.scale(img, (tmx_data.tilewidth, tmx_data.tileheight))
            screen.blit(img, (x, y))
            rendered.add(curr)
        else:
            print(f"[WARN] Missing arrow for direction: {dir1}, {dir2}")


pygame.init()
screen = pygame.display.set_mode((800, 600)) 


tmx_data = load_pygame("data/map.tmx")

screen = pygame.display.set_mode((tmx_data.width * tmx_data.tilewidth, tmx_data.height * tmx_data.tileheight))
pygame.display.set_caption("Tiled Map Viewer")

# Drawing function
def draw_map():
    for layer in tmx_data.visible_layers:
        if isinstance(layer, pytmx.TiledTileLayer):
            for x, y, gid in layer:
                tile = tmx_data.get_tile_image_by_gid(gid)
                if tile:
                    screen.blit(tile, (x * tmx_data.tilewidth, y * tmx_data.tileheight))
        elif isinstance(layer, pytmx.TiledObjectGroup):
            for obj in layer:
                if hasattr(obj, "gid") and obj.gid:
                    img = tmx_data.get_tile_image_by_gid(obj.gid)
                    if img:
                        screen.blit(img, (obj.x, obj.y))
                else:
                    pygame.draw.rect(screen, (255, 0, 0), (obj.x, obj.y, obj.width, obj.height), 2)

# Main loop
running = True
while running:
    screen.fill((0, 0, 0))
    draw_map()
    draw_arrows(final_path)  
    
    last = final_path[-1]  
    x = last[1] * tmx_data.tilewidth
    y = last[0] * tmx_data.tileheight

    img = arrow_images.get("item")
    if img:
        img = pygame.transform.scale(img, (tmx_data.tilewidth, tmx_data.tileheight))
        screen.blit(img, (x, y))

    pygame.display.flip()

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

pygame.quit()

# run_visualization(grid, entrance, raw_items, final_path)

