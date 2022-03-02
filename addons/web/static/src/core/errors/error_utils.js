/** @odoo-module **/

import { loadAssets } from "../assets";
import { isBrowserChrome } from "../browser/feature_detection";

/**
 * @param {Error} error
 * @returns {string}
 */
export function getErrorTechnicalName(error) {
    return error.name !== Error.name ? error.name : error.constructor.name;
}

/**
 * Format the traceback of an error. Basically, we just add the error message
 * in the traceback if necessary (Chrome already does it by default, but not
 * other browser.)
 *
 * @param {Error} error
 * @returns {string}
 */
export function formatTraceback(error) {
    let traceback = error.stack;
    const errorName = getErrorTechnicalName(error);
    if (!isBrowserChrome()) {
        // transforms the stack into a chromium stack
        // Chromium stack example:
        // Error: Mock: Can't write value
        //     _onOpenFormView@http://localhost:8069/web/content/425-baf33f1/web.assets.js:1064:30
        //     ...
        traceback = `${errorName}: ${error.message}\n${error.stack}`.replace(/\n/g, "\n    ");
    } else if (error.stack) {
        // Chromium stack starts with the error's name but the name is "Error" by default
        // so we replace it to have the error type name
        traceback = error.stack.replace(/^[^:]*/g, errorName);
    }
    return traceback;
}

/**
 * Returns an annotated traceback from an error. This is asynchronous because
 * it needs to fetch the sourcemaps for each script involved in the error,
 * then compute the correct file/line numbers and add the information to the
 * correct line.
 *
 * @param {Error} error
 * @returns {Promise<string>}
 */
export async function annotateTraceback(error) {
    const traceback = formatTraceback(error);
    try {
        await loadAssets({
            jsLibs: ["/web/static/lib/stacktracejs/stacktrace.js"],
        });
    } catch (_e) {
        return traceback;
    }
    // In Firefox, the error stack generated by anonymous code (example: invalid
    // code in a template) is not compatible with the stacktrace lib. This code
    // corrects the stack to make it compatible with the lib stacktrace.
    if (error.stack) {
        const regex = / line (\d*) > (Function):(\d*)/gm;
        const subst = `:$1`;
        error.stack = error.stack.replace(regex, subst);
    }
    // eslint-disable-next-line no-undef
    let frames;
    try {
        frames = await StackTrace.fromError(error);
    } catch (e) {
        // This can crash if the originalError has no stack/stacktrace property
        console.warn("The following error could not be annotated:", error, e);
        return traceback;
    }
    const lines = traceback.split("\n");
    if (lines[lines.length - 1].trim() === "") {
        // firefox traceback have an empty line at the end
        lines.splice(-1);
    }

    // Chrome stacks contains some lines with (index 0) which apparently
    // corresponds to some native functions (at least Promise.all). We need to
    // ignore them because they will not correspond to a stackframe.
    const skips = lines.filter((l) => l.includes("(index 0")).length;
    const offset = lines.length - frames.length - skips;
    let lineIndex = offset;
    let frameIndex = 0;
    while (frameIndex < frames.length) {
        const line = lines[lineIndex];
        if (line.includes("(index 0)")) {
            lineIndex++;
            continue;
        }
        const frame = frames[frameIndex];
        const info = ` (${frame.fileName}:${frame.lineNumber})`;
        lines[lineIndex] = line + info;
        lineIndex++;
        frameIndex++;
    }
    return lines.join("\n");
}
