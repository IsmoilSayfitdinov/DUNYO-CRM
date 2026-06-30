from sqlalchemy.orm import Mapped, mapped_column

from app.model.base import Base


class AppMeta(Base):
    """Ilova darajasidagi kichik key-value holat (bitta-ikkita qator).

    Hozircha faqat bitta narsa uchun: "last_pushed_version" — eng so'nggi marta
    xodimlarga 'Yangilanish keldi' push yuborilgan APP_VERSION. Server ishga
    tushganda joriy APP_VERSION shunga teng bo'lmasa — yangi deploy bo'lgan,
    push yuboriladi va bu qiymat yangilanadi.
    """

    __tablename__ = "app_meta"

    # key unikal — bir kalit bir marta. (id Base'dan keladi, lekin key bo'yicha qidiramiz.)
    key: Mapped[str] = mapped_column(unique=True, index=True)
    value: Mapped[str]
