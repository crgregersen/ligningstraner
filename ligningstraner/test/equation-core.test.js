import { describe, expect, it } from "vitest";

import {
 evaluateExpertOperation,
 evaluateGuidedStep1,
 evaluateGuidedStep2,
 evaluateGuidedStep3,
 formatEquationFractionStyle,
 formatMixedNumber,
 getSolvedEquationInfo,
} from "../equation-core.js";
import {
 expertOperationCases,
 guidedStepCases,
 solvedStateCases,
 eq,
} from "./regression-cases.js";

describe("solved-state regressions", () => {
 for(const testCase of solvedStateCases){
  it(testCase.name, () => {
   expect(getSolvedEquationInfo(testCase.equation)).toMatchObject({
    solved: testCase.solved,
    finalX: testCase.finalX,
   });
  });
 }
});

describe("expert operation regressions", () => {
 for(const testCase of expertOperationCases){
  it(testCase.name, () => {
   const result = evaluateExpertOperation(testCase.equation, testCase.input);

   if(testCase.errorMessage){
    expect(result).toMatchObject({
     ok: false,
     errorMessage: testCase.errorMessage,
    });
    return;
   }

   expect(result.ok).toBe(true);
   expect(result.newEquation).toEqual(testCase.expectedEquation);
   expect(result.solvedInfo).toMatchObject({
    solved: testCase.solved,
    finalX: testCase.finalX,
   });
  });
 }
});

describe("guided step regressions", () => {
 for(const testCase of guidedStepCases.step1){
  it(testCase.name, () => {
   const result = evaluateGuidedStep1(testCase.equation, testCase.input);
   expect(result.ok).toBe(testCase.ok);

   if(!testCase.ok){
    expect(result.errorMessage).toBe(testCase.errorMessage);
    return;
   }

   expect(result.status).toBe(testCase.status);
   expect(result.newEquation).toEqual(testCase.expectedEquation);
   if("finalX" in testCase){
    expect(result.finalX).toBe(testCase.finalX);
   }
  });
 }

 for(const testCase of guidedStepCases.step2){
  it(testCase.name, () => {
   const result = evaluateGuidedStep2(testCase.equation, testCase.input);
   expect(result.ok).toBe(testCase.ok);
   expect(result.status).toBe(testCase.status);
   expect(result.newEquation).toEqual(testCase.expectedEquation);
   if("finalX" in testCase){
    expect(result.finalX).toBe(testCase.finalX);
   }
  });
 }

 for(const testCase of guidedStepCases.step3){
  it(testCase.name, () => {
   const result = evaluateGuidedStep3(testCase.equation, testCase.input);
   expect(result.ok).toBe(testCase.ok);

   if(!testCase.ok){
    expect(result.errorMessage).toBe(testCase.errorMessage);
    return;
   }

   expect(result.status).toBe(testCase.status);
   expect(result.newEquation).toEqual(testCase.expectedEquation);
   expect(result.finalX).toBe(testCase.finalX);
  });
 }
});

describe("formatting regressions", () => {
 it("renders fraction-style equations consistently", () => {
  expect(
   formatEquationFractionStyle(eq(0.5, 0.75, -1, -5))
  ).toBe("1/2x + 3/4 = -x - 5");
 });

 it("formats mixed-number solutions for fractions", () => {
  expect(formatMixedNumber(-5 / 3)).toBe("-1 2/3");
 });
});
