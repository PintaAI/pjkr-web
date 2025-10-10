# 🧭 Documentation Navigation Guide

## Viewing the Documentation

### Option 1: In Your Browser (Recommended)

Visit the documentation viewer in development mode:

```
http://localhost:3000/docs
```

This provides:
- 🎨 Beautiful UI with syntax highlighting
- 📱 Responsive design
- 🔍 Easy navigation between docs
- 🎯 Automatic file detection

### Option 2: In Your Code Editor

You can read the markdown files directly in your editor:

- [`README.md`](./README.md) - Main documentation index
- [`authentication.md`](./authentication.md) - Authentication & Authorization guide
- [`server-actions.md`](./server-actions.md) - Server Actions documentation
- [`api-routes.md`](./api-routes.md) - API Routes documentation

### Option 3: On GitHub

If your repository is on GitHub, the markdown files will be automatically rendered when you navigate to the `docs/` folder.

## Quick Links

| Document | URL Path | Description |
|----------|----------|-------------|
| Documentation Index | `/docs` | Overview of all documentation |
| Authentication Guide | `/docs/view/authentication` | Complete auth system guide |
| Server Actions | `/docs/view/server-actions` | Protected server actions |
| API Routes | `/docs/view/api-routes` | API endpoint authentication |
| Quick Start | `/docs/view/readme` | Quick reference guide |

## Adding New Documentation

1. Create a new `.md` file in the `docs/` folder
2. Write your documentation using Markdown
3. The file will automatically appear in `/docs` (after restart)
4. No code changes needed!

### Example: Adding a new doc

```bash
# Create new documentation file
echo "# My New Documentation\n\nContent here..." > docs/my-new-doc.md

# Restart dev server
npm run dev

# Visit http://localhost:3000/docs
# Your new doc will appear automatically!
```

## Markdown Features Supported

- ✅ Headers (H1-H6)
- ✅ Code blocks with syntax highlighting
- ✅ Tables
- ✅ Lists (ordered and unordered)
- ✅ Links (internal and external)
- ✅ Blockquotes
- ✅ Inline code
- ✅ Horizontal rules
- ✅ GitHub Flavored Markdown (GFM)

## Tips

1. **Start with README.md**: It provides the best overview
2. **Use the search**: Browser's built-in search (Ctrl+F / Cmd+F) works great
3. **Bookmark frequently used docs**: Keep quick access to important guides
4. **Share links**: Each doc has its own URL you can share with teammates

## Development

The documentation viewer is located at:
- Main page: [`app/(dev)/docs/page.tsx`](../app/(dev)/docs/page.tsx)
- Viewer page: [`app/(dev)/docs/view/[slug]/page.tsx`](../app/(dev)/docs/view/[slug]/page.tsx)

To customize:
1. Edit the main page for layout changes
2. Edit the viewer page for rendering customization
3. Modify icon mapping in the main page for custom icons per doc type