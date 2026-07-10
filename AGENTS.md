# Repository Guidelines

## 项目结构与模块组织

这是一个基于 Vite + React + TypeScript 的俄罗斯方块项目，主要代码位于 `src/`。

- `src/main.tsx`：React 应用入口。
- `src/App.tsx`：主界面与游戏控制按钮。
- `src/App.scss`、`src/index.css`：样式文件。
- `src/utils/tetris.ts`：游戏循环、渲染、计分、移动与暂停逻辑。
- `src/utils/shapes.ts`：方块形状坐标定义。
- `src/utils/music.ts`：基于 Howler 的音效管理。
- `public/`：静态资源，例如 `music.mp3`。
- `.github/workflows/`：GitHub Actions 工作流，包括 GitHub Pages 自动部署。

当前仓库没有独立的 `tests/` 目录。

## 构建、测试与本地开发命令

本项目使用 pnpm，版本由 `packageManager` 声明。

- `pnpm install`：根据 `pnpm-lock.yaml` 安装依赖。
- `pnpm run dev`：启动 Vite 本地开发服务。
- `pnpm run build`：执行 TypeScript 类型检查并构建生产产物到 `dist/`。
- `pnpm run lint`：运行 `oxlint` 静态检查。
- `pnpm run preview`：本地预览生产构建结果。
- `pnpm run deploy`：使用 `gh-pages` 发布 `dist/`；合入 `main` 后也会通过 GitHub Actions 自动部署。

## 代码风格与命名约定

使用 TypeScript 与 React 函数组件。保持现有风格：两个空格缩进、单引号、不使用分号。注释应简短，只解释不直观的逻辑。`src` 内部导入优先使用 `@` 别名，例如 `@/utils/tetris`。

组件使用 `PascalCase` 命名；工具文件使用清晰的小写文件名，如 `tetris.ts`、`shapes.ts`；方法名使用动词短语，如 `moveLeft`、`rotate`、`togglePause`。

## 测试规范

当前未配置测试框架。提交前至少运行：

```bash
pnpm run lint
pnpm run build
```

如果后续添加测试，建议将 `*.test.ts` 或 `*.test.tsx` 与被测代码放在同级目录，并在 `package.json` 中补充明确的 `test` 脚本。

## 提交与 Pull Request 规范

提交历史主要采用 Conventional Commit 风格，例如 `feat:`、`refactor:`、`chore:`、`style:`。继续沿用该格式，例如：`feat: add pause control`。

PR 应包含简短说明、验证步骤，以及 UI 改动对应的截图或录屏。若有关联 issue，请在描述中链接。涉及玩法逻辑时，说明键盘/按钮行为、计分或下落节奏的影响。

## 部署说明

`vite.config.ts` 中的 `base: '/tetris/'` 用于 GitHub Pages 项目站点。除非仓库名或 Pages 路径变化，否则不要修改该值。
