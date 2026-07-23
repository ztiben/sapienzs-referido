import * as migration_20260723_000839_initial from './20260723_000839_initial';

export const migrations = [
  {
    up: migration_20260723_000839_initial.up,
    down: migration_20260723_000839_initial.down,
    name: '20260723_000839_initial'
  },
];
