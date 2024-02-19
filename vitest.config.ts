import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // 这里这个全局设置为true时不需要在每个test单元测试里面导入断言语句
    globals: true,
    coverage: {
      reporter: ['text', 'html'],
      provider: 'v8',
    },
  },
})
