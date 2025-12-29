/* ====== fælles utilities ====== */
function randInt(min,max){
 return Math.floor(Math.random()*(max-min+1))+min;
}

function almostZero(v){
 return Math.abs(v) <1e-10;
}

function simplifySide(side){
 const xC = almostZero(side.xCoeff) ?0 : side.xCoeff;
 const cT = almostZero(side.constTerm) ?0 : side.constTerm;
 return { xCoeff: xC, constTerm: cT };
}

function gcd(a, b){
 a = Math.abs(a);
 b = Math.abs(b);
 while(b !==0){
 const t = b;
 b = a % b;
 a = t;
 }
 return a;
}

function toFraction(value, maxDen =1000){
 const rounded = Math.round(value);
 if(Math.abs(value - rounded) <1e-10){
 return { num: rounded, den:1 };
 }

 let bestNum =0;
 let bestDen =1;
 let bestErr = Infinity;

 for(let den =1; den <= maxDen; den++){
 const num = Math.round(value * den);
 const approx = num / den;
 const err = Math.abs(approx - value);
 if(err < bestErr -1e-12){
 bestErr = err;
 bestNum = num;
 bestDen = den;
 if(err <1e-10){
 break;
 }
 }
 }

 const g = gcd(bestNum, bestDen);
 bestNum /= g;
 bestDen /= g;

 return { num: bestNum, den: bestDen };
}

function formatMixedNumber(value){
 const frac = toFraction(value);

 const num = frac.num;
 const den = frac.den;

 if(den ===1){
 return num.toString();
 }

 const sign = num <0 ? -1 :1;
 const absNum = Math.abs(num);

 const whole = Math.floor(absNum / den);
 const restNum = absNum % den;

 if(whole ===0){
 return (sign <0 ? "-" : "") + restNum + "/" + den;
 } else {
 return (sign <0 ? "-" : "") + whole + " " + restNum + "/" + den;
 }
}

function formatCoeffTimesX(a){
 if(almostZero(a)){
 return "";
 }
 if(almostZero(a -1)){
 return "x";
 }
 if(almostZero(a +1)){
 return "-x";
 }

 const frac = toFraction(a);
 const num = frac.num;
 const den = frac.den;

 if(den ===1){
 return num.toString() + "x";
 } else {
 return (num.toString() + "/" + den.toString()) + "x";
 }
}

function formatConstWithSign(b, hasXPart){
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
 return signChar === "-" ? ("- " + body) : body;
 }

 return " " + signChar + " " + body;
}

function formatSideAfterOp(side){
 // Brøk-venlig side som bruges i ekspert-mode og i guidet fallback
 const a = side.xCoeff;
 const b = side.constTerm;

 const xPart = formatCoeffTimesX(a);
 const constPart = formatConstWithSign(b, !!xPart);

 if(!xPart){
 return constPart === "" ? "0" : constPart;
 }

 return xPart + constPart;
}

function formatEquationFractionStyle(eq){
 // Brug altid brøk-stilen til at vise hele ligningen
 return formatSideAfterOp(eq.left) + " = " + formatSideAfterOp(eq.right);
}

/* mere "almindelig" formattering - brugt i guidet trin-visning der allerede findes */
function formatSide(side){
 const a = side.xCoeff;
 const b = side.constTerm;
 let parts = [];

 if(!almostZero(a)){
 if(Math.abs(a) ===1){
 parts.push(a === -1 ? "-x" : "x");
 } else {
 parts.push(a + "x");
 }
 }
 if(!almostZero(b)){
 if(parts.length ===0){
 parts.push(b.toString());
 } else {
 if(b >=0){
 parts.push("+ " + b);
 } else {
 parts.push("- " + Math.abs(b));
 }
 }
 }
 if(parts.length ===0){
 return "0";
 }
 return parts.join(" ");
}

function formatEquation(eq){
 return formatSide(eq.left) + " = " + formatSide(eq.right);
}

function formatAddX(k){
 const sign = k >=0 ? "+ " : "- ";
 const absVal = Math.abs(k);
 if(absVal ===1){
 return sign + "x";
 } else {
 return sign + absVal + "x";
 }
}

function formatAddConst(v){
 const sign = v >=0 ? "+ " : "- ";
 const absVal = Math.abs(v);
 return sign + absVal;
}

function sidePlusX(side, k){
 return simplifySide({
 xCoeff: side.xCoeff + k,
 constTerm: side.constTerm
 });
}
function sidePlusConst(side, c){
 return simplifySide({
 xCoeff: side.xCoeff,
 constTerm: side.constTerm + c
 });
}
function divideSide(side, k){
 return simplifySide({
 xCoeff: side.xCoeff / k,
 constTerm: side.constTerm / k
 });
}
function multiplySide(side, k){
 return simplifySide({
 xCoeff: side.xCoeff * k,
 constTerm: side.constTerm * k
 });
}

function evalSide(side, xVal){
 return side.xCoeff * xVal + side.constTerm;
}

function formatSideForSubstitution(side, xStr){
 const a = side.xCoeff;
 const b = side.constTerm;

 let parts = [];

 if(!almostZero(a)){
 if(Math.abs(a) -1 <1e-10){
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
 if(parts.length ===0){
 parts.push(b.toString());
 } else {
 if(b >=0){
 parts.push("+ " + b);
 } else {
 parts.push("- " + Math.abs(b));
 }
 }
 }

 if(parts.length ===0){
 return "0";
 }
 return parts.join(" ");
}

function formatWholeEquation(eq){
 return formatSide(eq.left) + " = " + formatSide(eq.right);
}

function sideCheckLine(side, xStr, valueStr){
 const substituted = formatSideForSubstitution(side, xStr);
 return substituted + " = " + valueStr;
}

function buildWorkText(beforeL, beforeR, opText, newLeft, newRight, mode){
 const lastLineIntro = (mode === "muldiv")
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

function buildWorkTextWithFractions(beforeL,beforeR,opText,newLeft,newRight,mode){
 const leftStrFinal = formatSideAfterOp(newLeft);
 const rightStrFinal = formatSideAfterOp(newRight);

 const lastLineIntro = (mode === "muldiv")
 ? "Efter denne operation står der:\n"
 : "Når vi samler leddene bliver det til:\n";

 return (
 'du udførte flg. operation på begge sider af lighedstegnet: ' +
 '<span class="op">' + opText + '</span>\n\n' +
 'det giver flg. ny ligning:\n' +
 beforeL + ' <span class="op">' + opText + '</span> = ' +
 beforeR + ' <span class="op">' + opText + '</span>\n' +
 lastLineIntro +
 leftStrFinal + ' = ' + rightStrFinal
 );
}

/* ====== DOM refs ====== */
const modeSelect = document.getElementById("modeSelect");
const modeDesc = document.getElementById("modeDesc");

const eqBox = document.getElementById("eqBox");

/* guided refs */
const guidedSection = document.getElementById("guidedSection");
const step1Box = document.getElementById("step1");
const step2Box = document.getElementById("step2");
const step3Box = document.getElementById("step3");

const badge1 = document.getElementById("badge1");
const badge2 = document.getElementById("badge2");
const badge3 = document.getElementById("badge3");

const inputStep1 = document.getElementById("inputStep1");
const btnStep1 = document.getElementById("btnStep1");
const work1 = document.getElementById("work1");
const exp1 = document.getElementById("exp1");
const nextEq1 = document.getElementById("nextEq1");
const nextEq1Label = document.getElementById("nextEq1Label");

const inputStep2 = document.getElementById("inputStep2");
const btnStep2 = document.getElementById("btnStep2");
const work2 = document.getElementById("work2");
const exp2 = document.getElementById("exp2");
const nextEq2 = document.getElementById("nextEq2");
const nextEq2Label = document.getElementById("nextEq2Label");

const inputStep3 = document.getElementById("inputStep3");
const btnStep3 = document.getElementById("btnStep3");
const work3 = document.getElementById("work3");
const exp3 = document.getElementById("exp3");
const nextEq3 = document.getElementById("nextEq3");
const nextEq3Label = document.getElementById("nextEq3Label");

const resultBox = document.getElementById("resultBox");

const checkRow = document.getElementById("checkRow");
const checkWrap = document.getElementById("checkWrap");
const checkBtn = document.getElementById("checkBtn");
const checkWork = document.getElementById("checkWork");
const checkExplain = document.getElementById("checkExplain");
const newProblemAfterCheckBtn = document.getElementById("newProblemAfterCheckBtn");

/* expert refs */
const expertSection = document.getElementById("expertSection");
const expertBadge = document.getElementById("expertBadge");
const expertStepsWrap = document.getElementById("expertStepsWrap");

/* top controls */
const newProblemBtn = document.getElementById("newProblemBtn");
const themeSelect = document.getElementById("themeSelect");
const scoreCountEl = document.getElementById("scoreCount");
const studentNameEl = document.getElementById("studentName");
const extraBtn = document.getElementById("makeCodeBtn");
