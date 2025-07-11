# 数独乐乐 / Sudoku Fun

## 项目简介 / Project Description

数独乐乐是一个基于Web的数独游戏，使用Svelte框架开发。这个项目是为数独爱好者提供的一个简单而有趣的游戏平台。

Sudoku Fun is a web-based Sudoku game developed using the Svelte framework. This project provides a simple and enjoyable gaming platform for Sudoku enthusiasts.

![Sudoku Game](./screenshots/game.png)

## 功能特点 / Features

- 多难度级别的数独谜题
- 错误检查和提示系统
- 计时功能
- 保存游戏进度
- 响应式设计，适配各种设备

## 安装和设置 / Installation and Setup

### 先决条件 / Prerequisites

- Node.js (14.x 或更高版本)
- npm (6.x 或更高版本)

### 安装步骤 / Installation Steps

1. 克隆仓库 / Clone the repository
```
git clone https://github.com/lea-sudo/sudoku-final.git
cd sudoku-final
```

2. 启动代理服务器 / Start the proxy server
```
npm install express node-fetch cors
node proxy-server.js
```

3. 在新的终端窗口中，启动应用程序 / In a new terminal, start the application
```
npm install
npm run dev
```

4. 打开浏览器，访问应用程序 / Open your browser and navigate to
```
http://localhost:5000
```

## 如何游戏 / How to Play

数独是一种逻辑性游戏。游戏规则很简单：在9×9的网格中填入数字1-9，使得每行、每列和每个3×3的小九宫格内都包含1-9的数字且不重复。

Sudoku is a logic-based game. The rules are simple: fill in the 9×9 grid with digits 1-9 so that each column, each row, and each of the nine 3×3 subgrids contains all of the digits from 1 to 9 without repetition.

1. 点击一个空白格子
2. 输入数字1-9
3. 继续填写直到完成整个数独

## 技术栈 / Technologies Used

- **Svelte**: 用于构建用户界面的前端框架
- **JavaScript**: 主要编程语言
- **HTML/CSS**: 用于结构和样式
- **Express**: 代理服务器
- **Node.js**: JavaScript运行环境

## 贡献 / Contributing

欢迎提交问题和拉取请求！

Issues and pull requests are welcome!

## 许可证 / License

MIT

## 联系 / Contact

如有任何问题，请联系项目维护者。

For any questions, please contact the project maintainer.