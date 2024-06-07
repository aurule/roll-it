const {arrayEq} = require("./array-eq")

it("returns true for identical objects", () => {
  const arr1 = [1, 2, 3]

  const result = arrayEq(arr1, arr1)

  expect(result).toBeTruthy()
})

it("returns false if one is null", () => {
  const arr1 = [1, 2, 3]

  const result = arrayEq(arr1)

  expect(result).toBeFalsy()
})

it("returns false if mismatched lengths", () => {
  const arr1 = [1, 2, 3]
  const arr2 = [1, 2, 3, 4]

  const result = arrayEq(arr1, arr2)

  expect(result).toBeFalsy()
})

it("returns false if non-shared item", () => {
  const arr1 = [1, 2, 3]
  const arr2 = [1, 2, 4]

  const result = arrayEq(arr1, arr2)

  expect(result).toBeFalsy()
})

it("returns true with matching items", () =>{
  const arr1 = [1, 2, 3]
  const arr2 = [1, 2, 3]

  const result = arrayEq(arr1, arr2)

  expect(result).toBeTruthy()
})
