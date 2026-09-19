import type { Lang } from './locales';

type Dict = Record<string, string>;

export const ui: Record<Lang, Dict> = {
	en: {
		'nav.home': 'Home',
		'nav.docs': 'Docs',
		'nav.useCases': 'Use cases',
		'nav.blog': 'Blog',
		'nav.github': 'GitHub',

		'common.copy': 'Copy',
		'common.copied': 'Copied',
		'common.toc': 'On this page',
		'common.prev': 'Previous',
		'common.next': 'Next',
		'common.editPage': 'Edit this page',
		'common.readMore': 'Read more',
		'common.language': 'Language',
		'common.theme': 'Theme',
		'common.light': 'Light',
		'common.dark': 'Dark',
		'common.menu': 'Menu',
		'common.viewAll': 'View all',
		'common.getStarted': 'Get started',
		'common.onThisPage': 'On this page',

		'docs.title': 'Documentation',
		'docs.indexTitle': 'servd documentation',
		'docs.indexSubtitle': 'Everything you need to serve static files, SPAs, and proxied APIs from one binary.',
		'docs.group.start': 'Getting started',
		'docs.group.guides': 'Guides',
		'docs.group.reference': 'Reference',

		'usecases.title': 'Use cases',
		'usecases.subtitle': 'Real-world ways teams use servd for development, testing, and lightweight hosting.',

		'blog.title': 'Blog',
		'blog.subtitle': 'Notes on building and shipping servd.',
		'blog.publishedOn': 'Published on {date}',
		'blog.readingTime': '{n} min read',
		'blog.empty': 'No posts yet.',

		'home.installTitle': 'Install',
		'home.featuresTitle': 'Why servd',
		'home.comparisonTitle': 'How it compares to http-server and nginx',
		'home.useCasesTitle': 'Use cases',
		'home.blogTitle': 'From the blog',

		'footer.product': 'Product',
		'footer.resources': 'Resources',
		'footer.npm': 'npm',
		'footer.rights': 'Released under the MIT-style terms in the repository.',
		'footer.builtWith': 'Docs site built with SvelteKit and served by servd.'
	},
	zh: {
		'nav.home': '首页',
		'nav.docs': '文档',
		'nav.useCases': '使用场景',
		'nav.blog': '博客',
		'nav.github': 'GitHub',

		'common.copy': '复制',
		'common.copied': '已复制',
		'common.toc': '本页目录',
		'common.prev': '上一页',
		'common.next': '下一页',
		'common.editPage': '编辑此页',
		'common.readMore': '阅读更多',
		'common.language': '语言',
		'common.theme': '主题',
		'common.light': '浅色',
		'common.dark': '深色',
		'common.menu': '菜单',
		'common.viewAll': '查看全部',
		'common.getStarted': '快速开始',
		'common.onThisPage': '本页目录',

		'docs.title': '文档',
		'docs.indexTitle': 'servd 文档',
		'docs.indexSubtitle': '用一个二进制托管静态文件、SPA 与代理 API 所需的一切。',
		'docs.group.start': '开始使用',
		'docs.group.guides': '指南',
		'docs.group.reference': '参考',

		'usecases.title': '使用场景',
		'usecases.subtitle': '团队在开发、测试与轻量托管中使用 servd 的真实方式。',

		'blog.title': '博客',
		'blog.subtitle': '关于构建与发布 servd 的记录。',
		'blog.publishedOn': '发布于 {date}',
		'blog.readingTime': '阅读约 {n} 分钟',
		'blog.empty': '暂无文章。',

		'home.installTitle': '安装',
		'home.featuresTitle': '为什么选择 servd',
		'home.comparisonTitle': '与 http-server、nginx 的对比',
		'home.useCasesTitle': '使用场景',
		'home.blogTitle': '来自博客',

		'footer.product': '产品',
		'footer.resources': '资源',
		'footer.npm': 'npm',
		'footer.rights': '依据仓库中的 MIT 类许可证发布。',
		'footer.builtWith': '文档站由 SvelteKit 构建，并由 servd 托管。'
	}
};

/** Translate a UI key, interpolating {vars}. Falls back to English then the key. */
export function t(lang: Lang, key: string, vars?: Record<string, string | number>): string {
	let value = ui[lang]?.[key] ?? ui.en[key] ?? key;
	if (vars) {
		for (const [name, replacement] of Object.entries(vars)) {
			value = value.replace(new RegExp(`\\{${name}\\}`, 'g'), String(replacement));
		}
	}
	return value;
}
