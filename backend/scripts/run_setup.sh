#!/bin/bash
set -e
cd "$(dirname "$0")/.."

echo ">>> 安装 Python 依赖..."
python3 -m venv .venv 2>/dev/null || true
source .venv/bin/activate
pip install -q -r requirements.txt

echo ""
echo ">>> 开始交互式配置（按提示粘贴 Supabase 信息）..."
python3 scripts/setup_all.py
