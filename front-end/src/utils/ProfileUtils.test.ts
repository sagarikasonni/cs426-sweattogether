import { describe, it, expect, vi, beforeEach } from 'vitest';
import { filterProfiles, sortProfiles } from './ProfileUtils';
import { ProfileModel } from '../data/ProfileModel';

// Helper to build a minimal profile for tests.
const makeProfile = (overrides: Partial<ProfileModel> = {}): ProfileModel => ({
  id: 1,
  image: '',
  name: 'Test',
  age: 25,
  gender: 'Female',
  location: { country: 'United States', zip_code: '10001' },
  level: 'Beginner',
  workout_preferences: ['Running'],
  bio: '',
  ...overrides,
});

const emptyFilters = {
  levels: [] as string[],
  genders: [] as string[],
  workoutTypes: [] as string[],
  maxDistance: null as number | null,
};

// filterProfiles calls fetch() for zip-code geocoding. Stub it so tests are
// deterministic and offline. All profiles resolve to the same coordinates,
// so any distance-based filtering treats everyone as co-located (distance 0).
beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      json: async () => ({ places: [{ latitude: '40.7', longitude: '-74.0' }] }),
    })),
  );
});

describe('filterProfiles', () => {
  it('returns all profiles when no filters are applied', async () => {
    const profiles = [
      makeProfile({ id: 1, level: 'Beginner' }),
      makeProfile({ id: 2, level: 'Advanced' }),
    ];
    const result = await filterProfiles(profiles, emptyFilters, '10001', 'United States');
    expect(result.map((p) => p.id).sort()).toEqual([1, 2]);
  });

  it('filters by level', async () => {
    const profiles = [
      makeProfile({ id: 1, level: 'Beginner' }),
      makeProfile({ id: 2, level: 'Advanced' }),
    ];
    const result = await filterProfiles(
      profiles,
      { ...emptyFilters, levels: ['Advanced'] },
      '10001',
      'United States',
    );
    expect(result.map((p) => p.id)).toEqual([2]);
  });

  it('filters by gender', async () => {
    const profiles = [
      makeProfile({ id: 1, gender: 'Female' }),
      makeProfile({ id: 2, gender: 'Male' }),
    ];
    const result = await filterProfiles(
      profiles,
      { ...emptyFilters, genders: ['Male'] },
      '10001',
      'United States',
    );
    expect(result.map((p) => p.id)).toEqual([2]);
  });

  it('filters by workout type (matches if any preference overlaps)', async () => {
    const profiles = [
      makeProfile({ id: 1, workout_preferences: ['Running', 'Yoga'] }),
      makeProfile({ id: 2, workout_preferences: ['Boxing'] }),
    ];
    const result = await filterProfiles(
      profiles,
      { ...emptyFilters, workoutTypes: ['Yoga'] },
      '10001',
      'United States',
    );
    expect(result.map((p) => p.id)).toEqual([1]);
  });

  it('keeps co-located profiles within the max distance', async () => {
    // All stubbed coords are identical -> distance 0 -> within any maxDistance.
    const profiles = [makeProfile({ id: 1 }), makeProfile({ id: 2 })];
    const result = await filterProfiles(
      profiles,
      { ...emptyFilters, maxDistance: 50 },
      '10001',
      'United States',
    );
    expect(result.map((p) => p.id).sort()).toEqual([1, 2]);
  });
});

describe('sortProfiles', () => {
  it('sorts by name A-Z', () => {
    const profiles = [
      makeProfile({ id: 1, name: 'Charlie' }),
      makeProfile({ id: 2, name: 'Alice' }),
      makeProfile({ id: 3, name: 'Bob' }),
    ];
    const result = sortProfiles(profiles, 'name-az');
    expect(result.map((p) => p.name)).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('sorts by level low -> high', () => {
    const profiles = [
      makeProfile({ id: 1, level: 'Advanced' }),
      makeProfile({ id: 2, level: 'Beginner' }),
      makeProfile({ id: 3, level: 'Intermediate' }),
    ];
    const result = sortProfiles(profiles, 'level-low-high');
    expect(result.map((p) => p.level)).toEqual(['Beginner', 'Intermediate', 'Advanced']);
  });

  it('sorts by level high -> low', () => {
    const profiles = [
      makeProfile({ id: 1, level: 'Beginner' }),
      makeProfile({ id: 2, level: 'Advanced' }),
      makeProfile({ id: 3, level: 'Intermediate' }),
    ];
    const result = sortProfiles(profiles, 'level-high-low');
    expect(result.map((p) => p.level)).toEqual(['Advanced', 'Intermediate', 'Beginner']);
  });

  it('preserves order for ml-score (sorting handled upstream)', () => {
    const profiles = [
      makeProfile({ id: 3, name: 'C' }),
      makeProfile({ id: 1, name: 'A' }),
      makeProfile({ id: 2, name: 'B' }),
    ];
    const result = sortProfiles(profiles, 'ml-score');
    expect(result.map((p) => p.id)).toEqual([3, 1, 2]);
  });

  it('does not mutate the input array', () => {
    const profiles = [
      makeProfile({ id: 1, name: 'B' }),
      makeProfile({ id: 2, name: 'A' }),
    ];
    const original = [...profiles];
    sortProfiles(profiles, 'name-az');
    expect(profiles).toEqual(original);
  });
});
