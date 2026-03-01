const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const baseUrl = 'https://undrstanding.github.io';

const targetDirs = [rootDir, path.join(rootDir, 'content'), path.join(rootDir, 'labs')];

function processHtmlFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove existing SEO tags if we are re-running
    content = content.replace(/<meta name="description".*?>\n?/g, '');
    content = content.replace(/<meta name="keywords".*?>\n?/g, '');
    content = content.replace(/<link rel="canonical".*?>\n?/g, '');
    content = content.replace(/<meta property="og:.*?>\n?/g, '');
    content = content.replace(/<meta name="twitter:.*?>\n?/g, '');

    const titleMatch = content.match(/<title>(.*?)<\/title>/);
    let titleContent = 'Undrstanding';
    if (titleMatch) {
        titleContent = titleMatch[1].trim();
    }

    const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
    let newTitle = titleContent;
    let seoTags = '';

    // Normalize existing titles
    let originalTitle = titleContent.replace(' | Undrstanding', '').replace('Undrstanding | ', '');

    if (relativePath === 'index.html') {
        newTitle = 'Undrstanding - Interactive Explorations for Humans';
        seoTags = `
    <title>${newTitle}</title>
    <meta name="description" content="Undrstanding: Interactive explorations for humans. Learn computer science, algorithms, AI, and more with our educational repository.">
    <meta name="keywords" content="undrstanding, computer science, learning, educational, algorithms, AI, tech">
    <link rel="canonical" href="${baseUrl}/">
    <meta property="og:title" content="${newTitle}">
    <meta property="og:description" content="Undrstanding: Interactive explorations for humans. Learn computer science, algorithms, AI, and more.">
    <meta property="og:url" content="${baseUrl}/">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${newTitle}">
    <meta name="twitter:description" content="Undrstanding: Interactive explorations for humans. Learn computer science, algorithms, AI, and more.">`;
    } else {
        newTitle = `${originalTitle} | Undrstanding`;
        if (titleContent === 'Undrstanding') newTitle = 'Undrstanding - Interactive Explorations for Humans'; // fallback

        seoTags = `
    <title>${newTitle}</title>
    <meta name="description" content="Learn about ${originalTitle} with Undrstanding - Interactive explorations for humans. educational repository for complex topics.">
    <meta name="keywords" content="undrstanding, ${originalTitle.toLowerCase()}, computer science, learning, educational">
    <link rel="canonical" href="${baseUrl}/${relativePath}">
    <meta property="og:title" content="${newTitle}">
    <meta property="og:description" content="Learn about ${originalTitle} with Undrstanding - Interactive explorations for humans.">
    <meta property="og:url" content="${baseUrl}/${relativePath}">
    <meta property="og:type" content="article">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${newTitle}">
    <meta name="twitter:description" content="Learn about ${originalTitle} with Undrstanding - Interactive explorations for humans.">`;
    }

    // Replace <title>...</title> with seoTags
    content = content.replace(/<title>.*?<\/title>/, seoTags.trim());

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${relativePath}`);
}

targetDirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        if (file.endsWith('.html')) {
            processHtmlFile(path.join(dir, file));
        }
    });
});

console.log('SEO optimization complete.');
