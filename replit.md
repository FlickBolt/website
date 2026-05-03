# Snowlake Jekyll Theme

## Overview
Snowlake is a professional, SEO-friendly Jekyll theme designed for creative businesses, startups, and portfolios. It is a static site built with Jekyll (v4.3.x), a Ruby-based static site generator.

## Tech Stack
- **Framework**: Jekyll 4.3.x (Ruby static site generator)
- **Frontend**: Bootstrap, jQuery, Popper.js, Revolution Slider
- **Templating**: Liquid
- **Styling**: CSS with multi-color scheme support
- **Search**: Simple Jekyll Search (client-side)
- **Package Manager**: Bundler (Ruby gems)

## Plugins
- `jekyll-feed` — RSS feed generation
- `jekyll-paginate-v2` — Advanced pagination
- `jekyll-archives` — Tag/category archive pages

## Project Structure
- `_config.yml` — Main site configuration
- `_data/` — YAML data files (navigation, settings)
- `_includes/` — Reusable HTML partials (components, core, layouts, utilities)
- `_layouts/` — Page templates
- `_posts/` — Blog posts (Markdown)
- `_portfolio/` — Portfolio items
- `_shop_items/` — Shop products
- `_authors/` — Author profiles
- `assets/` — Static assets (CSS, JS, images, fonts, revolution slider)
- `Gemfile` — Ruby gem dependencies

## Running the Project
The site is served using:
```
bundle exec jekyll serve --host 0.0.0.0 --port 5000 --livereload
```

## Workflow
- **Start application** — Runs Jekyll dev server on port 5000 (webview)
