"""
认证服务 - 与 Go 版本的 auth handlers 一致
实现用户注册、登录、游客登录、获取当前用户、更新个人资料、修改密码功能
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from models.user import User
from utils.security import hash_password, verify_password, create_user_token, create_guest_token
from typing import Optional


class AuthService:
    """认证服务类"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(
        self,
        username: str,
        email: str,
        password: str,
        nickname: Optional[str] = None
    ) -> tuple[Optional[User], str]:
        """
        用户注册

        Args:
            username: 用户名 (3-20字符)
            email: 邮箱
            password: 密码 (6-20字符)
            nickname: 昵称 (可选)

        Returns:
            (user, error_message) - 成功时 user 不为 None，失败时 user 为 None
        """
        # 检查用户名是否存在
        result = await self.db.execute(
            select(User).where(User.username == username)
        )
        if result.scalar_one_or_none():
            return None, "用户名已存在"

        # 检查邮箱是否存在
        if email:
            result = await self.db.execute(
                select(User).where(User.email == email)
            )
            if result.scalar_one_or_none():
                return None, "邮箱已被注册"

        # 创建用户
        user = User(
            username=username,
            email=email,
            password=hash_password(password),
            nickname=nickname,
            status="active",
        )

        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        return user, ""

    async def login(self, username: str, password: str) -> tuple[Optional[dict], str]:
        """
        用户登录 - 支持用户名或邮箱登录

        Args:
            username: 用户名或邮箱
            password: 密码

        Returns:
            ({"token": ..., "user": ...}, error_message)
        """
        # 判断是邮箱还是用户名
        if "@" in username:
            result = await self.db.execute(
                select(User).where(User.email == username)
            )
        else:
            result = await self.db.execute(
                select(User).where(User.username == username)
            )
        user = result.scalar_one_or_none()

        if user is None:
            return None, "用户名或密码错误"

        if not verify_password(password, user.password):
            return None, "用户名或密码错误"

        # 生成 Token
        token = create_user_token(user.id, user.username)

        return {
            "token": token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "nickname": user.nickname or "",
                "avatar": user.avatar or "",
            }
        }, ""

    async def guest_login(self) -> tuple[Optional[dict], str]:
        """
        游客登录 - 使用公共账号登录

        Returns:
            ({"token": ..., "user": ..., "is_guest": True}, error_message)
        """
        # 查找游客账号
        result = await self.db.execute(
            select(User).where(User.username == "guest")
        )
        guest = result.scalar_one_or_none()

        if guest is None:
            # 游客账号不存在，创建它
            guest = User(
                username="guest",
                email="guest@poker.app",
                password=hash_password("guest123"),
                nickname="游客",
                status="active",
            )
            self.db.add(guest)
            await self.db.commit()
            await self.db.refresh(guest)

        # 生成 Token
        token = create_guest_token(guest.id)

        return {
            "token": token,
            "user": {
                "id": guest.id,
                "username": guest.username,
                "email": guest.email,
                "nickname": guest.nickname,
                "avatar": guest.avatar,
            },
            "is_guest": True
        }, ""

    async def get_user_by_id(self, user_id: int) -> Optional[User]:
        """根据 ID 获取用户"""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_current_user(self, user_id: int) -> tuple[Optional[dict], str]:
        """
        获取当前用户信息

        Args:
            user_id: 用户 ID (从 JWT token 解析)

        Returns:
            (user_dict, error_message)
        """
        user = await self.get_user_by_id(user_id)
        if user is None:
            return None, "用户不存在"

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "nickname": user.nickname or "",
            "avatar": user.avatar or "",
            "phone": user.phone or "",
            "status": user.status,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }, ""

    async def update_profile(
        self,
        user_id: int,
        nickname: Optional[str] = None,
        avatar: Optional[str] = None,
        phone: Optional[str] = None
    ) -> tuple[Optional[dict], str]:
        """
        更新个人资料

        Args:
            user_id: 用户 ID
            nickname: 昵称 (可选)
            avatar: 头像 URL (可选)
            phone: 电话号码 (可选)

        Returns:
            (user_dict, error_message)
        """
        user = await self.get_user_by_id(user_id)
        if user is None:
            return None, "用户不存在"

        if nickname is not None and nickname != "":
            user.nickname = nickname
        if avatar is not None and avatar != "":
            user.avatar = avatar
        if phone is not None and phone != "":
            user.phone = phone

        await self.db.commit()
        await self.db.refresh(user)

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "nickname": user.nickname,
            "avatar": user.avatar,
            "phone": user.phone,
        }, ""

    async def change_password(
        self,
        user_id: int,
        old_password: str,
        new_password: str
    ) -> tuple[bool, str]:
        """
        修改密码

        Args:
            user_id: 用户 ID
            old_password: 旧密码
            new_password: 新密码 (6-20字符)

        Returns:
            (success, error_message)
        """
        user = await self.get_user_by_id(user_id)
        if user is None:
            return False, "用户不存在"

        if not verify_password(old_password, user.password):
            return False, "旧密码错误"

        user.password = hash_password(new_password)
        await self.db.commit()

        return True, ""
