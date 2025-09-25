import path from "node:path";

const __dirname = path.resolve();

const files_config = {
    copy: [
        { source: "source/robots.txt", destination: "robots.txt" },
        { source: "source/assets", destination: "assets" },
        { source: "source/uploads", destination: "uploads" },

        { source: "../site-theme/dist/main.js", destination: "assets/js/main.js" },
        { source: "../site-theme/dist/main.css", destination: "assets/styles/main.css" },
        { source: "node_modules/bootstrap/dist/js/bootstrap.js", destination: "assets/js/bootstrap.js" }
    ]
};

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default function(eleventyConfig) {
    files_config.copy.forEach((entry) => {
        const source = path.resolve(__dirname, entry.source);

        console.log(source);

        eleventyConfig.addPassthroughCopy({ [`${source}`]: entry.destination });
    });
}