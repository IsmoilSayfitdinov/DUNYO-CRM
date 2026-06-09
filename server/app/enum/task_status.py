import enum


class TaskStatus(enum.Enum):
    todo = "todo"                # Bajarilmagan
    in_progress = "in_progress"  # Jarayonda
    done = "done"                # Bajarilgan
