export const ENUMERABLE_TAGS = ["STMTTRN"];

export default class Okane {
  static parse(content: string): Record<string, any> {
    const lines = content.split("\n");

    const result: Record<string, any> = {};

    const tagStack: string[] = [];

    for (let line of lines) {
      const headerPattern = /(.+):(.+)/;
      const aggregateTagPattern = /<(.+)>/;
      const aggregateClosingTagPattern = /<\/(.+)>/;
      const attributeTagPattern = /<(.+)>(.+)/;
      const attributeClosingTagPattern = /<(.+)>(.+)<\/.+>/;

      line = line.trim();

      if (attributeClosingTagPattern.test(line)) {
        const match = line.match(attributeClosingTagPattern);
        if (match) {
          const tag = match[1];
          const value = match[2];

          const targetObject = tagStack.reduce((obj, key) => obj[key], result);

          if (typeof targetObject === "object" && !Array.isArray(targetObject)) {
            targetObject[tag] = value.toString();
          } else {
            targetObject[targetObject.length - 1][tag] = value.toString();
          }
        }
      } else if (attributeTagPattern.test(line)) {
        const match = line.match(attributeTagPattern);
        if (match) {
          const tag = match[1];
          const value = match[2];

          const targetObject = tagStack.reduce((obj, key) => obj[key], result);

          if (typeof targetObject === "object" && !Array.isArray(targetObject)) {
            targetObject[tag] = value.toString();
          } else {
            targetObject[targetObject.length - 1][tag] = value.toString();
          }
        }
      } else if (headerPattern.test(line)) {
        const match = line.match(headerPattern);
        if (match) {
          result[match[1]] = match[2];
        }
      } else if (aggregateClosingTagPattern.test(line)) {
        tagStack.pop();
      } else if (aggregateTagPattern.test(line)) {
        const match = line.match(aggregateTagPattern);
        if (match) {
          const tag = match[1];

          if (tagStack.length > 0) {
            const targetObject = tagStack.reduce((obj, key) => obj[key], result);

            if (ENUMERABLE_TAGS.includes(tag)) {
              if (!targetObject[tag]) {
                targetObject[tag] = [];
              }

              targetObject[tag].push({});
            } else {
              targetObject[tag] = {};
            }
          } else {
            result[tag] = {};
          }

          tagStack.push(tag);
        }
      } else if (line.length === 0) {
        // Do nothing
      } else {
        console.log(line);
        console.log("No pattern found");
      }
    }

    return result;
  }
}