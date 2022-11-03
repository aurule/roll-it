"use strict"

module.exports = {
  /**
   * Return an array of arrays of random numbers simulating dice
   *
   * The top-level array contains a number of arrays equal to `rolls`. Each member array has a length equal to
   * `pool`. Each integer within those inner arrays will fall between 1 and `sides`, inclusive.
   *
   * @param  {int} pool   Size of the array
   * @param  {Int} sides  Max value of each die
   * @param  {Int} rolls  Number of times to repeat the roll
   * @return {Array<Array<Int>>} Array of arrays of random numbers
   */
  roll(pool, sides, rolls = 1) {
    return Array.from(
      {length: rolls},
      () =>
        Array.from(
          {length: pool},
          () => Math.floor(Math.random() * sides)+1
        )
      )
  },
}
