import { BRANCHES, ROLES } from '../../config/user-options.js';

function rows(items, prefix) {
  return items.reduce((result, item, index) => {
    if (index % 2 === 0) result.push([]);
    result.at(-1).push({ text: item, callback_data: `${prefix}:${index}` });
    return result;
  }, []);
}

export const branchKeyboard = () => ({ inline_keyboard: rows(BRANCHES, 'branch') });
export const roleKeyboard = () => ({
  inline_keyboard: rows(ROLES, 'role').map((row) => row.map((button) => ({
    ...button,
    text: button.text.toUpperCase(),
  }))),
});
