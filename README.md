# AI Task Manager

AI 目标拆解任务管理器：用户用自然语言描述目标，由 AI 生成可执行任务草案，确认后再保存到本地数据库。

本项目同时用于练习 AI 辅助软件开发工作流（规划、实现、测试、Code Review、Git）。

## 当前能力

- 手动创建、查看、更新状态、删除任务
- AI 目标规划闭环：
  1. 输入 goal
  2. `POST /api/ai/plan` 生成并校验任务草案（不写库）
  3. 前端预览草案
  4. 用户确认后 `POST /api/goals` 在事务中保存 goal 与关联 tasks
- Goal 列表与详情：查看各目标完成进度，进入目标内管理任务
- Goal-first 工作台：Dashboard、AI 全屏创建流、收集箱、任务三态与删除

## 技术栈

- 前端：React + Vite
- 后端：Node.js + Express
- 数据库：SQLite

## 项目结构

```text
.
├── backend/          # Express API + SQLite
├── frontend/         # React UI
├── docs/             # 产品与架构文档
├── AI_Task_Manager_Project_Status.md
├── README.md
└── AGENTS.md
```

## 数据模型（摘要）

### goals

| 字段 | 说明 |
|---|---|
| id | 主键 |
| title | 目标标题 |
| description | 目标描述（可空） |
| status | 默认 `active` |
| created_at / updated_at | 时间戳 |

### tasks

| 字段 | 说明 |
|---|---|
| id | 主键 |
| goal_id | 关联 goal（可空，手动任务为 null） |
| title / description / status | 任务基本信息 |
| priority | `low` / `medium` / `high`（可空） |
| estimated_minutes | 预估分钟数（可空） |
| created_at / updated_at | 时间戳 |

## 主要 API

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/tasks` | 获取任务列表 |
| POST | `/api/tasks` | 手动创建任务 |
| PUT | `/api/tasks/:id` | 更新任务状态 |
| DELETE | `/api/tasks/:id` | 删除任务 |
| GET | `/api/goals` | 获取目标列表（含完成统计） |
| GET | `/api/goals/:id` | 获取单个目标详情与关联任务 |
| POST | `/api/ai/plan` | 生成 AI 任务草案（不写库） |
| POST | `/api/goals` | 确认保存 goal + tasks（事务） |
| POST | `/api/ai/generate` | 已废弃，返回 410 |

## 本地开发

### 1. 环境变量

在 `backend/.env` 中配置：

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
PORT=3000
```

### 2. 启动后端

```bash
cd backend && npm run dev
```

（首次运行前在 `backend/` 目录执行 `npm install`。）

服务启动时会自动执行幂等数据库迁移。

### 3. 启动前端

默认方式：

```bash
cd frontend
npm install
npm run dev
```

在 **Windows + 本地 PAC/代理** 环境下，Vite 默认 `localhost` 监听可能导致浏览器无法访问。推荐使用 IPv4 监听：

```bash
cd frontend && npm run dev:ipv4
```

然后在浏览器打开：**http://127.0.0.1:5173**

说明：这是本地 PAC/代理环境下的兼容启动方式，不影响 API 地址（后端仍为 `http://localhost:3000`）。

### 4. 使用流程（Goal-first）

1. 打开 **Goal Dashboard**，查看已保存目标与进度
2. 点击 **新建目标（AI）** → 生成草案（显著标注「尚未保存」）→ **Confirm Save**
3. 保存成功后自动进入 Goal 详情；可在目标内新增任务、切换 Todo / Doing / Done、删除任务
4. **收集箱** 单独管理 `goal_id = null` 的手动任务
5. Goal 详情支持 URL 直达：`?goalId=<id>`（无效或不存在时回 Dashboard 并提示）

AI 方案说明：

- `estimatedMinutes` 表示**完成单次任务所需的实际投入分钟数**（1–480 整数），不是睡眠/等待/多天累计时长
- 若 AI 返回不合规方案，前端显示友好提示「AI 生成的方案格式异常，尚未保存。请点击重新生成。」，不会写入数据库

### 5. 运行测试

```bash
cd backend
npm test
```

## 尚未实现

以下能力**尚未完成**，不要当作现有功能使用：

- Goal 编辑 / 删除
- 任务标题/描述编辑（当前支持状态更新与删除）
- 用户认证
- AI Memory / 复杂 Agent 编排
- 分页、搜索、筛选

## 文档

- [docs/product.md](docs/product.md)
- [docs/architecture.md](docs/architecture.md)
- [docs/tasks.md](docs/tasks.md)
- [AI_Task_Manager_Project_Status.md](AI_Task_Manager_Project_Status.md)
