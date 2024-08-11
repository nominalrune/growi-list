
// @ts-expect-error esm module error
import { unified } from 'unified';
// @ts-expect-error esm module error
import remarkParse from 'remark-parse';
// @ts-expect-error esm module error
import remarkGfm from 'remark-gfm';
// @ts-expect-error esm module error
import remarkStringify from 'remark-stringify';
import { Root } from 'mdast';
export default class MarkdownService{
	public stringify(root:Root) {
		const content = unified()
			.use(remarkGfm)
			.use(remarkStringify, {
				bullet: '-',
				incrementListMarker: false,
				resourceLink: true,
				rule: '-',
			})
			.stringify(root);
		return content;
	}
	public parse(body: string) {
		return unified()
			.use(remarkParse)
			.use(remarkGfm)
			.parse(body)
			;
	}
}