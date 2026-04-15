export function randInt(min, max){
 return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function almostZero(v){
 return Math.abs(v) < 1e-10;
}

export function simplifySide(side){
 const xC = almostZero(side.xCoeff) ? 0 : side.xCoeff;
 const cT = almostZero(side.constTerm) ? 0 : side.constTerm;
 return { xCoeff: xC, constTerm: cT };
}

export function gcd(a, b){
 a = Math.abs(a);
 b = Math.abs(b);
 while(b !== 0){
  const t = b;
  b = a % b;
  a = t;
 }
 return a;
}

export function toFraction(value, maxDen = 1000){
 const rounded = Math.round(value);
 if(Math.abs(value - rounded) < 1e-10){
  return { num: rounded, den: 1 };
 }

 let bestNum = 0;
 let bestDen = 1;
 let bestErr = Infinity;

 for(let den = 1; den <= maxDen; den++){
  const num = Math.round(value * den);
  const approx = num / den;
  const err = Math.abs(approx - value);
  if(err < bestErr - 1e-12){
   bestErr = err;
   bestNum = num;
   bestDen = den;
   if(err < 1e-10){
    break;
   }
  }
 }

 const g = gcd(bestNum, bestDen);
 bestNum /= g;
 bestDen /= g;

 return { num: bestNum, den: bestDen };
}

export function formatMixedNumber(value){
 const frac = toFraction(value);
 const num = frac.num;
 const den = frac.den;

 if(den === 1){
  return num.toString();
 }

 const sign = num < 0 ? -1 : 1;
 const absNum = Math.abs(num);
 const whole = Math.floor(absNum / den);
 const restNum = absNum % den;

 if(whole === 0){
  return (sign < 0 ? "-" : "") + restNum + "/" + den;
 }

 return (sign < 0 ? "-" : "") + whole + " " + restNum + "/" + den;
}

export function formatCoeffTimesX(a){
 if(almostZero(a)){
  return "";
 }
 if(almostZero(a - 1)){
  return "x";
 }
 if(almostZero(a + 1)){
  return "-x";
 }

 const frac = toFraction(a);
 if(frac.den === 1){
  return frac.num.toString() + "x";
 }
 return frac.num.toString() + "/" + frac.den.toString() + "x";
}

export function formatConstWithSign(b, hasXPart){
 if(almostZero(b)){
  return "";
 }

 const mixed = formatMixedNumber(b);
 let signChar = "";
 let body = "";
 if(mixed[0] === "-"){
  signChar = "-";
  body = mixed.slice(1);
 } else {
  signChar = "+";
  body = mixed;
 }

 if(!hasXPart){
  return signChar === "-" ? "- " + body : body;
 }

 return " " + signChar + " " + body;
}

export function formatSideAfterOp(side){
 const xPart = formatCoeffTimesX(side.xCoeff);
 const constPart = formatConstWithSign(side.constTerm, !!xPart);

 if(!xPart){
  return constPart === "" ? "0" : constPart;
 }

 return xPart + constPart;
}

export function formatEquationFractionStyle(eq){
 return formatSideAfterOp(eq.left) + " = " + formatSideAfterOp(eq.right);
}

export function formatSide(side){
 const a = side.xCoeff;
 const b = side.constTerm;
 const parts = [];

 if(!almostZero(a)){
  if(Math.abs(a) === 1){
   parts.push(a === -1 ? "-x" : "x");
  } else {
   parts.push(a + "x");
  }
 }
 if(!almostZero(b)){
  if(parts.length === 0){
   parts.push(b.toString());
  } else if(b >= 0){
   parts.push("+ " + b);
  } else {
   parts.push("- " + Math.abs(b));
  }
 }
 if(parts.length === 0){
  return "0";
 }
 return parts.join(" ");
}

export function formatEquation(eq){
 return formatSide(eq.left) + " = " + formatSide(eq.right);
}

export function formatAddX(k){
 const sign = k >= 0 ? "+ " : "- ";
 const absVal = Math.abs(k);
 return absVal === 1 ? sign + "x" : sign + absVal + "x";
}

export function formatAddConst(v){
 const sign = v >= 0 ? "+ " : "- ";
 return sign + Math.abs(v);
}

export function sidePlusX(side, k){
 return simplifySide({
  xCoeff: side.xCoeff + k,
  constTerm: side.constTerm,
 });
}

export function sidePlusConst(side, c){
 return simplifySide({
  xCoeff: side.xCoeff,
  constTerm: side.constTerm + c,
 });
}

export function divideSide(side, k){
 return simplifySide({
  xCoeff: side.xCoeff / k,
  constTerm: side.constTerm / k,
 });
}

export function multiplySide(side, k){
 return simplifySide({
  xCoeff: side.xCoeff * k,
  constTerm: side.constTerm * k,
 });
}

export function evalSide(side, xVal){
 return side.xCoeff * xVal + side.constTerm;
}

export function formatSideForSubstitution(side, xStr){
 const a = side.xCoeff;
 const b = side.constTerm;
 const parts = [];

 if(!almostZero(a)){
  if(Math.abs(a) - 1 < 1e-10){
   if(a === -1){
    parts.push("-(" + xStr + ")");
   } else {
    parts.push("(" + xStr + ")");
   }
  } else {
   parts.push(a + "·(" + xStr + ")");
  }
 }

 if(!almostZero(b)){
  if(parts.length === 0){
   parts.push(b.toString());
  } else if(b >= 0){
   parts.push("+ " + b);
  } else {
   parts.push("- " + Math.abs(b));
  }
 }

 if(parts.length === 0){
  return "0";
 }
 return parts.join(" ");
}

export function formatWholeEquation(eq){
 return formatSide(eq.left) + " = " + formatSide(eq.right);
}

export function sideCheckLine(side, xStr, valueStr){
 return formatSideForSubstitution(side, xStr) + " = " + valueStr;
}

export function buildWorkText(beforeL, beforeR, opText, newLeft, newRight, mode){
 const lastLineIntro = mode === "muldiv"
  ? "Efter denne operation står der:\n"
  : "Når vi samler leddene bliver det til:\n";

 return (
  'du udførte flg. operation på begge sider af lighedstegnet: ' +
  '<span class="op">' + opText + '</span>\n\n' +
  'det giver flg. ny ligning:\n' +
  beforeL + ' <span class="op">' + opText + '</span> = ' +
  beforeR + ' <span class="op">' + opText + '</span>\n' +
  lastLineIntro +
  formatSide(newLeft) + ' = ' + formatSide(newRight)
 );
}

export function buildWorkTextWithFractions(beforeL, beforeR, opText, newLeft, newRight, mode){
 const lastLineIntro = mode === "muldiv"
  ? "Efter denne operation står der:\n"
  : "Når vi samler leddene bliver det til:\n";

 return (
  'du udførte flg. operation på begge sider af lighedstegnet: ' +
  '<span class="op">' + opText + '</span>\n\n' +
  'det giver flg. ny ligning:\n' +
  beforeL + ' <span class="op">' + opText + '</span> = ' +
  beforeR + ' <span class="op">' + opText + '</span>\n' +
  lastLineIntro +
  formatSideAfterOp(newLeft) + ' = ' + formatSideAfterOp(newRight)
 );
}

export function makeRandomEquation(){
 let a = randInt(-5, 5);
 while(a === 0){
  a = randInt(-5, 5);
 }

 let c = randInt(-5, 5);
 while(c === 0 || c === a){
  c = randInt(-5, 5);
 }

 const bVal = randInt(-9, 9);
 const dVal = randInt(-9, 9);

 return {
  left: { xCoeff: a, constTerm: bVal },
  right: { xCoeff: c, constTerm: dVal },
 };
}

export function getSolvedEquationInfo(eq){
 const solvedLeftIsX =
  almostZero(eq.left.constTerm) &&
  almostZero(eq.left.xCoeff - 1) &&
  almostZero(eq.right.xCoeff);

 const solvedRightIsX =
  almostZero(eq.right.constTerm) &&
  almostZero(eq.right.xCoeff - 1) &&
  almostZero(eq.left.xCoeff);

 const solved = solvedLeftIsX || solvedRightIsX;
 const finalX = solved
  ? (solvedLeftIsX ? eq.right.constTerm : eq.left.constTerm)
  : null;

 return {
  solved,
  solvedLeftIsX,
  solvedRightIsX,
  finalX,
 };
}

function buildEquation(left, right){
 return { left, right };
}

export function evaluateExpertOperation(eq, rawInput){
 const rawTrim = rawInput.trim();
 if(!rawTrim){
  return { ok: false, errorMessage: "Tomt input" };
 }

 const compact = rawTrim.replace(/\s+/g, "");
 let newEquation = null;
 let opTextHuman = "";
 let modeKind = "addsub";

 const tryX = compact.match(/^([+\-]?)(\d*)x$/i);
 if(tryX){
  let k;
  if(tryX[2] === ""){
   k = tryX[1] === "-" ? -1 : 1;
  } else {
   k = Number(tryX[2]);
   if(tryX[1] === "-"){
    k = -k;
   }
  }
  newEquation = buildEquation(
   sidePlusX(eq.left, k),
   sidePlusX(eq.right, k)
  );
  opTextHuman = formatAddX(k);
 } else {
  const maybeNum = Number(compact);
  if(!Number.isNaN(maybeNum)){
   newEquation = buildEquation(
    sidePlusConst(eq.left, maybeNum),
    sidePlusConst(eq.right, maybeNum)
   );
   opTextHuman = formatAddConst(maybeNum);
  } else {
   const divMatch = rawTrim.match(/^([/:])\s*(-?\d+(\.\d+)?)$/);
   if(divMatch){
    const k = Number(divMatch[2]);
    if(Number.isNaN(k) || almostZero(k)){
     return { ok: false, errorMessage: "Du kan ikke dividere med0" };
    }
    newEquation = buildEquation(
     divideSide(eq.left, k),
     divideSide(eq.right, k)
    );
    opTextHuman = "/ " + k;
    modeKind = "muldiv";
   } else {
    const mulMatch = rawTrim.match(/^\*\s*(-?\d+(\.\d+)?)$/);
    if(!mulMatch){
     return { ok: false, errorMessage: "Forstår ikke operationen" };
    }
    const k = Number(mulMatch[1]);
    if(Number.isNaN(k)){
     return { ok: false, errorMessage: "Kun tal efter *" };
    }
    newEquation = buildEquation(
     multiplySide(eq.left, k),
     multiplySide(eq.right, k)
    );
    opTextHuman = "* " + k;
    modeKind = "muldiv";
   }
  }
 }

 const beforeL = formatSideAfterOp(eq.left);
 const beforeR = formatSideAfterOp(eq.right);

 return {
  ok: true,
  newEquation,
  opTextHuman,
  modeKind,
  explainHTML: buildWorkTextWithFractions(
   beforeL,
   beforeR,
   opTextHuman,
   newEquation.left,
   newEquation.right,
   modeKind
  ),
  solvedInfo: getSolvedEquationInfo(newEquation),
 };
}

export function evaluateGuidedStep1(eq, rawInput){
 const raw = rawInput.trim().replace(/\s+/g, "");

 if(/^[-+]?\d+(\.\d+)?$/.test(raw)){
  return {
   ok: false,
   errorMessage: "Du skal skrive en +kx eller -kx operation, hvor k er et tal. Eksempel: -2x eller +3x.",
   workText: "",
  };
 }

 const match = raw.match(/^([+\-]?)((\d*)x)$/i);
 if(!match){
  return {
   ok: false,
   errorMessage: "Skriv noget som -2x eller +3x. Det du skriver bliver lagt til begge sider.",
   workText: "",
  };
 }

 let k;
 if(match[2].replace(/x/i, "").replace(/^\s*$/, "") === ""){
  k = match[1] === "-" ? -1 : 1;
 } else {
  k = Number(match[2].replace(/x/i, ""));
  if(match[1] === "-"){
   k = -k;
  }
 }

 const newEquation = buildEquation(
  sidePlusX(eq.left, k),
  sidePlusX(eq.right, k)
 );

 const workText = buildWorkTextWithFractions(
  formatSide(eq.left),
  formatSide(eq.right),
  formatAddX(k),
  newEquation.left,
  newEquation.right,
  "addsub"
 );

 if(!almostZero(newEquation.right.xCoeff)){
  return {
   ok: false,
   errorMessage: "Målet i trin1 er at der ikke er noget x på højre side.\nDer er stadig x på højre side.\nPrøv igen.",
   workText,
  };
 }

 const leftIsJustX =
  almostZero(newEquation.left.constTerm) &&
  almostZero(newEquation.left.xCoeff - 1);
 const leftHasNoConst = almostZero(newEquation.left.constTerm);

 if(leftIsJustX){
  return {
   ok: true,
   status: "solved",
   newEquation,
   finalX: newEquation.right.constTerm,
   workText,
  };
 }

 if(leftHasNoConst){
  return {
   ok: true,
   status: "advance-step3",
   newEquation,
   workText,
  };
 }

 return {
  ok: true,
  status: "advance-step2",
  newEquation,
  workText,
 };
}

export function evaluateGuidedStep2(eq, rawInput){
 const raw = rawInput.trim().replace(/\s+/g, "");
 const num = Number(raw);

 if(Number.isNaN(num)){
  return {
   ok: false,
   errorMessage: "Skriv et tal som -5 eller +7. Det bliver lagt til begge sider.",
   workText: "",
  };
 }

 const newEquation = buildEquation(
  sidePlusConst(eq.left, num),
  sidePlusConst(eq.right, num)
 );

 const workText = buildWorkTextWithFractions(
  formatSide(eq.left),
  formatSide(eq.right),
  formatAddConst(num),
  newEquation.left,
  newEquation.right,
  "addsub"
 );

 if(!almostZero(newEquation.left.constTerm)){
  return {
   ok: false,
   errorMessage: "Målet i trin2 er at venstre side ikke har noget + tal tilbage.\nDer er stadig et tal på venstre side.\nPrøv igen.",
   workText,
  };
 }

 if(almostZero(newEquation.left.xCoeff - 1)){
  return {
   ok: true,
   status: "solved",
   newEquation,
   finalX: newEquation.right.constTerm,
   workText,
  };
 }

 return {
  ok: true,
  status: "advance-step3",
  newEquation,
  workText,
 };
}

export function evaluateGuidedStep3(eq, rawInput){
 const raw = rawInput.trim();
 const wrongX = raw.match(/^([/:*])\s*(-?\d+(\.\d+)?x|x|\d*x)$/i);
 if(wrongX){
  const coeff = eq.left.xCoeff;
  return {
   ok: false,
   errorMessage:
    "Du skrev " + raw + ".\nHer skal du kun bruge tallet foran x (altså " + coeff + ") og ikke hele '" +
    coeff + "x'.\nEksempel: /" + coeff + " eller *" + (1 / coeff) + ".",
   workText: "",
  };
 }

 let opKind = null;
 let k = null;

 const matchDiv = raw.match(/^([/:])\s*(-?\d+(\.\d+)?)$/);
 if(matchDiv){
  opKind = "div";
  k = Number(matchDiv[2]);
  if(Number.isNaN(k) || almostZero(k)){
   return {
    ok: false,
    errorMessage: "Du kan ikke dividere med0.",
    workText: "",
   };
  }
 } else {
  const matchMul = raw.match(/^\*\s*(-?\d+(\.\d+)?)$/);
  if(!matchMul){
   return {
    ok: false,
    errorMessage: "Skriv fx /4 for at dividere begge sider med4\neller *0.5 for at gange begge sider med0.5.\nHusk: du må kun bruge et tal (ingen x).",
    workText: "",
   };
  }

  opKind = "mul";
  k = Number(matchMul[1]);
  if(Number.isNaN(k)){
   return {
    ok: false,
    errorMessage: "For at gange skriver du fx *0.5 eller *-1 (kun tal).",
    workText: "",
   };
  }
 }

 const newEquation = opKind === "div"
  ? buildEquation(divideSide(eq.left, k), divideSide(eq.right, k))
  : buildEquation(multiplySide(eq.left, k), multiplySide(eq.right, k));

 const workText = buildWorkTextWithFractions(
  formatSide(eq.left),
  formatSide(eq.right),
  opKind === "div" ? "/ " + k : "* " + k,
  newEquation.left,
  newEquation.right,
  "muldiv"
 );

 if(
  !almostZero(newEquation.left.constTerm) ||
  !almostZero(newEquation.left.xCoeff - 1)
 ){
  return {
   ok: false,
   errorMessage: "Målet i trin3 er at venstre side kun skal være x.\nVenstre side er ikke kun x endnu.\nPrøv igen.",
   workText,
  };
 }

 return {
  ok: true,
  status: "solved",
  newEquation,
  finalX: newEquation.right.constTerm,
  workText,
 };
}
