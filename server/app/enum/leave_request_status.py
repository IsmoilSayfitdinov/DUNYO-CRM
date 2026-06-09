import enum

class LeaveRequestStatus(enum.Enum):
    pending = "pending"      # Kutilmoqda
    approved = "approved"    # Tasdiqlangan
    rejected = "rejected"    # Rad etilgan
