/**
 * Full interface definitions for detailed type API reference.
 * Adapted from functype/src/cli/full-interfaces.ts
 */

export const FULL_INTERFACES: Record<string, string> = {
  Option: `interface Option<T> {
  readonly value: T | undefined
  isEmpty: boolean
  isSome(): this is Option<T> & { value: T; isEmpty: false }
  isNone(): this is Option<T> & { value: undefined; isEmpty: true }
  orElse(defaultValue: T): T
  orThrow(error?: Error): T
  or(alternative: Option<T>): Option<T>
  orNull(): T | null
  orUndefined(): T | undefined
  map<U>(f: (value: T) => U): Option<U>
  ap<U>(ff: Option<(value: T) => U>): Option<U>
  filter(predicate: (value: T) => boolean): Option<T>
  flatMap<U>(f: (value: T) => Option<U>): Option<U>
  flatMapAsync<U>(f: (value: T) => Promise<Option<U>>): Promise<Option<U>>
  fold<U>(onNone: () => U, onSome: (value: T) => U): U
  foldLeft<B>(z: B): (op: (b: B, a: T) => B) => B
  foldRight<B>(z: B): (op: (a: T, b: B) => B) => B
  toList(): List<T>
  contains(value: T): boolean
  size: number
  toEither<E>(left: E): Either<E, T>
  toString(): string
  match<R>(patterns: { Some: (value: T) => R; None: () => R }): R
}`,

  Either: `interface Either<L, R> {
  readonly _tag: "Left" | "Right"
  value: L | R
  isLeft(): this is Either<L, R> & { readonly _tag: "Left"; value: L }
  isRight(): this is Either<L, R> & { readonly _tag: "Right"; value: R }
  orElse(defaultValue: R): R
  orThrow(error?: Error): R
  or(alternative: Either<L, R>): Either<L, R>
  orNull(): R | null
  orUndefined(): R | undefined
  map<U>(f: (value: R) => U): Either<L, U>
  ap<U>(ff: Either<L, (value: R) => U>): Either<L, U>
  merge<L1, R1>(other: Either<L1, R1>): Either<L | L1, [R, R1]>
  flatMap<U>(f: (value: R) => Either<L, U>): Either<L, U>
  flatMapAsync<U>(f: (value: R) => Promise<Either<L, U>>): Promise<Either<L, U>>
  toOption(): Option<R>
  toList(): List<R>
  tap(f: (value: R) => void): Either<L, R>
  tapLeft(f: (value: L) => void): Either<L, R>
  mapLeft<L2>(f: (value: L) => L2): Either<L2, R>
  bimap<L2, R2>(fl: (value: L) => L2, fr: (value: R) => R2): Either<L2, R2>
  fold<T>(onLeft: (value: L) => T, onRight: (value: R) => T): T
  swap(): Either<R, L>
  pipe<U>(f: (value: L | R) => U): U
  match<T>(patterns: { Left: (value: L) => T; Right: (value: R) => T }): T
}`,

  Try: `interface Try<T> {
  readonly _tag: "Success" | "Failure"
  readonly error: Error | undefined
  isSuccess(): this is Try<T> & { readonly _tag: "Success"; error: undefined }
  isFailure(): this is Try<T> & { readonly _tag: "Failure"; error: Error }
  orElse(defaultValue: T): T
  orThrow(error?: Error): T
  or(alternative: Try<T>): Try<T>
  orNull(): T | null
  orUndefined(): T | undefined
  toOption(): Option<T>
  toEither<E>(leftValue: E): Either<E, T>
  toList(): List<T>
  map<U>(f: (value: T) => U): Try<U>
  ap<U>(ff: Try<(value: T) => U>): Try<U>
  flatMap<U>(f: (value: T) => Try<U>): Try<U>
  flatMapAsync<U>(f: (value: T) => Promise<Try<U>>): Promise<Try<U>>
  fold<U>(onFailure: (error: Error) => U, onSuccess: (value: T) => U): U
  toString(): string
  match<R>(patterns: { Success: (value: T) => R; Failure: (error: Error) => R }): R
}`,

  List: `interface List<A> {
  readonly length: number
  readonly [Symbol.iterator]: () => Iterator<A>
  map<B>(f: (a: A) => B): List<B>
  ap<B>(ff: List<(value: A) => B>): List<B>
  flatMap<B>(f: (a: A) => Iterable<B>): List<B>
  filter(predicate: (a: A) => unknown): List<A>
  filterNot(p: (a: A) => boolean): List<A>
  remove(value: A): List<A>
  removeAt(index: number): List<A>
  add(item: A): List<A>
  get(index: number): Option<A>
  concat(other: List<A>): List<A>
  take(n: number): List<A>
  takeWhile(p: (a: A) => boolean): List<A>
  takeRight(n: number): List<A>
  get head(): A | undefined
  get headOption(): Option<A>
  get last(): A | undefined
  get lastOption(): Option<A>
  get tail(): List<A>
  get init(): List<A>
  reverse(): List<A>
  indexOf(value: A): number
  prepend(item: A): List<A>
  distinct(): List<A>
  sorted(compareFn?: (a: A, b: A) => number): List<A>
  sortBy<B>(f: (a: A) => B, compareFn?: (a: B, b: B) => number): List<A>
  zip<B>(other: List<B>): List<[A, B]>
  zipWithIndex(): List<[A, number]>
  groupBy<K>(f: (a: A) => K): Map<K, List<A>>
  partition(p: (a: A) => boolean): [List<A>, List<A>]
  span(p: (a: A) => boolean): [List<A>, List<A>]
  slice(start: number, end: number): List<A>
  fold<U>(onEmpty: () => U, onValue: (values: A[]) => U): U
  toArray(): A[]
  isEmpty: boolean
  nonEmpty: boolean
  size: number
  contains(v: A): boolean
  match<R>(patterns: { Empty: () => R; NonEmpty: (values: A[]) => R }): R
}`,

  Set: `interface Set<A> {
  add(value: A): Set<A>
  remove(value: A): Set<A>
  contains(value: A): boolean
  has(value: A): boolean
  map<B>(f: (a: A) => B): Set<B>
  flatMap<B>(f: (a: A) => Iterable<B>): Set<B>
  filter(p: (a: A) => boolean): Set<A>
  filterNot(p: (a: A) => boolean): Set<A>
  fold<U>(onEmpty: () => U, onValue: (value: A) => U): U
  toList(): List<A>
  toArray(): A[]
  toString(): string
  isEmpty: boolean
  size: number
}`,

  Map: `interface Map<K, V> {
  readonly _tag: "Map"
  add(item: Tuple<[K, V]>): Map<K, V>
  remove(value: K): Map<K, V>
  map<U>(f: (value: V) => U): Map<K, U>
  ap<U>(ff: Map<K, (value: V) => U>): Map<K, U>
  flatMap<K2, V2>(f: (entry: Tuple<[K, V]>) => Iterable<[K2, V2]>): Map<K2, V2>
  get(key: K): Option<V>
  getOrElse(key: K, defaultValue: V): V
  fold<U>(onEmpty: () => U, onValue: (value: Tuple<[K, V]>) => U): U
  foldLeft<B>(z: B): (op: (b: B, a: Tuple<[K, V]>) => B) => B
  foldRight<B>(z: B): (op: (a: Tuple<[K, V]>, b: B) => B) => B
  match<R>(patterns: { Empty: () => R; NonEmpty: (entries: Array<Tuple<[K, V]>>) => R }): R
  isEmpty: boolean
  size: number
}`,

  Lazy: `interface Lazy<T> {
  readonly _tag: "Lazy"
  readonly isEvaluated: boolean
  orElse(defaultValue: T): T
  orNull(): T | null
  orThrow(error?: Error): T
  or(alternative: Lazy<T>): Lazy<T>
  map<U>(f: (value: T) => U): Lazy<U>
  ap<U>(ff: Lazy<(value: T) => U>): Lazy<U>
  flatMap<U>(f: (value: T) => Lazy<U>): Lazy<U>
  filter(predicate: (value: T) => boolean): Lazy<Option<T>>
  recover(f: (error: unknown) => T): Lazy<T>
  recoverWith(f: (error: unknown) => Lazy<T>): Lazy<T>
  toOption(): Option<T>
  toEither(): Either<unknown, T>
  toTry(): Try<T>
  tap(f: (value: T) => void): Lazy<T>
  fold<U>(f: (value: T) => U): U
  foldWith<U>(onFailure: (error: unknown) => U, onSuccess: (value: T) => U): U
  match<R>(patterns: { Lazy: (value: T) => R }): R
  toString(): string
}`,

  LazyList: `interface LazyList<A> {
  [Symbol.iterator](): Iterator<A>
  map<B>(f: (a: A) => B): LazyList<B>
  flatMap<B>(f: (a: A) => LazyList<B>): LazyList<B>
  filter(predicate: (a: A) => boolean): LazyList<A>
  take(n: number): LazyList<A>
  drop(n: number): LazyList<A>
  takeWhile(predicate: (a: A) => boolean): LazyList<A>
  dropWhile(predicate: (a: A) => boolean): LazyList<A>
  concat(other: LazyList<A>): LazyList<A>
  zip<B>(other: LazyList<B>): LazyList<[A, B]>
  takeRight(n: number): LazyList<A>
  reverse(): LazyList<A>
  distinct(): LazyList<A>
  zipWithIndex(): LazyList<[A, number]>
  get head(): A | undefined
  get headOption(): Option<A>
  get last(): A | undefined
  get lastOption(): Option<A>
  get tail(): LazyList<A>
  get init(): LazyList<A>
  toList(): List<A>
  toArray(): A[]
  forEach(f: (a: A) => void): void
  reduce<B>(f: (acc: B, a: A) => B, initial: B): B
  find(predicate: (a: A) => boolean): Option<A>
  some(predicate: (a: A) => boolean): boolean
  every(predicate: (a: A) => boolean): boolean
  count(): number
  toString(): string
}`,

  IO: `interface IO<R, E, A> {
  map<B>(f: (a: A) => B): IO<R, E, B>
  flatMap<R2, E2, B>(f: (a: A) => IO<R2, E2, B>): IO<R & R2, E | E2, B>
  tap<R2, E2>(f: (a: A) => IO<R2, E2, unknown>): IO<R & R2, E | E2, A>
  mapError<E2>(f: (e: E) => E2): IO<R, E2, A>
  recover(value: A): IO<R, never, A>
  recoverWith<R2, E2>(f: (e: E) => IO<R2, E2, A>): IO<R & R2, E2, A>
  catchTag<Tag, E2, R2, B>(tag: Tag, f: (e: Extract<E, { _tag: Tag }>) => IO<R2, E2, B>): IO<R & R2, Exclude<E, { _tag: Tag }> | E2, A | B>
  catchAll<R2, E2, B>(f: (e: E) => IO<R2, E2, B>): IO<R & R2, E2, A | B>
  retry(n: number): IO<R, E, A>
  retryWithDelay(n: number, ms: number): IO<R, E, A>
  timeout(ms: number): IO<R, E | Error, A>
  delay(ms: number): IO<R, E, A>
  zip<R2, E2, B>(other: IO<R2, E2, B>): IO<R & R2, E | E2, [A, B]>
  pipe<B>(f: (io: IO<R, E, A>) => B): B
  fold<B>(onErr: (e: E) => B, onOk: (a: A) => B): IO<R, never, B>
  match<B>(patterns: { failure: (e: E) => B; success: (a: A) => B }): IO<R, never, B>
  run(): Promise<Either<E, A>>
  runOrThrow(): Promise<A>
  runSync(): Either<E, A>
  runSyncOrThrow(): A
  provideService<S>(tag: Tag<S>, impl: S): IO<Exclude<R, S>, E, A>
  provideLayer<S>(layer: Layer<S>): IO<Exclude<R, S>, E, A>
}`,

  TaskOutcome: `interface TaskOutcome<T> {
  readonly _tag: "Ok" | "Err"
  readonly value?: T
  readonly error?: Throwable
  map<U>(f: (value: T) => U): TaskOutcome<U>
  flatMap<U>(f: (value: T) => TaskOutcome<U>): TaskOutcome<U>
  ap<U>(ff: TaskOutcome<(value: T) => U>): TaskOutcome<U>
  mapError(f: (error: Throwable) => Throwable): TaskOutcome<T>
  recover(value: T): Ok<T>
  recoverWith(f: (error: Throwable) => T): Ok<T>
  isSuccess(): this is Ok<T>
  isFailure(): this is Err<T>
  isOk(): this is Ok<T>
  isErr(): this is Err<T>
  toEither(): Either<Throwable, T>
  toTry(): Try<T>
  toOption(): Option<T>
  toList(): List<T>
  fold<U>(onErr: (error: Throwable) => U, onOk: (value: T) => U): U
  match<U>(patterns: { Ok: (value: T) => U; Err: (error: Throwable) => U }): U
}`,

  Tuple: `interface Tuple<T extends unknown[]> {
  get<K extends number>(index: K): T[K]
  map<U extends unknown[]>(f: (value: T) => U): Tuple<U>
  flatMap<U extends unknown[]>(f: (value: T) => Tuple<U>): Tuple<U>
  toArray(): T
  length: number
  [Symbol.iterator](): Iterator<T[number]>
  toString(): string
}`,

  Stack: `interface Stack<A> {
  push(value: A): Stack<A>
  pop(): [Stack<A>, Option<A>]
  peek(): Option<A>
  map<B>(f: (a: A) => B): Stack<B>
  flatMap<B>(f: (a: A) => Stack<B>): Stack<B>
  ap<B>(ff: Stack<(value: A) => B>): Stack<B>
  toList(): List<A>
  toArray(): A[]
  toString(): string
  match<R>(patterns: { Empty: () => R; NonEmpty: (values: A[]) => R }): R
  isEmpty: boolean
  size: number
}`,
}
