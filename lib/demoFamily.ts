import type {
  Confirmation,
  EditRecord,
  Family,
  Person,
  PersonComment,
  Relationship,
  Store,
  User,
} from "./types";

export const DEMO_FAMILY_ID = "demo";
export const DEMO_USER_ID = "u-jordan";

const created = "2024-03-12T16:00:00.000Z";

const user = (id: string, name: string, email: string, color: string): User => ({
  id,
  name,
  email,
  color,
});

const person = (
  id: string,
  name: string,
  extras: Partial<Person> = {}
): Person => ({
  id,
  familyId: DEMO_FAMILY_ID,
  name,
  addedById: extras.addedById ?? "u-carol",
  createdAt: extras.createdAt ?? created,
  ...extras,
});

const rel = (
  id: string,
  fromPersonId: string,
  toPersonId: string,
  type: Relationship["type"],
  kind?: Relationship["kind"],
  addedById = "u-carol"
): Relationship => ({
  id,
  familyId: DEMO_FAMILY_ID,
  fromPersonId,
  toPersonId,
  type,
  kind,
  addedById,
  createdAt: created,
});

const users: User[] = [
  user("u-carol", "Carol Reyes", "carol@example.com", "#0f766e"),
  user("u-jordan", "Jordan Reyes", "jordan@example.com", "#1d4ed8"),
  user("u-sam", "Sam Okonkwo", "sam@example.com", "#b45309"),
];

const family: Family = {
  id: DEMO_FAMILY_ID,
  name: "The Reyes family",
  createdAt: created,
  createdById: "u-carol",
};

const people: Person[] = [
  person("rosa", "Rosa Vargas", {
    birthYear: "1902",
    deathYear: "1988",
    birthDate: "1902-04-11",
    deathDate: "1988-09-02",
    lifeStatus: "deceased",
    gender: "female",
    details: { birthCity: "Oaxaca, Mexico", currentCity: "Los Angeles, CA" },
    notes: "Kept the cousins in one kitchen, even after they moved north.",
  }),
  person("tomas", "Tomás Reyes", {
    birthYear: "1898",
    deathYear: "1975",
    lifeStatus: "deceased",
    gender: "male",
    details: { birthCity: "Oaxaca, Mexico", jobs: "Railroad machinist" },
  }),
  person("miguel", "Miguel Reyes", {
    birthYear: "1938",
    deathYear: "2011",
    lifeStatus: "deceased",
    gender: "male",
    details: {
      birthCity: "Los Angeles, CA",
      currentCity: "Oakland, CA",
      jobs: "City planner",
    },
    notes: "Drew maps of the Bay for fun. Carlos still has one on the fridge.",
  }),
  person("elena", "Elena Reyes", {
    birthYear: "1942",
    lifeStatus: "living",
    gender: "female",
    details: {
      currentCity: "Oakland, CA",
      birthCity: "Mexico City, Mexico",
      college: "UC Berkeley",
    },
    addedById: "u-jordan",
  }),
  person("ernesto", "Ernesto Vargas", {
    birthYear: "1936",
    deathYear: "2004",
    lifeStatus: "deceased",
    gender: "male",
    details: { birthCity: "Oaxaca, Mexico", currentCity: "Phoenix, AZ" },
    notes: "Carol says he was Miguel's brother. Sam is not sure they shared both parents.",
  }),
  person("carlos", "Carlos Reyes", {
    birthYear: "1968",
    lifeStatus: "living",
    gender: "male",
    accountUserId: undefined,
    details: {
      currentCity: "Oakland, CA",
      birthCity: "Oakland, CA",
      jobs: "High-school history teacher",
      college: "Stanford",
    },
    addedById: "u-jordan",
  }),
  person("ana", "Ana Reyes", {
    birthYear: "1970",
    lifeStatus: "living",
    gender: "female",
    lineage: "married_in",
    details: {
      currentCity: "Oakland, CA",
      birthCity: "Manila, Philippines",
      jobs: "Pediatric nurse",
    },
    addedById: "u-carol",
  }),
  person("sofia", "Sofía Hale", {
    birthYear: "1971",
    lifeStatus: "living",
    gender: "female",
    details: {
      currentCity: "Brooklyn, NY",
      college: "Columbia",
      jobs: "Editor",
    },
    addedById: "u-carol",
  }),
  person("jordan", "Jordan Reyes", {
    birthYear: "1996",
    lifeStatus: "living",
    gender: "other",
    accountUserId: DEMO_USER_ID,
    details: {
      currentCity: "San Francisco, CA",
      birthCity: "Oakland, CA",
      college: "Stanford",
      jobs: "Product designer",
    },
    notes: "This sample tree is written as if you are Jordan.",
    addedById: "u-carol",
  }),
  person("maya", "Maya Reyes", {
    birthYear: "1998",
    lifeStatus: "living",
    gender: "female",
    details: {
      currentCity: "Oakland, CA",
      birthCity: "Oakland, CA",
      college: "Howard",
    },
    addedById: "u-jordan",
  }),
];

const relationships: Relationship[] = [
  rel("r-tomas-rosa", "tomas", "rosa", "SPOUSE_OF", "married"),
  rel("r-tomas-miguel", "tomas", "miguel", "PARENT_OF", "biological"),
  rel("r-rosa-miguel", "rosa", "miguel", "PARENT_OF", "biological"),
  rel("r-tomas-ernesto", "tomas", "ernesto", "PARENT_OF", "biological"),
  rel("r-miguel-ernesto", "miguel", "ernesto", "SIBLING_OF", "full"),
  rel("r-miguel-elena", "miguel", "elena", "SPOUSE_OF", "married"),
  rel("r-miguel-carlos", "miguel", "carlos", "PARENT_OF", "biological"),
  rel("r-elena-carlos", "elena", "carlos", "PARENT_OF", "biological"),
  rel("r-miguel-sofia", "miguel", "sofia", "PARENT_OF", "biological"),
  rel("r-elena-sofia", "elena", "sofia", "PARENT_OF", "biological"),
  rel("r-carlos-ana", "carlos", "ana", "SPOUSE_OF", "married"),
  rel("r-carlos-jordan", "carlos", "jordan", "PARENT_OF", "biological"),
  rel("r-ana-jordan", "ana", "jordan", "PARENT_OF", "biological"),
  rel("r-carlos-maya", "carlos", "maya", "PARENT_OF", "biological"),
  rel("r-ana-maya", "ana", "maya", "PARENT_OF", "biological"),
];

const confirmations: Confirmation[] = [
  {
    id: "c-ernesto-sam",
    relationshipId: "r-miguel-ernesto",
    userId: "u-sam",
    type: "CONFIRM",
    createdAt: "2024-06-02T18:12:00.000Z",
  },
  {
    id: "c-ernesto-carol",
    relationshipId: "r-miguel-ernesto",
    userId: "u-carol",
    type: "DISPUTE",
    createdAt: "2024-06-03T11:40:00.000Z",
  },
  {
    id: "c-carlos-jordan",
    relationshipId: "r-carlos-jordan",
    userId: "u-jordan",
    type: "CONFIRM",
    createdAt: "2024-04-01T09:00:00.000Z",
  },
  {
    id: "c-carlos-carol",
    relationshipId: "r-carlos-jordan",
    userId: "u-carol",
    type: "CONFIRM",
    createdAt: "2024-04-01T09:05:00.000Z",
  },
];

const comments: PersonComment[] = [
  {
    id: "cm-miguel",
    personId: "miguel",
    familyId: DEMO_FAMILY_ID,
    userId: "u-carol",
    text: "He walked Maya to school the year Elena was in Mexico. She still calls that her favorite year.",
    createdAt: "2024-05-20T14:22:00.000Z",
  },
];

const edits: EditRecord[] = [
  {
    id: "e-elena-city",
    familyId: DEMO_FAMILY_ID,
    entity: "person",
    entityId: "elena",
    field: "Current city",
    from: "Mexico City, Mexico",
    to: "Oakland, CA",
    userId: "u-jordan",
    createdAt: "2024-08-14T20:03:00.000Z",
  },
];

export const DEMO_STORE: Store = {
  users,
  families: [family],
  memberships: [
    { id: "m-carol", userId: "u-carol", familyId: DEMO_FAMILY_ID, joinedAt: created },
    { id: "m-jordan", userId: "u-jordan", familyId: DEMO_FAMILY_ID, joinedAt: created },
    { id: "m-sam", userId: "u-sam", familyId: DEMO_FAMILY_ID, joinedAt: "2024-06-01T12:00:00.000Z" },
  ],
  invites: [],
  people,
  relationships,
  confirmations,
  photos: [],
  comments,
  edits,
  dismissedSuggestions: [],
};

export const DEMO_CURRENT_USER = users.find((u) => u.id === DEMO_USER_ID)!;
