# 🐍 可爱贪吃蛇游戏

一个使用 HTML5 Canvas 和 JavaScript 开发的可爱贪吃蛇游戏，具有精美的视觉效果和流畅的游戏体验。

## 🎮 游戏特色

### 🎨 可爱的视觉设计
- 渐变色彩的蛇身
- 圆角设计元素
- 可爱的蛇头（大眼睛 + 腮红）
- 呼吸动画的食物
- 粒子爆炸效果

### 🎯 游戏功能
- 完整的贪吃蛇游戏逻辑
- 键盘和触摸控制支持
- 得分系统和最高分记录
- 游戏暂停/继续功能
- 响应式设计

### 🔊 音效系统
- 吃食物音效
- 游戏结束音效
- Web Audio API 实现

## 🚀 在线体验

[点击这里体验游戏](https://your-vercel-app.vercel.app)

## 🎮 游戏控制

### 桌面端
- **方向键**: 控制蛇的移动方向
- **空格键**: 开始游戏/暂停/继续
- **R键**: 重新开始游戏

### 移动端
- **滑动手势**: 控制蛇的移动方向
- **点击按钮**: 开始游戏

## 🛠️ 本地运行

1. 克隆项目
```bash
git clone https://github.com/yourusername/cute-snake-game.git
cd cute-snake-game
```

2. 启动本地服务器
```bash
# 使用 Python
python3 -m http.server 8000

# 或使用 Node.js
npx serve .

# 或使用任何其他静态文件服务器
```

3. 在浏览器中访问 `http://localhost:8000`

## 📦 部署到 Vercel

### 方法一：通过 Vercel CLI
```bash
npm i -g vercel
vercel
```

### 方法二：通过 GitHub 集成
1. 将代码推送到 GitHub 仓库
2. 在 [Vercel](https://vercel.com) 上导入项目
3. 自动部署完成

## 🎯 游戏规则

1. 控制蛇移动吃食物
2. 每吃一个食物得 10 分
3. 蛇身会随着吃食物而增长
4. 避免撞墙或撞到自己
5. 游戏速度会随着得分增加而加快
6. 挑战你的最高分！

## 🛠️ 技术栈

- **HTML5 Canvas**: 游戏渲染
- **JavaScript ES6+**: 游戏逻辑
- **CSS3**: 样式和动画
- **Web Audio API**: 音效系统
- **LocalStorage**: 本地数据存储

## 📱 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- 移动端浏览器

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🎉 致谢

感谢所有为这个项目提供灵感和帮助的开发者们！

---

享受游戏，挑战你的最高分！🌟
