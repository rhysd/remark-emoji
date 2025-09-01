// @ts-check

import eslint from '@eslint/js';
import ts from 'typescript-eslint';
import mocha from 'eslint-plugin-mocha';
import configPrettier from 'eslint-config-prettier';
import n from 'eslint-plugin-n';
import security from 'eslint-plugin-security';

export default ts.config(
    eslint.configs.recommended,
    ...ts.configs.recommendedTypeChecked,
    n.configs['flat/recommended-module'],
    security.configs.recommended,
    configPrettier,
    {
        ignores: ['*.d.ts'],
    },
    {
        files: ['*.ts'],
        languageOptions: {
            parserOptions: {
                project: 'tsconfig.json',
            },
        },
    },
    {
        files: ['*.ts', 'eslint.config.mjs'],
        rules: {
            indent: ['error', 4],
            quotes: ['error', 'single'],
            'linebreak-style': ['error', 'unix'],
            semi: ['error', 'always'],
            eqeqeq: ['error', 'always'],
            'no-constant-condition': ['error', { checkLoops: false }],
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            'n/no-missing-import': 'off', // This rule causes false positives on type-only packages
        },
    },
    {
        files: ['eslint.config.mjs'],
        languageOptions: {
            parserOptions: {
                project: 'tsconfig.eslint.json',
            },
        },
    },
    {
        files: ['test.ts'],
        // The cast is workaround for https://github.com/lo1tuma/eslint-plugin-mocha/issues/392
        .../** @type {{recommended: import('eslint').Linter.Config}} */ (mocha.configs).recommended,
    },
    {
        files: ['test.ts'],
        rules: {
            'mocha/consistent-spacing-between-blocks': 'off', // Conflict with prettier
            'mocha/no-exclusive-tests': 'error',
            'mocha/no-pending-tests': 'error',
            'mocha/no-top-level-hooks': 'error',
            'mocha/consistent-interface': ['error', { interface: 'BDD' }],
        },
    }
);
