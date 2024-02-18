export default function sum(...nums: number[]) {
  return nums.reduce((pre, cur) => pre + cur, 0)
}
