import files from "./files.config.js";
import path from "node:path";

const __dirname = path.resolve();

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
    files(eleventyConfig);

    eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

    return {
        dir: {
            input: "source",
            output: "dist",
            includes: "_includes",
            layouts: "_layouts",
            data: "_data"
        }
    };
};