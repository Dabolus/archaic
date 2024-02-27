import test from "ava";
import path from "path";

import archaic from "./main";

const fixturesPath = path.join(__dirname, "media");

const fixtures = ["monalisa.png", "lena.png"];

const shapeTypes = [
  "triangle",
  "ellipse",
  "rotated-ellipse",
  "rectangle",
  "rotated-rectangle",
  "random",
];

fixtures.forEach((fixture) => {
  const input = path.join(fixturesPath, fixture);

  shapeTypes.forEach((shapeType) => {
    test(`${fixture} - ${shapeType}`, async (t) => {
      const model = await archaic({
        input,
        shapeType,
        numSteps: 10,
        numCandidateShapes: 5,
        numCandidateMutations: 30,
        log: console.log.bind(console),
      });

      t.true(model.score < 1);
    });
  });
});
