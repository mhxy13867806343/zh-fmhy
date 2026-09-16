#!/usr/bin/env bash

# FMHY 定时任务一键配置脚本 (macOS / Linux crontab)
# 作用：配置每日凌晨 04:00 自动运行增量同步并输出日志到 /tmp/fmhy_sync.log

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PYTHON_BIN="$(which python3)"
SYNC_SCRIPT="$PROJECT_DIR/scripts/sync_fmhy.py"
LOG_FILE="/tmp/fmhy_sync.log"

CRON_JOB="0 4 * * * cd $PROJECT_DIR && $PYTHON_BIN $SYNC_SCRIPT >> $LOG_FILE 2>&1"

echo "=================================================="
echo "⏰ 正在为 FMHY 配置系统级定时同步任务..."
echo "项目路径: $PROJECT_DIR"
echo "执行脚本: $SYNC_SCRIPT"
echo "执行频率: 每天凌晨 04:00"
echo "日志输出: $LOG_FILE"
echo "=================================================="

# 检查当前 crontab 是否已有该任务
(crontab -l 2>/dev/null | grep -F "$SYNC_SCRIPT") >/dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "⚠️ 定时任务已经存在于 crontab 中，无需重复添加！"
else
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✅ 定时任务已成功添加至 crontab！"
fi

echo ""
echo "当前系统的 crontab 列表："
crontab -l 2>/dev/null | grep -F "fmhy" || true
echo "=================================================="
