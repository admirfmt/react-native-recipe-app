export function buildShareText(recipe) {
  const lines = [recipe.title];

  if (recipe.ingredients?.length) {
    lines.push("", "Ingredients");
    recipe.ingredients.forEach((ing) => lines.push(`- ${ing}`));
  }

  lines.push("", "Shared from Recipe App");
  return lines.join("\n");
}