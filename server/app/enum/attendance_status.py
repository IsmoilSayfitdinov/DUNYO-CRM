import enum

class AttendanceStatus(enum.Enum):
    came = 'came'        # keldi (o'z vaqtida)
    left = 'left'        # ishni yakunladi (check-out qilingan)
    absent = 'absent'    # kelmadi (sababsiz) — pulsiz
    reason = 'reason'    # sababli kelmadi — max 2 kun pul to'lanadi
    leave = 'leave'      # ta'tilda (tasdiqlangan) — pulsiz
    late = "late"        # kechikib keldi
