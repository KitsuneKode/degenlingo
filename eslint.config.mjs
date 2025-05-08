import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const isProduction = process.env.NODE_ENV === 'production'

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.config({
    extends: [
      'next/core-web-vitals',
      'next/typescript',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
      'prettier',
    ],
    rules: {
      'prettier/prettier': isProduction ? 'error' : 'off',
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  }),
]

export default eslintConfig
