import asyncio
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy import select

from app.db.database import engine
from app.model.base import Base
from app.model.user import User
from app.model.leader import Leader
from app.enum.role import Role
from app.core.security import hash_password

from app.core.config import setting


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✓ Jadvallar yaratildi")
    
    SessionMaker = async_sessionmaker(engine, expire_on_commit=False)
    async with SessionMaker() as session:
        existing = await session.scalar(
            select(User).where(User.username == setting.SUPERUSER_USERNAME)
        )
        if existing:
            print(f"✓ Superuser '{setting.SUPERUSER_USERNAME}' allaqachon mavjud")
            return
        
        new_user = User(
            first_name=setting.SUPERUSER_FIRSTNAME,
            last_name=setting.SUPERUSER_LASTNAME,
            phone=setting.SUPERUSER_PHONE,
            username=setting.SUPERUSER_USERNAME,
            password_hash=hash_password(setting.SUPERUSER_PASSWORD),
            role=Role.leader,
            is_active=True
        )
        session.add(new_user)
        await session.flush()

        # Superuser leader-funksiyalardan ham foydalanishi uchun Leader profili
        # ham yaratamiz (dashboard/oylik summasi kabi leader-scoped endpointlar).
        leader_profile = Leader(
            user_id=new_user.id,
        )
        session.add(leader_profile)
        await session.commit()

        # XAVFSIZLIK: parolni log'ga (stdout) chiqarmaymiz.
        print(f"✓ Superuser yaratildi: {setting.SUPERUSER_USERNAME}")


if __name__ == "__main__":
    asyncio.run(init_db())
