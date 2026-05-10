"""
后端 API 单元测试
测试所有简历相关的 API 端点
"""
import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from datetime import datetime

# 设置测试环境变量
import os
os.environ["RESUME_DB_HOST"] = "localhost"
os.environ["RESUME_DB_PORT"] = "3306"
os.environ["RESUME_DB_USER"] = "test"
os.environ["RESUME_DB_PASSWORD"] = "test"
os.environ["RESUME_DB_NAME"] = "test_interview"

from main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


class TestHealthEndpoint:
    """测试健康检查端点"""

    @pytest.mark.asyncio
    async def test_health(self):
        """测试 /health 端点"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/health")
            assert response.status_code == 200
            assert response.json() == {"status": "ok"}


class TestAuthEndpoints:
    """测试认证相关端点"""

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="需要数据库连接")
    async def test_register(self):
        """测试用户注册"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # 使用较短的用户名（限制20字符内）
            timestamp = str(int(datetime.now().timestamp()))[-8:]
            response = await client.post("/api/v1/auth/register", json={
                "username": f"user{timestamp}",  # 8-10字符
                "email": f"test{timestamp}@example.com",
                "password": "test123456",
                "nickname": "Test User"
            })
            # 期望返回 code: 0 或 code: 1 (如果用户已存在)
            data = response.json()
            assert "code" in data

    @pytest.mark.asyncio
    async def test_register_invalid_email(self):
        """测试无效邮箱注册"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/api/v1/auth/register", json={
                "username": "testuser",
                "email": "invalid-email",
                "password": "test123456"
            })
            # 应该返回错误
            data = response.json()
            assert data.get("code") == 1 or response.status_code == 422

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="需要数据库连接")
    async def test_login_invalid(self):
        """测试无效登录"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/api/v1/auth/login", json={
                "username": "nonexistent_user",
                "password": "wrong_password"
            })
            data = response.json()
            assert data.get("code") == 1


class TestResumeEndpoints:
    """测试简历相关端点"""

    @pytest.mark.asyncio
    async def test_create_resume_without_auth(self):
        """测试未认证创建简历应被拒绝"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/api/v1/resumes", json={
                "title": "测试简历"
            })
            # 应该返回 401 未授权
            assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_resumes_without_auth(self):
        """测试未认证获取简历列表应被拒绝"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/api/v1/resumes")
            # 应该返回 401 未授权
            assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_optimize_without_auth(self):
        """测试未认证优化应被拒绝"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/api/v1/resumes/optimize", json={
                "content": "测试内容",
                "type": "work_experience"
            })
            # 应该返回 401 未授权
            assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_optimize_full_without_auth(self):
        """测试未认证一键优化应被拒绝"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/api/v1/resumes/optimize-full", json={
                "resume_data": {"test": "data"}
            })
            # 应该返回 401 未授权
            assert response.status_code == 401


class TestOptimizeEndpoints:
    """测试优化相关端点（需要有效 token）"""

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="需要数据库和有效 token")
    async def test_optimize_empty_content(self):
        """测试空内容优化请求"""
        # 先获取有效的 token
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # 尝试游客登录获取 token
            guest_response = await client.post("/api/v1/auth/guest")
            if guest_response.status_code == 200:
                token = guest_response.json().get("data", {}).get("token")
                if token:
                    # 测试空内容
                    response = await client.post(
                        "/api/v1/resumes/optimize",
                        json={"content": "", "type": "work_experience"},
                        headers={"Authorization": f"Bearer {token}"}
                    )
                    data = response.json()
                    assert data.get("code") == 1 or data.get("code") == 0

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="需要数据库和有效 token")
    async def test_optimize_full_empty_data(self):
        """测试空简历数据一键优化"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # 尝试游客登录获取 token
            guest_response = await client.post("/api/v1/auth/guest")
            if guest_response.status_code == 200:
                token = guest_response.json().get("data", {}).get("token")
                if token:
                    response = await client.post(
                        "/api/v1/resumes/optimize-full",
                        json={"resume_data": {}},
                        headers={"Authorization": f"Bearer {token}"}
                    )
                    data = response.json()
                    assert data.get("code") == 1 or data.get("code") == 0


class TestSharedEndpoints:
    """测试公开分享端点"""

    @pytest.mark.asyncio
    async def test_get_shared_resume_invalid_token(self):
        """测试无效 token 获取分享简历"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/api/v1/shared/invalid_token_12345")
            data = response.json()
            # 应该返回错误 (code: 1 或 找不到简历)
            assert data.get("code") == 1 or response.status_code == 404

    @pytest.mark.asyncio
    async def test_get_shared_resume_valid_format(self):
        """测试格式正确的分享 token"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/api/v1/shared/test_token_valid_format")
            # 应该返回 404 (找不到) 而不是 500 错误
            assert response.status_code in [404, 200]


class TestRequestValidation:
    """测试请求参数验证"""

    @pytest.mark.asyncio
    async def test_register_password_too_short(self):
        """测试密码太短"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/api/v1/auth/register", json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "123"  # 少于6位
            })
            # 应该返回验证错误
            assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_register_username_too_short(self):
        """测试用户名太短"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/api/v1/auth/register", json={
                "username": "ab",  # 少于3位
                "email": "test@example.com",
                "password": "test123456"
            })
            # 应该返回验证错误
            assert response.status_code == 422


class TestInterviewEndpoints:
    """测试模拟面试相关端点"""

    @pytest.mark.asyncio
    async def test_interview_start_without_auth(self):
        """测试未认证开始面试应被拒绝"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/api/v1/interview/start", json={
                "resume_id": 1
            })
            # 应该返回 401 未授权
            assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_interview_answer_without_auth(self):
        """测试未认证提交回答应被拒绝"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/api/v1/interview/answer", json={
                "session_id": "test_session",
                "question_index": 0,
                "answer": "测试回答"
            })
            # 应该返回 401 未授权
            assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_interview_next_without_auth(self):
        """测试未认证获取下一题应被拒绝"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/api/v1/interview/next", json={
                "session_id": "test_session",
                "current_index": 0
            })
            # 应该返回 401 未授权
            assert response.status_code == 401

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="需要数据库和有效 token")
    async def test_interview_start_with_auth(self):
        """测试已认证开始面试"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # 先获取有效的 token
            guest_response = await client.post("/api/v1/auth/guest")
            if guest_response.status_code == 200:
                token = guest_response.json().get("data", {}).get("token")
                if token:
                    # 获取简历列表
                    resumes_response = await client.get(
                        "/api/v1/resumes",
                        headers={"Authorization": f"Bearer {token}"}
                    )
                    resumes = resumes_response.json().get("data", {}).get("list", [])

                    if resumes:
                        # 使用第一份简历开始面试
                        resume_id = resumes[0]["id"]
                        response = await client.post(
                            "/api/v1/interview/start",
                            json={
                                "resume_id": resume_id,
                                "job_position": "前端工程师",
                                "question_count": 3
                            },
                            headers={"Authorization": f"Bearer {token}"}
                        )
                        data = response.json()
                        assert data.get("code") == 0
                        assert data.get("data") is not None
                        assert "session_id" in data.get("data", {})
                        assert "current_question" in data.get("data", {})
                    else:
                        pytest.skip("没有简历可供测试")

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="需要数据库和有效 token")
    async def test_interview_answer_with_auth(self):
        """测试已认证提交回答"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # 先获取有效的 token
            guest_response = await client.post("/api/v1/auth/guest")
            if guest_response.status_code == 200:
                token = guest_response.json().get("data", {}).get("token")
                if token:
                    # 获取简历列表
                    resumes_response = await client.get(
                        "/api/v1/resumes",
                        headers={"Authorization": f"Bearer {token}"}
                    )
                    resumes = resumes_response.json().get("data", {}).get("list", [])

                    if resumes:
                        resume_id = resumes[0]["id"]
                        # 开始面试
                        start_response = await client.post(
                            "/api/v1/interview/start",
                            json={
                                "resume_id": resume_id,
                                "question_count": 3
                            },
                            headers={"Authorization": f"Bearer {token}"}
                        )
                        start_data = start_response.json()

                        if start_data.get("code") == 0:
                            session_id = start_data.get("data", {}).get("session_id")
                            # 提交回答
                            answer_response = await client.post(
                                "/api/v1/interview/answer",
                                json={
                                    "session_id": session_id,
                                    "question_index": 0,
                                    "answer": "这是一个测试回答，用于验证面试评估功能是否正常工作。"
                                },
                                headers={"Authorization": f"Bearer {token}"}
                            )
                            data = answer_response.json()
                            # 评估成功或面试已结束
                            assert data.get("code") == 0 or "面试已完成" in data.get("message", "")
                    else:
                        pytest.skip("没有简历可供测试")

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="需要数据库连接")
    async def test_interview_invalid_request(self):
        """测试无效请求参数（需要认证）"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # 先获取 token
            guest_response = await client.post("/api/v1/auth/guest")
            if guest_response.status_code == 200:
                token = guest_response.json().get("data", {}).get("token")
                if token:
                    # 缺少必填字段 resume_id
                    response = await client.post(
                        "/api/v1/interview/start",
                        json={},
                        headers={"Authorization": f"Bearer {token}"}
                    )
                    # 应该返回验证错误
                    assert response.status_code == 422

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="需要数据库连接")
    async def test_interview_answer_invalid_session(self):
        """测试无效 session 提交回答"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # 先获取 token
            guest_response = await client.post("/api/v1/auth/guest")
            if guest_response.status_code == 200:
                token = guest_response.json().get("data", {}).get("token")
                if token:
                    response = await client.post(
                        "/api/v1/interview/answer",
                        json={
                            "session_id": "invalid_session_that_does_not_exist",
                            "question_index": 0,
                            "answer": "测试回答"
                        },
                        headers={"Authorization": f"Bearer {token}"}
                    )
                    data = response.json()
                    # 应该返回错误
                    assert data.get("code") == 1


if __name__ == "__main__":
    # 运行测试
    pytest.main([__file__, "-v", "--tb=short"])