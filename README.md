# osmdevio-blog

A personal Astro site for long-form writing and short notes.

## Local development

```sh
npm ci
npm run dev
```

Run `npm run build` to generate the static site in `dist/` and `npm run preview` to preview the build.

## Writing and notes

- Long-form Markdown and MDX posts live in `src/content/blog/` and are listed at `/blog/`. Set `heroImage` in the frontmatter to show a cover in the list and on the article.
- Short Markdown and MDX notes live in `src/content/thoughts/` and are listed at `/thoughts/`. Notes use `title`, `description`, and `pubDate`, with an optional `category`.

## Theme credits

The layout and styles are adapted from [KISS by Sanju S](https://github.com/Spikeysanju/sanju.sh) (Apache 2.0). See `LICENSE-KISS`. [Pretendard](https://github.com/orioncactus/pretendard) is distributed under the SIL Open Font License in `public/fonts/pretendard/OFL.txt`.
