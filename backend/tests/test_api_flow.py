"""
API 完整流程测试脚本
测试所有简历相关 API 端点的完整流程

使用方法:
    python test_api_flow.py

测试服务器: http://111.231.107.210:8082
"""
import requests
import json
import time
from datetime import datetime

# 配置
BASE_URL = "http://111.231.107.210:8082"
API_BASE = f"{BASE_URL}/api/v1"

# 颜色输出
GREEN = '\033[0;32m'
RED = '\033[0;31m'
YELLOW = '\033[1;33m'
BLUE = '\033[0;34m'
NC = '\033[0m'  # No Color


def log_info(msg):
    print(f"{BLUE}[INFO]{NC} {msg}")


def log_success(msg):
    print(f"{GREEN}[SUCCESS]{NC} {msg}")


def log_error(msg):
    print(f"{RED}[ERROR]{NC} {msg}")


def log_warn(msg):
    print(f"{YELLOW}[WARN]{NC} {msg}")


class APITester:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.test_username = None
        self.test_email = None
        self.resume_id = None
        self.share_token = None

    def request(self, method, path, **kwargs):
        """发送请求的封装方法"""
        url = f"{API_BASE}{path}"
        headers = kwargs.pop('headers', {})

        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        response = self.session.request(method, url, headers=headers, **kwargs)

        # 打印请求信息
        print(f"\n{'='*60}")
        print(f"{method} {url}")
        if headers.get('Authorization'):
            print(f"Authorization: Bearer ***")
        if kwargs.get('json'):
            print(f"Body: {json.dumps(kwargs['json'], ensure_ascii=False)[:200]}")

        # 打印响应
        print(f"\nStatus: {response.status_code}")
        try:
            resp_json = response.json()
            print(f"Response: {json.dumps(resp_json, ensure_ascii=False)[:300]}")
            return resp_json
        except:
            print(f"Response: {response.text[:200]}")
            return None

    # ========== 认证接口测试 ==========

    def test_health(self):
        """测试健康检查"""
        log_info("测试健康检查接口...")
        # 健康检查不在 /api/v1 下，直接请求根路径
        url = f"{BASE_URL}/health"
        response = self.session.get(url)

        print(f"\n{'='*60}")
        print(f"GET {url}")
        print(f"\nStatus: {response.status_code}")
        try:
            resp_json = response.json()
            print(f"Response: {json.dumps(resp_json, ensure_ascii=False)}")
        except:
            print(f"Response: {response.text[:200]}")

        if response.status_code == 200:
            log_success("健康检查通过")
            return True
        log_error("健康检查失败")
        return False

    def test_guest_login(self):
        """测试游客登录"""
        log_info("测试游客登录...")
        response = self.request('POST', '/auth/guest')
        if response and response.get('code') == 0 and response.get('data', {}).get('token'):
            self.token = response['data']['token']
            log_success(f"游客登录成功，获取 token")
            return True
        log_error("游客登录失败")
        return False

    def test_register(self):
        """测试用户注册"""
        log_info("测试用户注册...")
        timestamp = int(time.time())
        self.test_username = f"testuser{timestamp}"
        self.test_email = f"test{timestamp}@example.com"

        response = self.request('POST', '/auth/register', json={
            "username": self.test_username,
            "email": self.test_email,
            "password": "test123456",
            "nickname": "测试用户"
        })

        if response and response.get('code') == 0:
            log_success(f"注册成功: {self.test_username}")
            return True
        # 如果用户已存在，也算成功
        if response and response.get('code') == 1 and '已存在' in str(response.get('message', '')):
            log_warn("用户已存在，跳过注册")
            return True
        log_error(f"注册失败: {response}")
        return False

    def test_login(self):
        """测试登录"""
        log_info("测试登录...")
        response = self.request('POST', '/auth/login', json={
            "username": self.test_username,
            "password": "test123456"
        })

        if response and response.get('code') == 0 and response.get('data', {}).get('token'):
            self.token = response['data']['token']
            log_success("登录成功")
            return True
        log_error(f"登录失败: {response}")
        return False

    def test_get_me(self):
        """测试获取当前用户信息"""
        log_info("测试获取当前用户信息...")
        response = self.request('GET', '/auth/me')

        if response and response.get('code') == 0:
            user_data = response.get('data', {})
            log_success(f"获取用户信息成功: {user_data.get('username')}")
            return True
        log_error(f"获取用户信息失败: {response}")
        return False

    def test_update_profile(self):
        """测试更新用户资料"""
        log_info("测试更新用户资料...")
        response = self.request('PUT', '/auth/profile', json={
            "nickname": f"更新后的用户_{int(time.time())}"
        })

        if response and response.get('code') == 0:
            log_success("更新资料成功")
            return True
        log_error(f"更新资料失败: {response}")
        return False

    # ========== 简历接口测试 ==========

    def test_create_resume(self):
        """测试创建简历"""
        log_info("测试创建简历...")
        response = self.request('POST', '/resumes', json={
            "title": f"测试简历_{int(time.time())}",
            "theme_id": 0
        })

        if response and response.get('code') == 0 and response.get('data', {}).get('id'):
            self.resume_id = response['data']['id']
            log_success(f"创建简历成功，ID: {self.resume_id}")
            return True
        log_error(f"创建简历失败: {response}")
        return False

    def test_get_resumes(self):
        """测试获取简历列表"""
        log_info("测试获取简历列表...")
        response = self.request('GET', '/resumes')

        if response and response.get('code') == 0:
            resumes = response.get('data', {}).get('list', [])
            log_success(f"获取简历列表成功，共 {len(resumes)} 份简历")
            if resumes and not self.resume_id:
                self.resume_id = resumes[0]['id']
            return True
        log_error(f"获取简历列表失败: {response}")
        return False

    def test_get_resume(self):
        """测试获取单个简历"""
        if not self.resume_id:
            log_warn("没有简历ID，跳过获取单个简历测试")
            return True

        log_info(f"测试获取简历详情，ID: {self.resume_id}...")
        response = self.request('GET', f'/resumes/{self.resume_id}')

        if response and response.get('code') == 0:
            log_success("获取简历详情成功")
            return True
        log_error(f"获取简历详情失败: {response}")
        return False

    def test_update_resume(self):
        """测试更新简历"""
        if not self.resume_id:
            log_warn("没有简历ID，跳过更新简历测试")
            return True

        log_info(f"测试更新简历，ID: {self.resume_id}...")
        response = self.request('PUT', f'/resumes/{self.resume_id}', json={
            "title": f"更新后的简历_{int(time.time())}",
            "resume_data": {
                "personalInfo": {
                    "name": "测试用户",
                    "title": "前端工程师",
                    "email": "test@example.com",
                    "phone": "13800138000"
                },
                "workExperience": [],
                "projects": [],
                "education": [],
                "skills": []
            }
        })

        if response and response.get('code') == 0:
            log_success("更新简历成功")
            return True
        log_error(f"更新简历失败: {response}")
        return False

    def test_share_resume(self):
        """测试分享简历"""
        if not self.resume_id:
            log_warn("没有简历ID，跳过分享简历测试")
            return True

        log_info(f"测试分享简历，ID: {self.resume_id}...")
        response = self.request('POST', f'/resumes/{self.resume_id}/share')

        if response and response.get('code') == 0:
            self.share_token = response.get('data', {}).get('share_token')
            log_success(f"分享简历成功，Token: {self.share_token}")
            return True
        log_error(f"分享简历失败: {response}")
        return False

    def test_get_shared_resume(self):
        """测试获取分享的简历"""
        if not self.share_token:
            log_warn("没有分享Token，跳过获取分享简历测试")
            return True

        log_info(f"测试获取分享简历，Token: {self.share_token}...")
        # 这个接口不需要认证
        url = f"{API_BASE}/shared/{self.share_token}"
        response = self.session.get(url)

        print(f"\n{'='*60}")
        print(f"GET {url}")
        print(f"\nStatus: {response.status_code}")
        try:
            resp_json = response.json()
            print(f"Response: {json.dumps(resp_json, ensure_ascii=False)[:300]}")
        except:
            print(f"Response: {response.text[:200]}")

        if response.status_code == 200:
            log_success("获取分享简历成功")
            return True
        log_error(f"获取分享简历失败: {response.status_code}")
        return False

    def test_disable_share(self):
        """测试取消分享"""
        if not self.resume_id:
            log_warn("没有简历ID，跳过取消分享测试")
            return True

        log_info(f"测试取消分享简历，ID: {self.resume_id}...")
        response = self.request('DELETE', f'/resumes/{self.resume_id}/share')

        if response and response.get('code') == 0:
            log_success("取消分享成功")
            return True
        log_error(f"取消分享失败: {response}")
        return False

    def test_delete_resume(self):
        """测试删除简历"""
        if not self.resume_id:
            log_warn("没有简历ID，跳过删除简历测试")
            return True

        log_info(f"测试删除简历，ID: {self.resume_id}...")
        response = self.request('DELETE', f'/resumes/{self.resume_id}')

        if response and response.get('code') == 0:
            log_success("删除简历成功")
            self.resume_id = None  # 标记已删除
            return True
        log_error(f"删除简历失败: {response}")
        return False

    # ========== PDF 相关测试 ==========

    def test_pdf_export(self):
        """测试 PDF 导出（后端实现）"""
        log_info("测试 PDF 导出...")
        resp = self.session.get(
            f"{API_BASE}/resumes/{self.resume_id}/export-pdf",
            headers={'Authorization': f'Bearer {self.token}'}
        )
        print(f"\n{'='*60}")
        print(f"GET {API_BASE}/resumes/{self.resume_id}/export-pdf")
        print(f"Authorization: Bearer ***")
        print(f"\nStatus: {resp.status_code}")
        print(f"Content-Type: {resp.headers.get('Content-Type', 'unknown')}")
        print(f"Content-Length: {len(resp.content)} bytes")
        if resp.status_code == 200:
            log_success(f"PDF 导出成功，大小 {len(resp.content)} 字节")
            if resp.content[:4] == b'%PDF':
                log_success("PDF 文件格式正确")
                return True
            else:
                log_error("PDF 文件格式错误")
                return False
        else:
            log_error(f"PDF 导出失败")
            try:
                print(f"Response: {resp.json()}")
            except:
                print(f"Response: {resp.text[:200]}")
            return False

    # ========== 优化接口测试 ==========

    def test_optimize_content(self):
        """测试单条内容优化"""
        log_info("测试单条内容优化...")
        response = self.request('POST', '/resumes/optimize', json={
            "content": "负责公司官网开发，使用Vue完成前端页面",
            "type": "work_experience",
            "optimize_type": "all"
        })

        if response and response.get('code') == 0:
            log_success("内容优化成功")
            return True
        log_error(f"内容优化失败: {response}")
        return False

    def test_optimize_full(self):
        """测试一键优化"""
        log_info("测试一键优化...")
        response = self.request('POST', '/resumes/optimize-full', json={
            "resume_data": {
                "personalInfo": {
                    "name": "张三",
                    "title": "前端工程师"
                },
                "workExperience": [
                    {
                        "company": "ABC公司",
                        "position": "前端开发",
                        "description": "负责前端开发"
                    }
                ],
                "projects": [],
                "education": [],
                "skills": []
            }
        })

        if response and response.get('code') == 0:
            log_success("一键优化成功")
            return True
        log_error(f"一键优化失败: {response}")
        return False

    # ========== 面试接口测试 ==========

    def test_interview_start(self):
        """测试开始面试"""
        if not self.resume_id:
            log_warn("没有简历ID，跳过面试测试")
            return True

        log_info(f"测试开始面试，简历ID: {self.resume_id}...")
        response = self.request('POST', '/interview/start', json={
            "resume_id": self.resume_id,
            "job_position": "前端工程师",
            "question_count": 3
        })

        if response and response.get('code') == 0:
            session_id = response.get('data', {}).get('session_id')
            log_success(f"开始面试成功，Session ID: {session_id}")
            return session_id
        log_warn(f"开始面试失败（可能是AI服务不可用）: {response}")
        return None

    def test_interview_answer(self, session_id):
        """测试提交面试回答"""
        if not session_id:
            log_warn("没有session ID，跳过回答测试")
            return True

        log_info(f"测试提交面试回答，Session ID: {session_id}...")
        response = self.request('POST', '/interview/answer', json={
            "session_id": session_id,
            "question_index": 0,
            "answer": "这是一个测试回答，用于验证面试功能是否正常工作。"
        })

        if response and response.get('code') == 0:
            log_success("提交回答成功")
            return True
        log_warn(f"提交回答失败: {response}")
        return True  # 不阻塞流程

    def test_interview_next(self, session_id):
        """测试获取下一题"""
        if not session_id:
            log_warn("没有session ID，跳过下一题测试")
            return True

        log_info(f"测试获取下一题，Session ID: {session_id}...")
        response = self.request('POST', '/interview/next', json={
            "session_id": session_id,
            "current_index": 0
        })

        if response and response.get('code') == 0:
            log_success("获取下一题成功")
            return True
        log_warn(f"获取下一题失败: {response}")
        return True

    def test_interview_report(self, session_id):
        """测试获取面试报告"""
        if not session_id:
            log_warn("没有session ID，跳过报告测试")
            return True

        log_info(f"测试获取面试报告，Session ID: {session_id}...")
        response = self.request('GET', f'/interview/report/{session_id}')

        if response and response.get('code') == 0:
            log_success("获取面试报告成功")
            return True
        log_warn(f"获取面试报告失败: {response}")
        return True

    # ========== 运行完整测试流程 ==========

    def run_full_test(self):
        """运行完整测试流程"""
        print("\n" + "="*60)
        print("🚀 开始 API 完整流程测试")
        print("="*60)
        print(f"测试服务器: {BASE_URL}")
        print(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        results = []

        # 1. 健康检查
        results.append(("健康检查", self.test_health()))

        # 2. 游客登录（获取token）
        results.append(("游客登录", self.test_guest_login()))

        # 3. 获取当前用户
        results.append(("获取当前用户", self.test_get_me()))

        # 4. 用户注册
        results.append(("用户注册", self.test_register()))

        # 5. 登录
        results.append(("用户登录", self.test_login()))

        # 6. 再次获取用户信息
        results.append(("获取用户信息", self.test_get_me()))

        # 7. 更新资料
        results.append(("更新资料", self.test_update_profile()))

        # 8. 创建简历
        results.append(("创建简历", self.test_create_resume()))

        # 9. 获取简历列表
        results.append(("获取简历列表", self.test_get_resumes()))

        # 10. 获取单个简历
        results.append(("获取简历详情", self.test_get_resume()))

        # 11. 更新简历
        results.append(("更新简历", self.test_update_resume()))

        # 12. PDF 导出
        results.append(("PDF导出", self.test_pdf_export()))

        # 13. 分享简历
        results.append(("分享简历", self.test_share_resume()))

        # 14. 获取分享简历
        results.append(("获取分享简历", self.test_get_shared_resume()))

        # 15. 取消分享
        results.append(("取消分享", self.test_disable_share()))

        # 16. 内容优化
        results.append(("内容优化", self.test_optimize_content()))

        # 17. 一键优化
        results.append(("一键优化", self.test_optimize_full()))

        # 18. 开始面试
        session_id = self.test_interview_start()
        results.append(("开始面试", session_id is not None))

        # 19. 提交回答
        if session_id:
            self.test_interview_answer(session_id)
            self.test_interview_next(session_id)
            self.test_interview_report(session_id)

        # 20. 删除简历
        results.append(("删除简历", self.test_delete_resume()))

        # 打印测试结果汇总
        print("\n" + "="*60)
        print("📊 测试结果汇总")
        print("="*60)

        passed = 0
        failed = 0
        for name, result in results:
            status = f"{GREEN}✓{NC}" if result else f"{RED}✗{NC}"
            print(f"  {status} {name}")
            if result:
                passed += 1
            else:
                failed += 1

        print(f"\n总测试数: {len(results)}")
        print(f"{GREEN}通过: {passed}{NC}")
        print(f"{RED}失败: {failed}{NC}")

        if failed == 0:
            print(f"\n{GREEN}🎉 所有测试通过！{NC}")
        else:
            print(f"\n{YELLOW}⚠️  有 {failed} 项测试失败{NC}")

        return failed == 0


def main():
    tester = APITester()
    success = tester.run_full_test()
    exit(0 if success else 1)


if __name__ == "__main__":
    main()
