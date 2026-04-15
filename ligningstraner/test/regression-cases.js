export function eq(leftX, leftConst, rightX, rightConst){
 return {
  left: { xCoeff: leftX, constTerm: leftConst },
  right: { xCoeff: rightX, constTerm: rightConst },
 };
}

export const solvedStateCases = [
 {
  name: "x equals a constant is solved",
  equation: eq(1, 0, 0, -5),
  solved: true,
  finalX: -5,
 },
 {
  name: "constant equals x is solved",
  equation: eq(0, 5, 1, 0),
  solved: true,
  finalX: 5,
 },
 {
  name: "x equals an expression with x is not solved",
  equation: eq(1, 0, -2, -5),
  solved: false,
  finalX: null,
 },
];

export const expertOperationCases = [
 {
  name: "user-reported -9 case stays unsolved",
  equation: eq(1, 9, -2, 4),
  input: "-9",
  expectedEquation: eq(1, 0, -2, -5),
  solved: false,
  finalX: null,
 },
 {
  name: "expert mode accepts constant equals x",
  equation: eq(0, 5, 1, 0),
  input: "+0",
  expectedEquation: eq(0, 5, 1, 0),
  solved: true,
  finalX: 5,
 },
  {
  name: "division by zero is rejected",
  equation: eq(2, 0, 0, 8),
  input: "/0",
  errorMessage: "Du kan ikke dividere med0",
 },
];

export const guidedStepCases = {
 step1: [
  {
   name: "step1 rejects constant-only input",
   equation: eq(2, 3, -1, 4),
   input: "-5",
   ok: false,
   errorMessage: "Du skal skrive en +kx eller -kx operation, hvor k er et tal. Eksempel: -2x eller +3x.",
  },
  {
   name: "step1 can solve immediately",
   equation: eq(2, 0, 1, 5),
   input: "-1x",
   ok: true,
   status: "solved",
   expectedEquation: eq(1, 0, 0, 5),
   finalX: 5,
  },
  {
   name: "step1 can skip directly to step3",
   equation: eq(3, 0, 1, 5),
   input: "-1x",
   ok: true,
   status: "advance-step3",
   expectedEquation: eq(2, 0, 0, 5),
  },
 ],
 step2: [
  {
   name: "step2 can enable step3 path",
   equation: eq(3, 3, 0, 4),
   input: "-3",
   ok: true,
   status: "advance-step3",
   expectedEquation: eq(3, 0, 0, 1),
  },
  {
   name: "step2 can solve immediately",
   equation: eq(1, 3, 0, 4),
   input: "-3",
   ok: true,
   status: "solved",
   expectedEquation: eq(1, 0, 0, 1),
   finalX: 1,
  },
 ],
 step3: [
  {
   name: "step3 rejects x in divisor or multiplier",
   equation: eq(4, 0, 0, 8),
   input: "/4x",
   ok: false,
   errorMessage:
    "Du skrev /4x.\nHer skal du kun bruge tallet foran x (altså 4) og ikke hele '4x'.\nEksempel: /4 eller *0.25.",
  },
  {
   name: "step3 supports fractional solutions",
   equation: eq(3, 0, 0, -5),
   input: "/3",
   ok: true,
   status: "solved",
   expectedEquation: eq(1, 0, 0, -5 / 3),
   finalX: -5 / 3,
  },
 ],
};
