import { derivative, parse } from 'mathjs';

export function validateFunctionSyntax(fStr: string) {
  try {
    if (!fStr.trim()) return { isValid: false, error: "Function cannot be empty." };
    const node = parse(fStr);
    derivative(node, 'x'); // Ensure it can be differentiated
    return { isValid: true, error: "" };
  } catch (e: any) {
    return { isValid: false, error: "Invalid syntax: " + (e.message || "Could not parse function") };
  }
}

export function checkTheoremConditions(fStr: string, a: number, b: number, mode: 'mvt' | 'rolle') {
  let isContinuous = true;
  let isDifferentiable = true;
  let failReason = "";
  let fNode: math.MathNode;
  let fPrimeNode: math.MathNode;

  try {
    fNode = parse(fStr);
    try {
      fPrimeNode = derivative(fNode, 'x');
    } catch {
       return {
        isValid: false,
        reason: "Could not find the derivative of the function.",
        cPoints: [], f_a: 0, f_b: 0, m: 0
      };
    }
  } catch (e: any) {
    return {
      isValid: false,
      reason: "Could not parse function. Please check the syntax.",
      cPoints: [], f_a: 0, f_b: 0, m: 0
    };
  }

  // Ensure 'x' is the independent variable, though others are allowed if constant.
  // Evaluate over interval to check continuity and differentiability
  const steps = 1000;
  for (let i = 0; i <= steps; i++) {
    const x = a + (b - a) * (i / steps);
    try {
      const y = fNode.evaluate({ x });
      // Check for Complex number (math.js returns complex objects for e.g. sqrt(-1))
      if (typeof y !== 'number' || !isFinite(y) || isNaN(y)) {
        isContinuous = false;
        failReason = `Condition not met: Function is discontinuous or undefined within the interval [a, b]. Failed at x ≈ ${x.toFixed(3)}.`;
        break;
      }
    } catch {
      isContinuous = false;
      failReason = `Condition not met: Function could not be evaluated at x ≈ ${x.toFixed(3)}.`;
      break;
    }
  }

  if (!isContinuous) return { isValid: false, reason: failReason, cPoints: [], f_a: 0, f_b: 0, m: 0 };

  for (let i = 1; i < steps; i++) {
    const x = a + (b - a) * (i / steps);
    try {
      const dy = fPrimeNode.evaluate({ x });
      // For things like abs(x), the derivative evaluation might throw or be undefined
      if (typeof dy !== 'number' || !isFinite(dy) || isNaN(dy)) {
        isDifferentiable = false;
        failReason = `Condition not met: Function is not differentiable within the open interval (a, b). Derivative is undefined at x ≈ ${x.toFixed(3)}.`;
        break;
      }
    } catch {
      isDifferentiable = false;
      failReason = `Condition not met: Derivative could not be evaluated at x ≈ ${x.toFixed(3)} (Might not be differentiable).`;
      break;
    }
  }

  if (!isDifferentiable) return { isValid: false, reason: failReason, cPoints: [], f_a: 0, f_b: 0, m: 0 };

  const f_a = fNode.evaluate({ x: a }) as number;
  const f_b = fNode.evaluate({ x: b }) as number;
  let m = 0;

  if (mode === 'rolle') {
    if (Math.abs(f_a - f_b) > 1e-4) {
      return {
        isValid: false,
        reason: `Rolle's Theorem condition not met: f(a) must equal f(b).\nHere f(${a}) = ${f_a.toFixed(3)} and f(${b}) = ${f_b.toFixed(3)}.`,
        cPoints: [], f_a, f_b, m: 0
      };
    }
  } else {
    m = (f_b - f_a) / (b - a);
  }

  const cPoints: number[] = [];
  const searchSteps = 5000;
  let prevDiff = (fPrimeNode.evaluate({ x: a }) as number) - m;
  let isConstantDiff = true;

  for (let i = 1; i <= searchSteps; i++) {
    const x = a + (b - a) * (i / searchSteps);
    const diff = (fPrimeNode.evaluate({ x }) as number) - m;
    
    if (Math.abs(diff) > 1e-4) {
      isConstantDiff = false;
    }
    
    if (prevDiff * diff <= 0 && !isConstantDiff) {
      const xPrev = a + (b - a) * ((i - 1) / searchSteps);
      let c = xPrev;
      if (diff !== prevDiff) {
          c = xPrev - prevDiff * (x - xPrev) / (diff - prevDiff);
      }
      
      if (c > a && c < b) {
          if (!cPoints.some(existing => Math.abs(existing - c) < 1e-3)) {
            cPoints.push(c);
          }
      }
    }
    prevDiff = diff;
  }

  if (isConstantDiff) {
    cPoints.push((a + b) / 2);
  }

  const successReason = mode === 'rolle' 
    ? "All Rolle's Theorem conditions are met:\n1. f(x) is continuous on [a, b]\n2. f(x) is differentiable on (a, b)\n3. f(a) = f(b)"
    : "Both MVT conditions are met:\n1. f(x) is continuous on [a, b]\n2. f(x) is differentiable on (a, b)";

  return {
    isValid: true,
    reason: successReason,
    cPoints,
    f_a,
    f_b,
    m
  };
}
