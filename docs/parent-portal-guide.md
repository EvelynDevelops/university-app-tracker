# 家长门户使用指南

## 概述

家长门户允许家长监控孩子的大学申请进度，查看申请详情，并与孩子进行沟通。

## 主要功能

### 1. 家长仪表板 (`/parent/dashboard`)
- **学生概览**: 显示所有关联学生的基本信息
- **申请统计**: 显示所有学生的申请进度统计
- **快速访问**: 点击学生卡片查看详细申请列表

### 2. 学生申请列表 (`/parent/students/[studentId]/applications`)
- **申请概览**: 显示特定学生的所有申请
- **状态跟踪**: 实时查看申请状态变化
- **截止日期提醒**: 突出显示即将到期的申请

### 3. 申请详情页面 (`/parent/students/[studentId]/applications/[id]`)
- **只读视图**: 查看申请的所有详细信息
- **状态信息**: 申请状态、类型、截止日期等
- **学生笔记**: 查看学生添加的笔记
- **发送通知**: 向学生发送消息和提醒

### 4. 通知系统
- **通知铃铛**: 右上角显示未读通知数量
- **消息预览**: 悬停查看最新通知
- **学生回复**: 查看学生对家长消息的回复

## 权限说明

### 家长权限
- ✅ 查看关联学生的所有申请
- ✅ 查看申请详情和进度
- ✅ 向学生发送消息和提醒
- ✅ 查看学生笔记和状态更新
- ❌ 无法修改申请信息
- ❌ 无法编辑学生资料

### 数据访问
- 只能查看通过 `parent_links` 表关联的学生数据
- 所有操作都有权限验证，确保数据安全

## 使用流程

### 1. 注册和登录
1. 访问注册页面，选择"Parent"角色
2. 填写个人信息并创建账户
3. 登录后自动跳转到家长引导页面

### 2. 关联学生账户
1. 在引导页面输入孩子的学生账户邮箱
2. 系统搜索并显示找到的学生账户
3. 点击"Link Account"关联账户
4. 关联成功后自动跳转到家长仪表板

### 3. 查看学生进度
1. 在仪表板查看所有关联学生
2. 点击学生卡片进入申请列表
3. 查看申请统计和状态分布

### 4. 监控申请详情
1. 点击具体申请查看详细信息
2. 查看申请状态、截止日期、大学信息
3. 阅读学生添加的笔记

### 5. 与学生沟通
1. 在申请详情页面找到"Send Note to Student"
2. 编写消息并发送
3. 学生将在通知中收到消息

## 技术实现

### 数据库关系
```sql
-- 家长-学生关联表
parent_links (
  parent_user_id UUID REFERENCES profiles(user_id),
  student_user_id UUID REFERENCES profiles(user_id),
  PRIMARY KEY (parent_user_id, student_user_id)
)

-- 家长笔记表
parent_notes (
  id UUID PRIMARY KEY,
  application_id UUID REFERENCES applications(id),
  parent_user_id UUID REFERENCES profiles(user_id),
  note TEXT,
  created_at TIMESTAMP
)
```

### 权限验证
- 所有API端点都验证家长身份
- 检查 `parent_links` 表确保访问权限
- 防止跨用户数据访问

### 组件结构
```
components/
├── parent/
│   └── ParentOverview.tsx          # 家长概览统计
├── layouts/
│   ├── DashboardLayout.tsx         # 动态侧边栏
│   └── ParentNotificationsBell.tsx # 家长通知铃铛
└── auth/
    └── SignupCard.tsx              # 支持角色选择
```

## 安全考虑

1. **角色验证**: 中间件确保家长无法访问学生路由
2. **数据隔离**: 只能查看关联学生的数据
3. **API保护**: 所有端点都有权限检查
4. **会话管理**: 支持账户切换和登出

## 未来扩展

- [ ] 家长可以查看学生的学术资料
- [ ] 支持家长设置提醒和通知偏好
- [ ] 添加申请进度图表和趋势分析
- [ ] 支持家长和学生之间的实时聊天
- [ ] 添加申请费用跟踪功能 