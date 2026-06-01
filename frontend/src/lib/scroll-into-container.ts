/** 仅在滚动容器内对齐子元素，避免带动整页 window 滚动 */
export function scrollIntoContainer(
  container: HTMLElement,
  target: HTMLElement,
  margin = 4
) {
  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  if (targetRect.top < containerRect.top + margin) {
    container.scrollTop -= containerRect.top - targetRect.top + margin;
  } else if (targetRect.bottom > containerRect.bottom - margin) {
    container.scrollTop += targetRect.bottom - containerRect.bottom + margin;
  }
}
