from heapq import heappop, heappush
import pygame
import sys
import os
os.environ["SDL_VIDEODRIVER"] = "dummy"
import pygame
pygame.init()
pygame.display.set_mode((1, 1))
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

tmx_data = load_pygame("data/map.tmx")  

def generate_path(raw_items):
    
    items = []
    for x, y in raw_items:
        pickup = (x + 1, y)
        if 0 <= pickup[0] < ROWS and grid[pickup[0]][pickup[1]] == 0:
            items.append(pickup)

    points = [entrance] + items

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

    return final_path, set(items) 





