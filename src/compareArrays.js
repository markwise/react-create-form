/**
 * Shallow compares two arrays by value. This is used to compare the values
 * of select-multiple types, which are always arrays with string values.
 *
 * @param {Array} a
 *    Array entity.
 *
 * @param {Array} b
 *    Array entity.
 *
 * @returns {Boolean}
 *    Returns true if both arrays contain the same values, otherwise false.
 */
const compareArrays = (a = [], b = []) => (
  !a.some(item => !b.includes(item)) && !b.some(item => !a.includes(item))
)

export default compareArrays
