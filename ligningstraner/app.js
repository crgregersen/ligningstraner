
import {
 evalSide,
 evaluateExpertOperation,
 evaluateGuidedStep1,
 evaluateGuidedStep2,
 evaluateGuidedStep3,
 formatEquation,
 formatEquationFractionStyle,
 formatMixedNumber,
 formatSide,
 formatWholeEquation,
 makeRandomEquation,
 sideCheckLine,
} from "./equation-core.js";

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

// Modal refs
const solutionModal = document.getElementById("solutionModal");
const modalName = document.getElementById("modalName");
const modalGenerateBtn = document.getElementById("modalGenerateBtn");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalOutput = document.getElementById("modalOutput");

/* helpers til scrolling/fokus */
function focusAndScroll(inputEl, sectionEl){
 sectionEl.scrollIntoView({
 behavior: "smooth",
 block: "start"
 });
 inputEl.focus();
}
function justScroll(sectionEl){
 sectionEl.scrollIntoView({
 behavior: "smooth",
 block: "start"
 });
}

/* theme helper */
function applyTheme(themeName){
 document.documentElement.setAttribute("data-theme", themeName);
 try{
 localStorage.setItem("ligningstraener-theme", themeName);
 }catch(e){}
}

/* ====== app state ====== */
let solvedCount = 0;
let currentProblemAlreadyCounted = false;

/* guided-mode state */
let equation;
let afterStep1;
let afterStep2;
let finalSolutionValue = null;

/* expert-mode state */
let expertEq;
let expertSolved = false;
let expertOriginal = null;
let expertFinalValue = null;

/* billet hashing */
const xz = "k9J2p_4f8zQ";
function h1(q){
 let h =0;
 for(let i=0; i<q.length; i++){
 h = (h*131 + q.charCodeAt(i)) %1000000007;
 }
 return h.toString(16);
}

function buildTicket(name, solved){
 const n = name.trim();
 const s = solved;
 if(!n){
 return { ok:false, message:"Skriv dit navn først" };
 }
 const p1 = n + ":" + s;
 const p2 = h1(p1 + ":" + xz);
 const out = p1 + ":" + p2;
 return { ok:true, code: out };
}

function openModal(){
 solutionModal.classList.remove("hidden");
 solutionModal.setAttribute("aria-hidden","false");
 modalName.value = studentNameEl.value.trim();
 modalOutput.textContent = "";
 modalName.focus();
}
function closeModal(){
 solutionModal.classList.add("hidden");
 solutionModal.setAttribute("aria-hidden","true");
}
function handleGenerate(){
 const res = buildTicket(modalName.value, solvedCount);
 modalOutput.textContent = res.ok ? res.code : res.message;
}

function markSolvedOnce(){
 if(currentProblemAlreadyCounted) return;
 currentProblemAlreadyCounted = true;
 solvedCount +=1;
 scoreCountEl.textContent = solvedCount;
}

/* ====== Mode UI ====== */
function setModeDesc(mode){
 if(mode === "guided"){
 modeDesc.textContent =
"Guidet mode:\n Der er mange måder at løse en ligning på.\nI denne træner følger vi altid de samme 3 trin.\n1. Isoler x-led til venstre side.\n2. Isoler tal-led til højre side.\n3. Gør x alene.";
 } else {
 modeDesc.textContent =
"Ekspert mode:\nDu laver selv skridt på begge sider.\nHvert skridt bliver forklaret ligesom i trin-arbejdet.\nMålet er x = tal (vises som brøk hvis nødvendigt).";
 }
}

function showMode(mode){
 if(mode === "guided"){
 guidedSection.classList.remove("hidden");
 expertSection.classList.add("hidden");
 } else {
 guidedSection.classList.add("hidden");
 expertSection.classList.remove("hidden");
 }
 setModeDesc(mode);
}

/* ====== GUIDED RESET ====== */
function resetGuidedUI(){
 badge1.textContent = "I gang";
 badge1.className = "status";

 badge2.textContent = "Låst";
 badge2.className = "status";

 badge3.textContent = "Låst";
 badge3.className = "status";

 step1Box.classList.remove("hidden");
 step2Box.classList.add("hidden");
 step3Box.classList.add("hidden");

 inputStep1.disabled = false;
 btnStep1.disabled = false;

 inputStep2.disabled = true;
 btnStep2.disabled = true;

 inputStep3.disabled = true;
 btnStep3.disabled = true;

 inputStep1.value = "";
 inputStep2.value = "";
 inputStep3.value = "";

 work1.textContent = "";
 work2.textContent = "";
 work3.textContent = "";
 exp1.textContent = "";
 exp2.textContent = "";
 exp3.textContent = "";

 work1.classList.add("hidden");
 work2.classList.add("hidden");
 work3.classList.add("hidden");
 exp1.classList.add("hidden");
 exp2.classList.add("hidden");
 exp3.classList.add("hidden");

 resultBox.textContent = "";

 nextEq1.textContent = "";
 nextEq1.className = "miniEqBoxBase boxTask hidden";
 nextEq1Label.classList.add("hidden");

 nextEq2.textContent = "";
 nextEq2.className = "miniEqBoxBase boxTask hidden";
 nextEq2Label.classList.add("hidden");

 nextEq3.textContent = "";
 nextEq3.className = "miniEqBoxBase boxTask hidden";
 nextEq3Label.classList.add("hidden");

 checkBtn.disabled = true;
 checkWrap.classList.add("hidden");
 checkRow.classList.add("hidden");
 checkWork.textContent = "";
 checkExplain.textContent = "";
 finalSolutionValue = null;
}

/* ====== EXPERT RESET ====== */
function resetExpertUI(){
 expertBadge.textContent = "I gang";
 expertBadge.className = "status";
 expertSolved = false;
 expertFinalValue = null;
 expertOriginal = null;

 expertStepsWrap.innerHTML = "";
}

/* ====== Byg et nyt expert-stepkort ====== */
function createExpertStepCard(currentEq){
 const card = document.createElement("div");
 card.className = "expertStepCard";

 // Aktuel ligning (brøk-format)
 const eqLabel = document.createElement("div");
 eqLabel.className = "miniEqWrapLabel";
 eqLabel.textContent = "Den ligning du arbejder på nu:";
 card.appendChild(eqLabel);

 const eqNow = document.createElement("div");
 eqNow.className = "expertEqNow";
 eqNow.textContent = formatEquationFractionStyle(currentEq);
 card.appendChild(eqNow);

 // input række
 const row = document.createElement("div");
 row.className = "answerRow";

 const opLabel = document.createElement("label");
 opLabel.textContent = "Hvad gør du på begge sider?";
 row.appendChild(opLabel);

 const opInput = document.createElement("input");
 opInput.placeholder = "-3x, +5, /4, *0.5";
 row.appendChild(opInput);

 const opBtn = document.createElement("button");
 opBtn.textContent = "Udfør skridt";
 row.appendChild(opBtn);

 card.appendChild(row);

 // fejl / forklaring / work / nextEq container
 const errorBox = document.createElement("div");
 errorBox.className = "expertError hidden";
 card.appendChild(errorBox);

 const workBox = document.createElement("pre");
 workBox.className = "expertWork hidden";
 card.appendChild(workBox);

 const explainBox = document.createElement("div");
 explainBox.className = "expertExplain hidden";
 card.appendChild(explainBox);

 const nextLabel = document.createElement("div");
 nextLabel.className = "expertNextEqLabel hidden";
 nextLabel.textContent = "Ny ligning:";
 card.appendChild(nextLabel);

 const nextEqBox = document.createElement("div");
 nextEqBox.className = "miniEqBoxBase boxTask hidden";
 card.appendChild(nextEqBox);

 const solutionBox = document.createElement("div");
 solutionBox.className = "expertResultBox hidden";
 card.appendChild(solutionBox);

 let checkRowLocal = null;
 let checkWrapLocal = null;
 let checkWorkLocal = null;
 let checkExplainLocal = null;

 function addExpertCheckUI(finalX){
 if(checkRowLocal) return;

 checkRowLocal = document.createElement("div");
 checkRowLocal.className = "answerRow";
 checkRowLocal.style.marginTop = "1rem";

 const checkBtnLocal = document.createElement("button");
 checkBtnLocal.textContent = "Check løsning";
 checkRowLocal.appendChild(checkBtnLocal);

 // Ny ligning-knap ved siden af Check-knappen
 const newProbLocal = document.createElement("button");
 newProbLocal.textContent = "Ny ligning";
 newProbLocal.style.marginLeft = "0.5rem";
 checkRowLocal.appendChild(newProbLocal);

 card.appendChild(checkRowLocal);

 checkWrapLocal = document.createElement("div");
 checkWrapLocal.className = "";
 checkWrapLocal.style.marginTop = ".5rem";

 checkWorkLocal = document.createElement("pre");
 checkWorkLocal.className = "work";
 checkExplainLocal = document.createElement("div");
 checkExplainLocal.className = "explain";

 checkWrapLocal.appendChild(checkWorkLocal);
 checkWrapLocal.appendChild(checkExplainLocal);
 card.appendChild(checkWrapLocal);

 checkBtnLocal.addEventListener("click", () => {
 const xVal = finalX;
 const Lval = evalSide(expertOriginal.left, xVal);
 const Rval = evalSide(expertOriginal.right, xVal);

 const xStr = formatMixedNumber(xVal);
 const Lstr = formatMixedNumber(Lval);
 const Rstr = formatMixedNumber(Rval);

 const leftSubLine = sideCheckLine(expertOriginal.left , xStr, Lstr);
 const rightSubLine = sideCheckLine(expertOriginal.right, xStr, Rstr);

 checkWorkLocal.textContent =
"Vi sætter x = " + xStr + " ind i den oprindelige ligning:\n" +
 formatWholeEquation(expertOriginal) + "\n\n" +
 "Venstre side bliver:\n" +
 leftSubLine + "\n\n" +
 "Højre side bliver:\n" +
 rightSubLine;

 if(Math.abs(Lval - Rval) <1e-10){
 checkExplainLocal.textContent = "De to sider er ens. Ligningen er opfyldt ✔";
 } else {
 checkExplainLocal.textContent = "De to sider er IKKE ens. Noget gik galt ✖";
 }

 justScroll(checkWrapLocal);
 });

 // bind ny-ligning knappen i expert check-UI
 newProbLocal.addEventListener("click", () => {
 newProblem();
 // focus leveled depending on mode
 if(modeSelect.value === "guided"){
 inputStep1.focus();
 }
 });
 }

 function showError(msg){
 errorBox.textContent = msg;
 errorBox.classList.remove("hidden");
 }

 function runOperation(){
 if(expertSolved) return;
 const stepResult = evaluateExpertOperation(expertEq, opInput.value);
 if(!stepResult.ok){
 showError(stepResult.errorMessage);
 return;
 }

 errorBox.classList.add("hidden");
 workBox.classList.remove("hidden");
 workBox.innerHTML = stepResult.explainHTML;

 // opdatér intern ligning, men IKKE topboksen (den skal vise original)
 expertEq = stepResult.newEquation;

 nextLabel.classList.remove("hidden");
 nextEqBox.classList.remove("hidden");
 nextEqBox.textContent = formatEquationFractionStyle(expertEq);

 opInput.disabled = true;
 opBtn.disabled = true;

 if(stepResult.solvedInfo.solved){
 const finalX = stepResult.solvedInfo.finalX;
 const finalStr = formatMixedNumber(finalX);

 solutionBox.classList.remove("hidden");
 solutionBox.textContent = "x = " + finalStr + " ✔";

 expertBadge.textContent = "Færdig";
 expertBadge.className = "status ok";
 expertSolved = true;
 expertFinalValue = finalX;
 addExpertCheckUI(finalX);
 markSolvedOnce();
 } else {
 spawnNextExpertStep();
 }
 }

 opBtn.addEventListener("click", runOperation);
 opInput.addEventListener("keydown", e => {
 if(e.key === "Enter"){
 runOperation();
 }
 });

 expertStepsWrap.appendChild(card);

 opInput.focus();
 justScroll(card);
}

function spawnNextExpertStep(){
 if(expertSolved) return;
 createExpertStepCard(expertEq);
}

function newProblem(){
 const mode = modeSelect.value;

 currentProblemAlreadyCounted = false;

 if(mode === "guided"){
 equation = makeRandomEquation();
 afterStep1 = null;
 afterStep2 = null;
 finalSolutionValue = null;

 // Vis altid den oprindelige ligning i guidet mode
 eqBox.textContent = formatEquation(equation);

 resetGuidedUI();
 resetExpertUI();

 } else {
 resetExpertUI();
 resetGuidedUI();

 expertEq = makeRandomEquation();
 expertOriginal = JSON.parse(JSON.stringify(expertEq));
 expertSolved = false;
 expertFinalValue = null;

 // Vis den oprindelige ligning i topboksen og lad den forblive uændret
 eqBox.textContent = formatEquationFractionStyle(expertOriginal);

 createExpertStepCard(expertEq);
 }
}

function checkSolution(){
 if(finalSolutionValue === null){
 return;
 }

 checkWrap.classList.remove("hidden");

 const xVal = finalSolutionValue;

 const Lval = evalSide(equation.left, xVal);
 const Rval = evalSide(equation.right, xVal);

 const xStr = formatMixedNumber(xVal);
 const Lstr = formatMixedNumber(Lval);
 const Rstr = formatMixedNumber(Rval);

 const leftSubLine = sideCheckLine(equation.left , xStr, Lstr);
 const rightSubLine = sideCheckLine(equation.right, xStr, Rstr);

 checkWork.textContent =
"Vi sætter x = " + xStr + " ind i den oprindelige ligning:\n" +
 formatWholeEquation(equation) + "\n\n" +
 "Venstre side bliver:\n" +
 leftSubLine + "\n\n" +
 "Højre side bliver:\n" +
 rightSubLine;

 if(Math.abs(Lval - Rval) <1e-10){
 checkExplain.textContent =
 "De to sider er ens. Ligningen er opfyldt ✔";
 } else {
 checkExplain.textContent =
 "De to sider er IKKE ens. Noget gik galt ✖";
 }
}

function finishWithSolution(finalX){
 finalSolutionValue = finalX;
 markSolvedOnce();
 checkBtn.disabled = false;
 checkWrap.classList.add("hidden");
 checkRow.classList.remove("hidden");
}

function doStep1(){
 work1.classList.remove("hidden");
 exp1.classList.remove("hidden");
 const stepResult = evaluateGuidedStep1(equation, inputStep1.value);
 work1.innerHTML = stepResult.workText || "";

 if(!stepResult.ok){
 badge1.textContent = "Prøv igen";
 badge1.className = "status warn";
 exp1.textContent = stepResult.errorMessage;
 nextEq1.className = "miniEqBoxBase boxTask hidden";
 nextEq1Label.classList.add("hidden");
 return;
 }

 const newLeft = stepResult.newEquation.left;
 const newRight = stepResult.newEquation.right;
 afterStep1 = stepResult.newEquation;

 badge1.textContent = "Godt";
 badge1.className = "status ok";
 inputStep1.disabled = true;
 btnStep1.disabled = true;

 if(stepResult.status === "solved"){
 const finalX = stepResult.finalX;
 const finalStr = formatMixedNumber(finalX);

 finishWithSolution(finalX);

 step2Box.classList.remove("hidden");
 badge2.textContent = "Færdig";
 badge2.className = "status ok";
 inputStep2.disabled = true;
 btnStep2.disabled = true;

 work2.classList.remove("hidden");
 exp2.classList.remove("hidden");

 work2.textContent = "x = " + finalStr;
 exp2.textContent =
 "Der er kun x tilbage på venstre side.\nDet betyder at du allerede har løsningen.";
 nextEq2Label.textContent = "Her er din løsning:";
 nextEq2.textContent = "x = " + finalStr;
 nextEq2.className = "miniEqBoxBase boxSolution";
 nextEq2Label.classList.remove("hidden");

 step3Box.classList.remove("hidden");
 badge3.textContent = "Færdig";
 badge3.className = "status ok";
 inputStep3.disabled = true;
 btnStep3.disabled = true;

 work3.classList.remove("hidden");
 exp3.classList.remove("hidden");

 work3.textContent = "x = " + finalStr;
 exp3.textContent =
 "x står alene allerede efter trin1.\nGodt!";
 nextEq3Label.textContent = "Her er din løsning:";
 nextEq3.textContent = "x = " + finalStr;
 nextEq3.className = "miniEqBoxBase boxSolution";
 nextEq3Label.classList.remove("hidden");

 resultBox.textContent = "Løsning: x = " + finalStr;

 nextEq1Label.textContent =
 "Efter dit trin1 får du direkte løsningen:";
 nextEq1.textContent = "x = " + finalStr;
 nextEq1.className = "miniEqBoxBase boxSolution";
 nextEq1Label.classList.remove("hidden");

 afterStep2 = stepResult.newEquation;

 justScroll(checkRow);
 return;
 }

 if(stepResult.status === "advance-step3"){
 step2Box.classList.remove("hidden");
 badge2.textContent = "Færdig";
 badge2.className = "status ok";
 inputStep2.disabled = true;
 btnStep2.disabled = true;

 work2.classList.remove("hidden");
 exp2.classList.remove("hidden");

 work2.textContent =
 formatSide(newLeft) + " = " + formatSide(newRight);
 exp2.textContent =
 "Der er ikke noget + tal på venstre side.\nVenstre side er kun k·x,\nså vi hopper direkte til trin3.";

 nextEq2Label.textContent =
 "Her er din nye ligning som du skal bruge i næste trin:";
 nextEq2.textContent =
 formatSide(newLeft) + " = " + formatSide(newRight);
 nextEq2.className = "miniEqBoxBase boxTask";
 nextEq2Label.classList.remove("hidden");

 step3Box.classList.remove("hidden");
 badge3.textContent = "I gang";
 badge3.className = "status";
 inputStep3.disabled = false;
 btnStep3.disabled = false;

 afterStep2 = stepResult.newEquation;

 exp1.textContent =
 "Nu er der ikke længere noget x på højre side.\nVenstre side er allerede kun k·x,\nså vi hopper direkte til trin3.";

 nextEq1Label.textContent =
 "Her er din nye ligning som du skal bruge i næste trin:";
 nextEq1.textContent =
 formatSide(newLeft) + " = " + formatSide(newRight);
 nextEq1.className = "miniEqBoxBase boxTask";
 nextEq1Label.classList.remove("hidden");

 focusAndScroll(inputStep3, step3Box);
 return;
 }

 step2Box.classList.remove("hidden");
 badge2.textContent = "I gang";
 badge2.className = "status";
 inputStep2.disabled = false;
 btnStep2.disabled = false;

 exp1.textContent =
 "Nu er der ikke længere noget x på højre side.";

 nextEq1Label.textContent =
 "Her er din nye ligning som du skal bruge i næste trin:";
 nextEq1.textContent =
 formatSide(newLeft) + " = " + formatSide(newRight);
 nextEq1.className = "miniEqBoxBase boxTask";
 nextEq1Label.classList.remove("hidden");

 afterStep2 = null;

 focusAndScroll(inputStep2, step2Box);
}

function doStep2(){
 work2.classList.remove("hidden");
 exp2.classList.remove("hidden");
 const stepResult = evaluateGuidedStep2(afterStep1, inputStep2.value);
 work2.innerHTML = stepResult.workText || "";

 if(!stepResult.ok){
 badge2.textContent = "Prøv igen";
 badge2.className = "status warn";
 exp2.textContent = stepResult.errorMessage;
 nextEq2.className = "miniEqBoxBase boxTask hidden";
 nextEq2Label.classList.add("hidden");
 return;
 }

 badge2.textContent = "Godt";
 badge2.className = "status ok";

 inputStep2.disabled = true;
 btnStep2.disabled = true;

 afterStep2 = stepResult.newEquation;
 const newLeft = stepResult.newEquation.left;
 const newRight = stepResult.newEquation.right;

 if(stepResult.status === "solved"){
 const finalX = stepResult.finalX;
 const finalStr = formatMixedNumber(finalX);

 finishWithSolution(finalX);

 step3Box.classList.remove("hidden");
 badge3.textContent = "Færdig";
 badge3.className = "status ok";

 inputStep3.disabled = true;
 btnStep3.disabled = true;

 work3.classList.remove("hidden");
 exp3.classList.remove("hidden");

 work3.textContent = "x = " + finalStr;

 exp2.textContent =
 "Nu står der kun x på venstre side.\nDet betyder at du har løsningen.";

 nextEq2Label.textContent = "Her er din løsning:";
 nextEq2.textContent = "x = " + finalStr;
 nextEq2.className = "miniEqBoxBase boxSolution";
 nextEq2Label.classList.remove("hidden");

 nextEq3Label.textContent = "Her er din løsning:";
 nextEq3.textContent = "x = " + finalStr;
 nextEq3.className = "miniEqBoxBase boxSolution";
 nextEq3Label.classList.remove("hidden");

 resultBox.textContent = "Løsning: x = " + finalStr;

 justScroll(checkRow);
 } else {
 step3Box.classList.remove("hidden");
 badge3.textContent = "I gang";
 badge3.className = "status";

 inputStep3.disabled = false;
 btnStep3.disabled = false;

 exp2.textContent =
 "Nu er der ikke længere noget + tal på venstre side.\nDer står kun k·x på venstre side.\nNu skal du gøre x alene ved at dividere eller ved at gange med et passende tal der gør koefficienten foran x til1.";

 nextEq2Label.textContent =
 "Her er din nye ligning som du skal bruge i næste trin:";
 nextEq2.textContent =
 formatSide(newLeft) + " = " + formatSide(newRight);
 nextEq2.className = "miniEqBoxBase boxTask";
 nextEq2Label.classList.remove("hidden");

 focusAndScroll(inputStep3, step3Box);
 }
}

function doStep3(){
 work3.classList.remove("hidden");
 exp3.classList.remove("hidden");
 const stepResult = evaluateGuidedStep3(afterStep2, inputStep3.value);
 work3.innerHTML = stepResult.workText || "";

 if(!stepResult.ok){
 badge3.textContent = "Prøv igen";
 badge3.className = "status warn";
 exp3.textContent = stepResult.errorMessage;
 nextEq3.className = "miniEqBoxBase boxTask hidden";
 nextEq3Label.classList.add("hidden");
 resultBox.textContent = "";

 checkBtn.disabled = true;
 checkWrap.classList.add("hidden");
 checkRow.classList.add("hidden");
 finalSolutionValue = null;

 return;
 }

 badge3.textContent = "Færdig";
 badge3.className = "status ok";

 inputStep3.disabled = true;
 btnStep3.disabled = true;

 const xValue = stepResult.finalX;
 const finalStr = formatMixedNumber(xValue);

 finishWithSolution(xValue);

 work3.innerHTML +=
 "\nNu står der kun x på venstre side.\nDet betyder:\n" +
 "x = " + finalStr;

 resultBox.textContent = "Løsning: x = " + finalStr;

 exp3.textContent =
 "Nu står der kun x på venstre side.\nDet betyder at du har løsningen.";

 nextEq3Label.textContent = "Her er din løsning:";
 nextEq3.textContent = "x = " + finalStr;
 nextEq3.className = "miniEqBoxBase boxSolution";
 nextEq3Label.classList.remove("hidden");

 justScroll(checkRow);
}

/* ====== events ====== */
btnStep1.addEventListener("click", doStep1);
btnStep2.addEventListener("click", doStep2);
btnStep3.addEventListener("click", doStep3);
checkBtn.addEventListener("click", checkSolution);
if(newProblemAfterCheckBtn){
 newProblemAfterCheckBtn.addEventListener("click", () => {
 newProblem();
 if(modeSelect.value === "guided") inputStep1.focus();
 });
}

inputStep1.addEventListener("keydown", e => { if(e.key==="Enter") doStep1(); });
inputStep2.addEventListener("keydown", e => { if(e.key==="Enter") doStep2(); });
inputStep3.addEventListener("keydown", e => { if(e.key==="Enter") doStep3(); });

modeSelect.addEventListener("change", () => {
 const mode = modeSelect.value;
 showMode(mode);

 if(mode === "guided"){
 if(!equation){
 newProblem();
 } else {
 // I guidet mode vis altid den oprindelige ligning
 eqBox.textContent = formatEquation(equation);
 }
 } else {
 if(!expertEq){
 newProblem();
 } else {
 // I ekspert-mode vis altid den oprindelige ligning i topboksen
 eqBox.textContent = formatEquationFractionStyle(expertOriginal || expertEq);
 }
 }
});

newProblemBtn.addEventListener("click", () => {
 newProblem();
 const mode = modeSelect.value;
 if(mode === "guided"){
 inputStep1.focus();
 }
});

// Modal events
extraBtn.addEventListener("click", openModal);
modalCloseBtn.addEventListener("click", closeModal);
modalGenerateBtn.addEventListener("click", handleGenerate);
modalName.addEventListener("keydown", e => { if(e.key === "Enter") handleGenerate(); });
solutionModal.addEventListener("click", (e) => { if(e.target === solutionModal) closeModal(); });
window.addEventListener("keydown", (e) => { if(e.key === "Escape" && !solutionModal.classList.contains("hidden")) closeModal(); });

themeSelect.addEventListener("change", () => { applyTheme(themeSelect.value); });

(function init(){
 let savedTheme = null;
 try{
 savedTheme = localStorage.getItem("ligningstraener-theme");
 }catch(e){}
 if(savedTheme !== "dark" && savedTheme !== "light"){
 savedTheme = "light";
 }
 applyTheme(savedTheme);
 themeSelect.value = savedTheme;

 showMode(modeSelect.value);

 newProblem();
})();

// ===== Walkthrough (tooltip tour) =====
(function(){
 const tourOverlay = document.getElementById("tourOverlay");
 const tourBox = document.getElementById("tourBox");
 const tourContent = document.getElementById("tourContent");
 const tourPrevBtn = document.getElementById("tourPrevBtn");
 const tourNextBtn = document.getElementById("tourNextBtn");
 const tourCloseBtn = document.getElementById("tourCloseBtn");
 const tutorialBtn = document.getElementById("tutorialBtn");

 const steps = [
 { target: null, text: "Velkommen — dette er en kort gennemgang af Ligningstræneren." },
 { target: "#modeSelect", text: "Her kan du skifte mellem Guidet og Ekspert." },
 { target: "#eqBox", text: "Her vises den originale aktuelle ligning du arbejder med." },
 { target: "#step1 .answerRow", text: "I trin1 justerer du x-led. Skriv et plus eller minus stykke du vil have der sker på begge sider f.eks. -2x og tryk 'Udfør trin1'." },
 { target: "#newProblemBtn", text: "Tryk her for at få en ny ligning hvis du er færdig eller sidder fast." },
 { target: "#makeCodeBtn", text: "Tryk her for at hente en løsningskode du kan give din lærer." }
 ];
 let idx =0;
 let currentHighlighted = null;

 function clearHighlight(){
 if(currentHighlighted){
 currentHighlighted.classList.remove("tourHighlight");
 currentHighlighted = null;
 }
 }
 function highlightTarget(sel){
 clearHighlight();
 if(!sel) return;
 const el = document.querySelector(sel);
 if(!el) return;
 currentHighlighted = el;
 el.classList.add("tourHighlight");
 el.scrollIntoView({ behavior:"smooth", block:"center" });
 }

 function updateStep(){
 const s = steps[idx];
 tourContent.textContent = s.text;
 highlightTarget(s.target);
 tourPrevBtn.style.display = idx ===0 ? "none" : "";
 tourNextBtn.textContent = idx === steps.length -1 ? "Færdig" : "Næste";
 }

 function openTour(){
 idx =0;
 tourOverlay.classList.remove("hidden");
 tourOverlay.setAttribute("aria-hidden","false");
 updateStep();
 }
 function closeTour(){
 tourOverlay.classList.add("hidden");
 tourOverlay.setAttribute("aria-hidden","true");
 clearHighlight();
 }
 function next(){
 if(idx < steps.length -1){
 idx++;
 updateStep();
 } else {
 closeTour();
 }
 }
 function prev(){ if(idx >0){ idx--; updateStep(); } }

 if(tutorialBtn){ tutorialBtn.addEventListener("click", openTour); }
 tourCloseBtn.addEventListener("click", closeTour);
 tourNextBtn.addEventListener("click", next);
 tourPrevBtn.addEventListener("click", prev);
 window.addEventListener("keydown", e=>{ if(e.key==="Escape" && !tourOverlay.classList.contains("hidden")) closeTour(); });
 tourOverlay.addEventListener("click", (e)=>{ if(e.target === tourOverlay) closeTour(); });
})();
