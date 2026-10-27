import { describe, expect, it } from "vitest";
import { describeRelationship } from "./relationship";
import { layoutTree } from "./layout";
import { DEMO_STORE } from "./demoFamily";

describe("demo family", () => {
  it("lays out without dropping anyone", () => {
    const positions = layoutTree(DEMO_STORE.people, DEMO_STORE.relationships);
    expect(positions.size).toBe(DEMO_STORE.people.length);
  });

  it("names Jordan as Carlos's child and Miguel's grandchild", () => {
    const people = DEMO_STORE.people;
    const rels = DEMO_STORE.relationships;
    expect(describeRelationship("carlos", "jordan", people, rels).aTerm).toBe("father");
    expect(describeRelationship("miguel", "jordan", people, rels).aTerm).toMatch(
      /grandfather|grandparent/
    );
  });
});
