def compute_attendance_score(total: int, present: int, on_time: int) -> int:
    """Davomat reytingi (0-100): kelish darajasi 60% + o'z vaqtida kelish 40%."""
    if not total:
        return 0
    attendance_rate = present / total
    punctuality = on_time / present if present else 0
    return round((attendance_rate * 0.6 + punctuality * 0.4) * 100)
