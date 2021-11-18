import { mdsvex } from 'mdsvex';
import { headingRank } from 'hast-util-heading-rank';
import { toString } from 'hast-util-to-string';
import { visit } from 'unist-util-visit';
import { make_session_slug_processor } from '@sveltejs/site-kit/utils/slug.js';

// TODO this is duplicating logic in src/routes/docs/index.json.js in a
// rather unfortunate way, would be nice if that wasn't the case
function add_ids() {
	return (tree) => {
		const slugify = make_session_slug_processor();

		/** @type {string} */
		let current_section = null;

		visit(tree, 'element', (node) => {
			const rank = headingRank(node);

			if (rank === 2 || rank === 3) {
				const slug = slugify(toString(node));

				if (rank === 2) {
					current_section = slug;
					node.properties.id = current_section;
				} else if (rank === 3) {
					if (!current_section) throw new Error(`encountered h3 before h2`);
					node.properties.id = `${current_section}-${slug}`;
				}
			}
		});
	};
}

export const preprocess = mdsvex({
	extensions: ['.svelte.md'],
	rehypePlugins: [add_ids]
});