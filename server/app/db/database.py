from typing import Annotated
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from fastapi import Depends
from app.core.config import setting

# echo faqat debug rejimida — production'da SQL va parametrlar log'ga chiqmaydi
engine = create_async_engine(setting.DATABASE_URL)
create_new_session = async_sessionmaker(
    engine,
    expire_on_commit=False,
    )

async def get_sessions():
    async with create_new_session() as sessions:
        yield sessions

SessionsDep = Annotated[AsyncSession, Depends(get_sessions)]
