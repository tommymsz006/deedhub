export function wrap(fn: Function) {
  return function(...args: any[]) {
    fn(...args).catch(args[2]);
  }
}