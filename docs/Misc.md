
/* Interesting stuff

type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = 
  T extends Record<K, V> ? T : never

type MapDiscriminatedUnion<T extends Record<K, string>, K extends keyof T> =
  { [V in T[K]]: DiscriminateUnion<T, K, V> };

type WhatIWant = MapDiscriminatedUnion<AllActions, 'type'>;

*/