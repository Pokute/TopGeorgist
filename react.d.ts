import "react"

declare module "react" {
  type CleanEffect = () => void
  type DirtyEffect = () => () => void
  export function useEffect(
    effect: CleanEffect | DirtyEffect,
    onlyOnValueChanged?: any[]
  ): void

  type Lazy<T> = () => T
  type ReThinkState<T> = (prevState: T) => T
  export function useState<T>(
    initialState: T | Lazy<T>
  ): [T, (newValue: T | ReThinkState<T>) => void]

  type Dispatch<A> = (action: A) => void
  type Reducer<S, A> = (initialState: S, action: A) => S
  export function useReducer<S, A = any>(
    reducer: Reducer<S, A>,
    initialState: S
  ): [S, Dispatch<A>]

  export function useRef<T>(): RefObject<T>;
}