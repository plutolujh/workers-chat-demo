// Picks the initial page of chat history from Durable Object storage entries.
//
// `items` must be ordered newest-first (the order returned by
// `storage.list({reverse: true, limit})`), and the returned page keeps that
// same newest-first order.
//
// The page must contain the NEWEST messages: the last message a user sent is
// the one they expect to still be there after reconnecting. Older messages
// are the ones that get paged out behind the "load more" button.
export function pickInitialPage(items, pageSize) {
  // If there are more than pageSize messages, signal that there's more
  const hasMore = items.length > pageSize;

  // items are newest-first, so the first pageSize entries are the newest ones
  const page = hasMore ? items.slice(0, pageSize) : items;

  return { page, hasMore };
}
