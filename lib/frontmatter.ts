import yaml from "js-yaml";

// gray-matter ships a js-yaml 3 engine that calls the removed `yaml.safeLoad`; this one runs on js-yaml 4.
export const matterOptions = {
  engines: {
    yaml: {
      parse: (input: string) => yaml.load(input) as object,
      stringify: () => {
        throw new Error("YAML stringify is not supported for frontmatter");
      },
    },
  },
};
