#!/bin/bash
# API 一致性测试脚本
# 测试 Go 后端 (8082) 和 Python 后端 (8083) 的 API 响应是否一致

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

GO_BASE="http://localhost:8082/api/v1"
PYTHON_BASE="http://localhost:8083/api/v1"

# 测试计数器
PASS=0
FAIL=0

# 测试函数
test_api() {
    local name=$1
    local go_url=$2
    local python_url=$3
    local method=${4:-GET}
    local go_data=$5
    local python_data=$6

    echo -e "\n${YELLOW}测试: $name${NC}"
    echo "  Method: $method"
    echo "  Go URL: $go_url"
    echo "  Python URL: $python_url"

    # 调用 Go 后端
    if [ "$method" = "GET" ]; then
        go_response=$(curl -s -X GET "$GO_BASE$go_url" -H "Content-Type: application/json" -w "\n%{http_code}" 2>/dev/null)
    else
        go_response=$(curl -s -X $method "$GO_BASE$go_url" -H "Content-Type: application/json" -d "$go_data" -w "\n%{http_code}" 2>/dev/null)
    fi

    # 调用 Python 后端
    if [ "$method" = "GET" ]; then
        python_response=$(curl -s -X GET "$PYTHON_BASE$python_url" -H "Content-Type: application/json" -w "\n%{http_code}" 2>/dev/null)
    else
        python_response=$(curl -s -X $method "$PYTHON_BASE$python_url" -H "Content-Type: application/json" -d "$python_data" -w "\n%{http_code}" 2>/dev/null)
    fi

    # 提取 HTTP 状态码（最后一行的最后3位）
    go_status=$(echo "$go_response" | tail -c 4)
    python_status=$(echo "$python_response" | tail -c 4)

    # 提取 body（除了最后一行）
    go_body=$(echo "$go_response" | sed '$d')
    python_body=$(echo "$python_response" | sed '$d')

    echo "  Go Status: $go_status"
    echo "  Python Status: $python_status"

    # 比较响应
    if [ "$go_status" = "$python_status" ]; then
        echo -e "  ${GREEN}✓ 状态码一致${NC}"
        ((PASS++))
    else
        echo -e "  ${RED}✗ 状态码不一致${NC}"
        ((FAIL++))
    fi

    # 注意：JSON body 由于 token 值不同，只需要检查结构一致性
    # 排除动态值（token、时间戳等）
    echo "  Go Response (first 200 chars): ${go_body:0:200}"
    echo "  Python Response (first 200 chars): ${python_body:0:200}"
}

echo "=========================================="
echo "API 一致性测试"
echo "=========================================="
echo "Go Backend: $GO_BASE"
echo "Python Backend: $PYTHON_BASE"
echo "=========================================="

# 1. 健康检查
echo -e "\n${YELLOW}=== 1. 健康检查 ===${NC}"
curl -s "$GO_BASE/../health" | head -c 100
echo ""
curl -s "$PYTHON_BASE/../health" | head -c 100
echo ""

# 2. 测试注册 (两边的用户名需要不同)
echo -e "\n${YELLOW}=== 2. 用户注册测试 ===${NC}"
RANDOM_USER="testuser_$(date +%s)"
test_api "用户注册" \
    "/auth/register" "/auth/register" \
    "POST" \
    "{\"username\":\"${RANDOM_USER}\",\"email\":\"${RANDOM_USER}@test.com\",\"password\":\"test123456\"}" \
    "{\"username\":\"${RANDOM_USER}\",\"email\":\"${RANDOM_USER}@test.com\",\"password\":\"test123456\"}"

# 3. 测试登录
echo -e "\n${YELLOW}=== 3. 用户登录测试 ===${NC}"
test_api "用户登录" \
    "/auth/login" "/auth/login" \
    "POST" \
    "{\"username\":\"${RANDOM_USER}\",\"password\":\"test123456\"}" \
    "{\"username\":\"${RANDOM_USER}\",\"password\":\"test123456\"}"

# 4. 测试游客登录
echo -e "\n${YELLOW}=== 4. 游客登录测试 ===${NC}"
test_api "游客登录" \
    "/auth/guest" "/auth/guest" \
    "POST" "{}" "{}"

# 5. 测试获取当前用户 (需要 token，暂时跳过)
# echo -e "\n${YELLOW}=== 5. 获取当前用户 ===${NC}"

echo -e "\n=========================================="
echo "测试结果汇总"
echo "=========================================="
echo -e "${GREEN}通过: $PASS${NC}"
echo -e "${RED}失败: $FAIL${NC}"
echo "=========================================="

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}所有测试通过！${NC}"
    exit 0
else
    echo -e "${RED}部分测试失败，请检查！${NC}"
    exit 1
fi
