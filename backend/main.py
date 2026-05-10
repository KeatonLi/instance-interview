"""
简历大师 - Python 后端
FastAPI 入口
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import auth, resume, shared, interview


app = FastAPI(
    title="简历大师 API",
    description="智能简历助手后端 API",
    version="1.0.0"
)

# CORS 配置（与 Go 版本一致）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(shared.router)
app.include_router(interview.router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.RESUME_PORT,
        reload=True
    )
