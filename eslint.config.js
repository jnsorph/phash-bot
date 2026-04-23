import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier/flat';

export default tseslint.config(
	{
		ignores: ['dist/**']
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	prettier,
	{
		files: ['src/**/*.ts'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: globals.node
		}
	}
);
