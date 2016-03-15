/**
* a test reducer
*
* @module reducer
* @param {object} [state]
* @param {object} action - a flux standard action
*/
export default (state = {}, action) => {
  switch (action.type) {
    case 'SESSION_COMPLETE':
      return Object.assign({}, state, { SESSION_COMPLETE: true });
    case 'header':
    case 'container':
    case 'footer':
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
};
