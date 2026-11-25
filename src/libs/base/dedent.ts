export const dedent = (strings: TemplateStringsArray, ...values: unknown[]) => {
  const text = strings.reduce((result, string, index) => {
    return (
      result + string + (index < values.length ? String(values[index]) : "")
    );
  }, "");
  return text.replace(/\s+/g, " ").trim();
};
