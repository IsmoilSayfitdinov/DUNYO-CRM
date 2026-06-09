from math import radians, sin, cos, sqrt, atan2

def distance_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6_371_000 
    dlat, dlng = radians(lat2 - lat1), radians(lng2 - lng1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng/2)**2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))
