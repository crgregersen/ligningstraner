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
 {
  name: "expert mode rejects empty input",
  equation: eq(2, 0, 0, 8),
  input: "   ",
  errorMessage: "Tomt input",
 },
 {
  name: "expert mode rejects unrecognized operations",
  equation: eq(2, 0, 0, 8),
  input: "abc",
  errorMessage: "Forstår ikke operationen",
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
  {
   name: "step1 rejects operations that still leave x on the right side",
   equation: eq(2, 3, -2, 4),
   input: "+1x",
   ok: false,
   errorMessage: "Målet i trin1 er at der ikke er noget x på højre side.\nDer er stadig x på højre side.\nPrøv igen.",
  },
  {
   name: "step1 rejects malformed x input",
   equation: eq(2, 3, -1, 4),
   input: "abc",
   ok: false,
   errorMessage: "Skriv noget som -2x eller +3x. Det du skriver bliver lagt til begge sider.",
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
  {
   name: "step2 rejects non-numeric input",
   equation: eq(3, 3, 0, 4),
   input: "abc",
   ok: false,
   errorMessage: "Skriv et tal som -5 eller +7. Det bliver lagt til begge sider.",
  },
  {
   name: "step2 rejects results that still leave a constant on the left side",
   equation: eq(3, 3, 0, 4),
   input: "-2",
   ok: false,
   errorMessage: "Målet i trin2 er at venstre side ikke har noget + tal tilbage.\nDer er stadig et tal på venstre side.\nPrøv igen.",
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
  {
   name: "step3 rejects divide by zero",
   equation: eq(4, 0, 0, 8),
   input: "/0",
   ok: false,
   errorMessage: "Du kan ikke dividere med0.",
  },
  {
   name: "step3 rejects malformed numeric operations",
   equation: eq(4, 0, 0, 8),
   input: "abc",
   ok: false,
   errorMessage: "Skriv fx /4 for at dividere begge sider med4\neller *0.5 for at gange begge sider med0.5.\nHusk: du må kun bruge et tal (ingen x).",
  },
  {
   name: "step3 rejects operations that do not isolate x",
   equation: eq(4, 0, 0, 8),
   input: "/2",
   ok: false,
   errorMessage: "Målet i trin3 er at venstre side kun skal være x.\nVenstre side er ikke kun x endnu.\nPrøv igen.",
  },
 ],
};
