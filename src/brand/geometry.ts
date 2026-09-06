import mark from "./mark.json" with { type: "json" };

export const orbitalSymbolTransform = (() => {
  const { center, symbol } = mark.orbital;
  return `rotate(${symbol.rotation} ${center.x} ${center.y}) translate(${symbol.x} ${symbol.y}) scale(${symbol.scale})`;
})();

export const verticalWordmarkTransform = (() => {
  const { wordmarkX, wordmarkY, wordmarkScale } = mark.lockups.vertical;
  return `translate(${wordmarkX} ${wordmarkY}) scale(${wordmarkScale})`;
})();
